import { Booking, BookingStatus } from '../../domain';

/**
 * Maps between Prisma model data and the Booking domain entity.
 */
export class BookingMapper {
  static toDomain(prisma: {
    id: string;
    studentId: string;
    trialClassId: string;
    status: string;
    confirmedAt: Date | null;
    createdAt: Date;
  }): Booking {
    return new Booking(
      prisma.id,
      prisma.studentId,
      prisma.trialClassId,
      prisma.status as BookingStatus,
      prisma.confirmedAt,
      prisma.createdAt,
    );
  }

  static toResponse(booking: Booking) {
    return {
      bookingId: booking.id,
      status: booking.status,
      studentId: booking.studentId,
      trialClassId: booking.trialClassId,
      confirmedAt: booking.confirmedAt?.toISOString() ?? null,
      createdAt: booking.createdAt.toISOString(),
    };
  }
}
