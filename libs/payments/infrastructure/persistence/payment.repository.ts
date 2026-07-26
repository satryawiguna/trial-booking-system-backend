import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  IPaymentRepository,
  PaymentAttempt,
  PaymentStatus,
} from '../../domain';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    bookingId: string;
    status: PaymentStatus;
  }): Promise<PaymentAttempt> {
    const row = await this.prisma.paymentAttempt.create({
      data: {
        bookingId: data.bookingId,
        status: data.status,
        paidAt: new Date(),
      },
    });

    return new PaymentAttempt(
      row.id,
      row.bookingId,
      row.status as PaymentStatus,
      row.paidAt,
      row.createdAt,
    );
  }
}
