import { BookingStatus } from '../enums';

/**
 * Booking domain entity — the central entity of the Trial Booking domain.
 * Represents a reservation made by a parent for a student.
 */
export class Booking {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly trialClassId: string,
    public readonly status: BookingStatus,
    public readonly confirmedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  /** Whether the booking can be cancelled (BR-009). */
  get canBeCancelled(): boolean {
    return (
      this.status === BookingStatus.PENDING_PAYMENT ||
      this.status === BookingStatus.CONFIRMED
    );
  }
}
