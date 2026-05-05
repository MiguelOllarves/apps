import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Guard that validates the x-tenant-id header matches the JWT token's tenantId.
 * Prevents Tenant A from accessing Tenant B's data.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const headerTenantId = request.headers['x-tenant-id'];

    // If no user in request (unauthenticated endpoint), skip
    if (!user) {
      return true;
    }

    // If x-tenant-id header is provided, it MUST match the JWT
    if (headerTenantId && headerTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Violación de aislamiento: no puedes acceder a datos de otro tenant.'
      );
    }

    // Inject the validated tenantId into headers for downstream use
    if (!headerTenantId && user.tenantId) {
      request.headers['x-tenant-id'] = user.tenantId;
    }

    return true;
  }
}
