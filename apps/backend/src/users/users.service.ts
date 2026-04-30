import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
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

  async create(data: any, actorId: string) {
    const { roleIds, companyId, ...userData } = data;

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
