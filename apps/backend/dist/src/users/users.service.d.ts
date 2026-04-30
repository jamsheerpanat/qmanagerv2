import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class UsersService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(): Promise<{
        company: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        phone: string | null;
        email: string;
        createdAt: Date;
        roles: {
            role: {
                id: string;
                name: string;
            };
        }[];
        status: import("@prisma/client").$Enums.UserStatus;
    }[]>;
    create(data: any, actorId: string): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        branchId: string | null;
        passwordHash: string;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    }>;
    update(id: string, data: any, actorId: string): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        branchId: string | null;
        passwordHash: string;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    }>;
}
