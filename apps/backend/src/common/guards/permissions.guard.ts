import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PermissionsCacheService,
  ResolvedPermissions,
} from '../permissions-cache.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private permissionsCache: PermissionsCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const resolved = await this.resolvePermissions(user.id);
    if (!resolved) {
      return false;
    }

    // Always expose the resolved permissions downstream, including for Super
    // Admins. Publishing the literal ['*'] here used to break every controller
    // that does its own `permissions.includes('x')` check (e.g. the
    // quotations.view_all scoping), because '*' matches no specific action.
    user.permissions = resolved.permissions;
    user.isSuperAdmin = resolved.isSuperAdmin;

    if (resolved.isSuperAdmin) {
      return true;
    }

    const granted = new Set(resolved.permissions);
    const hasPermission = requiredPermissions.every((permission) =>
      granted.has(permission),
    );
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  /**
   * Resolves a user's permission set, reading through the cache. The uncached
   * path is the original four-level join; the cached path costs no queries.
   */
  private async resolvePermissions(
    userId: string,
  ): Promise<ResolvedPermissions | undefined> {
    const cached = this.permissionsCache.get(userId);
    if (cached) return cached;

    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: {
                  select: { permission: { select: { action: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      return undefined;
    }

    const permissions = new Set<string>();
    let isSuperAdmin = false;
    for (const ur of userWithRoles.roles) {
      if (ur.role.name === 'Super Admin') {
        isSuperAdmin = true;
      }
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.action);
      }
    }

    const resolved: ResolvedPermissions = {
      permissions: Array.from(permissions),
      isSuperAdmin,
    };
    this.permissionsCache.set(userId, resolved);
    return resolved;
  }
}
