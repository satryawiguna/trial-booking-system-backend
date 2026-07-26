import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Dummy role guard — reads `x-user-role` header for role-based access.
 *
 * Authentication is out of scope. This guard exists so the frontend
 * can switch between Parent View and Admin View via header.
 *
 * Usage:
 *   @Roles('admin')
 *   @UseGuards(RoleGuard)
 *
 * If no @Roles decorator is present, all roles are allowed.
 * If x-user-role header is missing, defaults to 'parent'.
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction
    }

    const request = context.switchToHttp().getRequest();
    const role = (request.headers['x-user-role'] as string) || 'parent';

    // Attach user info to request for downstream use
    request.user = { role };

    return requiredRoles.includes(role);
  }
}
