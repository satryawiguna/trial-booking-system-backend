import { DomainException } from './domain.exception';

/**
 * Thrown when a booking status transition is not allowed.
 * Related: BR-009, BR-010, booking-lifecycle.md
 */
export class InvalidStatusTransitionException extends DomainException {
  readonly statusCode = 422;
  readonly errorCode = 'INVALID_STATUS_TRANSITION';

  constructor(currentStatus: string, targetStatus: string) {
    super(
      `Cannot transition booking from "${currentStatus}" to "${targetStatus}".`,
    );
  }
}
