import { DomainException } from './domain.exception';

/**
 * Thrown when a trial class has reached its maximum capacity (4 confirmed).
 * Related: BR-013, INV-001, EC-002
 */
export class CapacityExceededException extends DomainException {
  readonly statusCode = 409;
  readonly errorCode = 'CAPACITY_EXCEEDED';

  constructor(message = 'This class is full. No seats available.') {
    super(message);
  }
}
