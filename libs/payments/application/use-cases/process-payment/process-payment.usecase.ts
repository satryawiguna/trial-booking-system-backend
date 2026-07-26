import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { IBookingRepository, BookingStatus } from '@app/bookings';
import { PaymentStatus } from '../../../domain';
import {
  ResourceNotFoundException,
  CapacityExceededException,
  DuplicateBookingException,
  InvalidStatusTransitionException,
} from '@app/shared/exceptions';
import { MockPaymentService } from '../../../infrastructure/mock-payment.service';

/**
 * Processes a payment for a booking and confirms it atomically.
 *
 * This combines the old RecordPayment + ConfirmBooking into ONE operation
 * inside a single prisma.$transaction() with pessimistic locking.
 *
 * Flow (atomic):
 *   1. Lock TrialClass row (SELECT ... FOR UPDATE)
 *   2. Validate booking status = PENDING_PAYMENT
 *   3. Validate capacity (count CONFIRMED inside lock)
 *   4. Validate no duplicate CONFIRMED booking
 *   5. Execute mock payment → SUCCESS or FAILED
 *   6. Insert PaymentAttempt
 *   7. Update Booking status → CONFIRMED (success) or PAYMENT_FAILED (failed)
 *   8. COMMIT → lock released
 */
@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    private readonly mockPayment: MockPaymentService,
  ) {}

  async execute(input: { bookingId: string; result?: string }) {
    // Fetch booking metadata outside transaction
    const booking = await this.bookingRepo.findById(input.bookingId);
    if (!booking) {
      throw new ResourceNotFoundException('Booking', input.bookingId);
    }

    // Must be in PENDING_PAYMENT status
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new InvalidStatusTransitionException(
        booking.status,
        'PROCESS_PAYMENT',
      );
    }

    // Execute payment + confirmation in ONE atomic transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Lock the trial class row (pessimistic)
      const lockedRows = await tx.$queryRaw<
        Array<{ id: string; capacity: number }>
      >`
        SELECT id, capacity
        FROM trial_classes
        WHERE id = ${booking.trialClassId}::uuid
        FOR UPDATE
      `;

      if (lockedRows.length === 0) {
        throw new ResourceNotFoundException(
          'Trial class',
          booking.trialClassId,
        );
      }

      // Determine payment outcome
      const paymentResult =
        input.result === 'failed'
          ? PaymentStatus.FAILED
          : await this.mockPayment.process(input.bookingId, input.result);

      // 2. Insert PaymentAttempt
      const payment = await tx.$queryRaw<Array<{ id: string; status: string }>>`
        INSERT INTO payment_attempts (id, booking_id, status, paid_at)
        VALUES (gen_random_uuid(), ${input.bookingId}::uuid, ${paymentResult}, NOW())
        RETURNING id, status
      `;

      if (paymentResult === PaymentStatus.FAILED) {
        // Payment failed: booking stays PENDING_PAYMENT → PAYMENT_FAILED (BR-007)
        await tx.booking.update({
          where: { id: input.bookingId },
          data: { status: BookingStatus.PAYMENT_FAILED },
        });

        return {
          paymentAttemptId: payment[0].id,
          paymentStatus: paymentResult,
          bookingStatus: BookingStatus.PAYMENT_FAILED,
        };
      }

      // Payment SUCCESS — now validate and confirm inside the lock
      // 3. Count CONFIRMED bookings (inside lock)
      const confirmedCount = await tx.booking.count({
        where: {
          trialClassId: booking.trialClassId,
          status: BookingStatus.CONFIRMED,
        },
      });

      if (confirmedCount >= lockedRows[0].capacity) {
        throw new CapacityExceededException();
      }

      // 4. Check duplicate (inside lock)
      const existing = await tx.booking.findFirst({
        where: {
          studentId: booking.studentId,
          trialClassId: booking.trialClassId,
          status: BookingStatus.CONFIRMED,
          id: { not: input.bookingId },
        },
      });

      if (existing) {
        throw new DuplicateBookingException();
      }

      // 5. Confirm the booking
      await tx.booking.update({
        where: { id: input.bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      return {
        paymentAttemptId: payment[0].id,
        paymentStatus: PaymentStatus.SUCCESS,
        bookingStatus: BookingStatus.CONFIRMED,
      };
    });

    return result;
  }
}
