import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  ITrialClassRepository,
  TrialClass,
  RosterParticipant,
} from '../../domain';
import { TrialClassMapper } from './trial-class.mapper';

@Injectable()
export class TrialClassRepository implements ITrialClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TrialClass[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        capacity: number;
        start_time: Date;
        created_at: Date;
        confirmed_count: bigint;
      }>
    >`
      SELECT
        tc.id,
        tc.title,
        tc.capacity,
        tc.start_time,
        tc.created_at,
        COUNT(b.id) FILTER (WHERE b.status = 'CONFIRMED')::bigint AS confirmed_count
      FROM trial_classes tc
      LEFT JOIN bookings b ON b.trial_class_id = tc.id
      GROUP BY tc.id
      ORDER BY tc.start_time ASC
    `;

    return rows.map((r) =>
      TrialClassMapper.toDomain({
        id: r.id,
        title: r.title,
        capacity: r.capacity,
        startTime: r.start_time,
        createdAt: r.created_at,
        confirmedCount: r.confirmed_count,
      }),
    );
  }

  async findById(id: string): Promise<TrialClass | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        capacity: number;
        start_time: Date;
        created_at: Date;
        confirmed_count: bigint;
      }>
    >`
      SELECT
        tc.id,
        tc.title,
        tc.capacity,
        tc.start_time,
        tc.created_at,
        COUNT(b.id) FILTER (WHERE b.status = 'CONFIRMED')::bigint AS confirmed_count
      FROM trial_classes tc
      LEFT JOIN bookings b ON b.trial_class_id = tc.id
      WHERE tc.id = ${id}::uuid
      GROUP BY tc.id
    `;

    if (rows.length === 0) return null;

    const r = rows[0];
    return TrialClassMapper.toDomain({
      id: r.id,
      title: r.title,
      capacity: r.capacity,
      startTime: r.start_time,
      createdAt: r.created_at,
      confirmedCount: r.confirmed_count,
    });
  }

  async getRoster(trialClassId: string): Promise<RosterParticipant[]> {
    const rows = await this.prisma.booking.findMany({
      where: {
        trialClassId,
        status: 'CONFIRMED',
      },
      select: {
        id: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((r) => ({
      bookingId: r.id,
      studentId: r.student.id,
      studentName: r.student.name,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
