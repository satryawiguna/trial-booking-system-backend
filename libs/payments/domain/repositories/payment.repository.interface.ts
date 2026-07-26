import { PaymentAttempt } from '../entities';
import { PaymentStatus } from '../enums';

/**
 * Repository interface for Payment domain.
 */
export interface IPaymentRepository {
  /** Record a payment attempt result. */
  create(data: {
    bookingId: string;
    status: PaymentStatus;
  }): Promise<PaymentAttempt>;
}
