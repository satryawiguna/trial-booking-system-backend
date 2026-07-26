import { PaymentStatus } from '../enums';

/**
 * PaymentAttempt domain entity — records the outcome of a payment execution.
 */
export class PaymentAttempt {
  constructor(
    public readonly id: string,
    public readonly bookingId: string,
    public readonly status: PaymentStatus,
    public readonly paidAt: Date,
    public readonly createdAt: Date,
  ) {}

  get isSuccessful(): boolean {
    return this.status === PaymentStatus.SUCCESS;
  }
}
