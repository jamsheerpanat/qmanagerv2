"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let RolesService = class RolesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
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
    async createRole(data, actorId) {
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
    async updateRole(id, data, actorId) {
        const { permissionIds, ...roleData } = data;
        const oldRole = await this.prisma.role.findUnique({
            where: { id },
            include: { permissions: true },
        });
        if (!oldRole)
            throw new common_1.NotFoundException('Role not found');
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
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RolesService);
//# sourceMappingURL=roles.service.js.map