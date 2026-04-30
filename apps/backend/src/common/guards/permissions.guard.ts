import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
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

    // Fetch user permissions
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      return false;
    }

    const userPermissions = new Set<string>();
    for (const ur of userWithRoles.roles) {
      for (const rp of ur.role.permissions) {
        userPermissions.add(rp.permission.action);
      }
    }

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Attach permissions to user object for downstream use if needed
    user.permissions = Array.from(userPermissions);

    return true;
  }
}
