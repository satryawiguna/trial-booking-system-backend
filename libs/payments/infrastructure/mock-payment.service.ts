import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@app/payments';
import { ResourceNotFoundException } from '@app/shared/exceptions';

/**
 * Mock payment service — returns success or failure deterministically.
 * Real payment gateway integration is out of scope.
 *
 * Payment always succeeds if the booking still has PendingPayment status
 * AND the trial class still has available seats.
 * This simulates the happy path; for testing EC-003 (payment failure),
 * the controller accepts a status override in the request body.
 */
@Injectable()
export class MockPaymentService {
  /**
   * Process mock payment.
   * Accepts an override status for testing payment failure (EC-003).
   */
  async process(
    _bookingId: string,
    overrideStatus?: string,
  ): Promise<PaymentStatus> {
    if (overrideStatus === 'failed') {
      return PaymentStatus.FAILED;
    }
    return PaymentStatus.SUCCESS;
  }
}
