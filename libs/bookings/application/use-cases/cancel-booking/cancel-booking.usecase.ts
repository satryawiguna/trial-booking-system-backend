import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { IBookingRepository, BookingStatus } from '../../../domain';
import {
  ResourceNotFoundException,
  InvalidStatusTransitionException,
} from '@app/shared/exceptions';
import { BookingMapper } from '../../../infrastructure/persistence/booking.mapper';

@Injectable()
export class CancelBookingUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject("IBookingRepository") private readonly bookingRepo: IBookingRepository,
  ) {}

  async execute(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await this.bookingRepo.findById(id);

      if (!booking) {
        throw new ResourceNotFoundException('Booking', id);
      }

      // Validate state transition (BR-009, BR-010)
      if (!booking.canBeCancelled) {
        throw new InvalidStatusTransitionException(
          booking.status,
          BookingStatus.CANCELLED,
        );
      }

      const updated = await this.bookingRepo.updateStatus(
        id,
        BookingStatus.CANCELLED,
      );
      return BookingMapper.toResponse(updated);
    });
  }
}
