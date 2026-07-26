import { Booking } from '../entities';

/**
 * Repository interface for Booking domain.
 */
export interface IBookingRepository {
  /** Create a booking in PendingPayment status. */
  create(data: { studentId: string; trialClassId: string }): Promise<Booking>;

  /** Find a booking by ID. */
  findById(id: string): Promise<Booking | null>;

  /** Check if a student already has a confirmed booking for a class. */
  existsConfirmedBooking(
    studentId: string,
    trialClassId: string,
    excludeBookingId?: string,
  ): Promise<boolean>;

  /** Count confirmed bookings for a trial class. */
  countConfirmedByClass(trialClassId: string): Promise<number>;

  /** Update booking status. */
  updateStatus(
    id: string,
    status: Booking['status'],
    confirmedAt?: Date | null,
  ): Promise<Booking>;
}
