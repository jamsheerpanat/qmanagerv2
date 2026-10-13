import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

import { PermissionsCacheService } from '../common/permissions-cache.service';
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private permissionsCache: PermissionsCacheService,
  ) {}

  /**
   * Scoped to the caller's company. A Super Admin sees every account, which is
   * the existing behaviour for that role; anyone else holding users.manage
   * previously saw other tenants' users too.
   */
  async findAll(companyId?: string, isSuperAdmin = false) {
    return this.prisma.user.findMany({
      ...(isSuperAdmin || !companyId ? {} : { where: { companyId } }),
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        company: { select: { id: true, name: true } },
        roles: { select: { role: { select: { id: true, name: true } } } },
      },
    });
  }

  async create(data: any, actorId: string, actorCompanyId: string) {
    // companyId is taken from the authenticated caller and the body's copy is
    // discarded: trusting it would let anyone with users.manage create an
    // account inside another company.
    const { roleIds, ...rest } = data;
    // Drop any companyId the caller supplied; the company is the actor's.
    delete rest.companyId;
    const userData = rest;
    const companyId = actorCompanyId;

    // Hash password if provided, otherwise generic default
    const passwordHash = await bcrypt.hash(data.password || 'Welcome@123', 10);
    userData.passwordHash = passwordHash;
    delete userData.password;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        company: { connect: { id: companyId } },
        roles: roleIds
          ? {
              create: roleIds.map((roleId) => ({ roleId })),
            }
          : undefined,
      },
    });

    await this.audit.logEvent({
      actorId,
      action: 'CREATE',
      module: 'Users',
      entityType: 'User',
      entityId: user.id,
      newValue: { name: user.name, email: user.email, roles: roleIds },
    });

    return user;
  }

  async update(id: string, data: any, actorId: string) {
    const { roleIds, password, ...userData } = data;

    // The users screen can edit the account you are signed in as, and an
    // administrator suspending themselves cannot undo it from the interface.
    if (id === actorId && userData.status && userData.status !== 'ACTIVE') {
      throw new BadRequestException(
        'You cannot deactivate the account you are signed in as. Ask another administrator to do it.',
      );
    }

    if (password) {
      userData.passwordHash = await bcrypt.hash(password, 10);
    }

    const oldUser = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!oldUser) throw new NotFoundException('User not found');

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      if (roleIds) {
        await tx.userRole.deleteMany({ where: { userId: id } });
      }

      return tx.user.update({
        where: { id },
        data: {
          ...userData,
          ...(roleIds && {
            roles: {
              create: roleIds.map((roleId) => ({ roleId })),
            },
          }),
        },
      });
    });

    // Role assignments may have changed; drop this user's cached permissions
    // so the next request re-resolves them.
    this.permissionsCache.invalidateUser(id);

    await this.audit.logEvent({
      actorId,
      action: 'UPDATE',
      module: 'Users',
      entityType: 'User',
      entityId: id,
      oldValue: {
        status: oldUser.status,
        roles: oldUser.roles.map((r) => r.roleId),
      },
      newValue: { status: updatedUser.status, roles: roleIds },
    });

    return updatedUser;
  }
}
