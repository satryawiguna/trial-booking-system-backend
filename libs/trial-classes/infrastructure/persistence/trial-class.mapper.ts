import { TrialClass } from '../../domain';
import { RosterParticipant } from '../../domain/repositories';

/**
 * Maps between Prisma query results and domain entities / DTOs.
 */
export class TrialClassMapper {
  static toDomain(row: {
    id: string;
    title: string;
    capacity: number;
    startTime: Date;
    createdAt: Date;
    confirmedCount: number | bigint;
  }): TrialClass {
    const count =
      typeof row.confirmedCount === 'bigint'
        ? Number(row.confirmedCount)
        : row.confirmedCount;

    return new TrialClass(
      row.id,
      row.title,
      row.capacity,
      row.startTime,
      row.createdAt,
      count,
    );
  }

  static toListItem(trialClass: TrialClass) {
    return {
      id: trialClass.id,
      title: trialClass.title,
      capacity: trialClass.capacity,
      availableSeats: trialClass.availableSeats,
      startTime: trialClass.startTime.toISOString(),
    };
  }

  static toDetail(trialClass: TrialClass) {
    return {
      id: trialClass.id,
      title: trialClass.title,
      capacity: trialClass.capacity,
      confirmedCount: trialClass.confirmedCount,
      availableSeats: trialClass.availableSeats,
      startTime: trialClass.startTime.toISOString(),
    };
  }

  static toRosterResponse(
    trialClassId: string,
    participants: RosterParticipant[],
  ) {
    return {
      trialClassId,
      participants: participants.map((p) => ({
        bookingId: p.bookingId,
        studentId: p.studentId,
        studentName: p.studentName,
        createdAt: p.createdAt,
      })),
    };
  }
}
