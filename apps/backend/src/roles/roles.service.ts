import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany();
  }

  async createRole(
    data: { name: string; description?: string; permissionIds?: string[] },
    actorId: string,
  ) {
    const { permissionIds, ...roleData } = data;
    const role = await this.prisma.role.create({
      data: {
        ...roleData,
        permissions: permissionIds
          ? {
              create: permissionIds.map((id) => ({ permissionId: id })),
            }
          : undefined,
      },
    });

    await this.audit.logEvent({
      actorId,
      action: 'CREATE',
      module: 'Roles',
      entityType: 'Role',
      entityId: role.id,
      newValue: data,
    });

    return role;
  }

  async updateRole(
    id: string,
    data: { name?: string; description?: string; permissionIds?: string[] },
    actorId: string,
  ) {
    const { permissionIds, ...roleData } = data;

    const oldRole = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!oldRole) throw new NotFoundException('Role not found');

    const updatedRole = await this.prisma.$transaction(async (tx) => {
      if (permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
      }

      return tx.role.update({
        where: { id },
        data: {
          ...roleData,
          ...(permissionIds && {
            permissions: {
              create: permissionIds.map((permId) => ({ permissionId: permId })),
            },
          }),
        },
      });
    });

    await this.audit.logEvent({
      actorId,
      action: 'UPDATE',
      module: 'Roles',
      entityType: 'Role',
      entityId: id,
      oldValue: {
        name: oldRole.name,
        permissions: oldRole.permissions.map((p) => p.permissionId),
      },
      newValue: data,
    });

    return updatedRole;
  }
}
