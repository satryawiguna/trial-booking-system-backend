import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator — specify which roles can access a route.
 *
 * @example
 *   @Roles('admin')
 *   @Roles('parent', 'admin')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
