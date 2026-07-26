import { DomainException } from './domain.exception';

/**
 * Thrown when a student already has a confirmed booking for the same trial class.
 * Related: BR-004, INV-003, EC-001
 */
export class DuplicateBookingException extends DomainException {
  readonly statusCode = 409;
  readonly errorCode = 'DUPLICATE_BOOKING';

  constructor(
    message = 'This student already has a confirmed booking for this class.',
  ) {
    super(message);
  }
}
