import { DomainException } from './domain.exception';

/**
 * Thrown when a booking is being confirmed without a successful payment.
 * Related: BR-006, INV-005
 */
export class PaymentRequiredException extends DomainException {
  readonly statusCode = 422;
  readonly errorCode = 'PAYMENT_REQUIRED';

  constructor(
    message = 'A successful payment is required before confirmation.',
  ) {
    super(message);
  }
}
