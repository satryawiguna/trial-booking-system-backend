import { DomainException } from './domain.exception';

/**
 * Thrown when a requested resource is not found.
 */
export class ResourceNotFoundException extends DomainException {
  readonly statusCode = 404;
  readonly errorCode = 'RESOURCE_NOT_FOUND';

  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id "${id}" not found.`
      : `${resource} not found.`;
    super(message);
  }
}
