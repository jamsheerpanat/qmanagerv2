"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
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
    async create(data, actorId) {
        const { roleIds, companyId, ...userData } = data;
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
    async update(id, data, actorId) {
        const { roleIds, password, ...userData } = data;
        if (password) {
            userData.passwordHash = await bcrypt.hash(password, 10);
        }
        const oldUser = await this.prisma.user.findUnique({
            where: { id },
            include: { roles: true },
        });
        if (!oldUser)
            throw new common_1.NotFoundException('User not found');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map