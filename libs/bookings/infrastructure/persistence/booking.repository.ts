import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { IBookingRepository, Booking, BookingStatus } from '../../domain';
import { BookingMapper } from './booking.mapper';

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    studentId: string;
    trialClassId: string;
  }): Promise<Booking> {
    const row = await this.prisma.booking.create({
      data: {
        studentId: data.studentId,
        trialClassId: data.trialClassId,
        status: BookingStatus.PENDING_PAYMENT,
      },
    });
    return BookingMapper.toDomain(row);
  }

  async findById(id: string): Promise<Booking | null> {
    const row = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!row) return null;
    return BookingMapper.toDomain(row);
  }

  async existsConfirmedBooking(
    studentId: string,
    trialClassId: string,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const where: any = {
      studentId,
      trialClassId,
      status: BookingStatus.CONFIRMED,
    };
    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }
    const count = await this.prisma.booking.count({ where });
    return count > 0;
  }

  async countConfirmedByClass(trialClassId: string): Promise<number> {
    return this.prisma.booking.count({
      where: {
        trialClassId,
        status: BookingStatus.CONFIRMED,
      },
    });
  }

  async updateStatus(
    id: string,
    status: Booking['status'],
    confirmedAt?: Date | null,
  ): Promise<Booking> {
    const row = await this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(confirmedAt !== undefined ? { confirmedAt } : {}),
      },
    });
    return BookingMapper.toDomain(row);
  }
}
