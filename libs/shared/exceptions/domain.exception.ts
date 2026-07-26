/**
 * Base class for all domain-level exceptions.
 * Each subclass maps to a specific HTTP status code and error code.
 */
export abstract class DomainException extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
