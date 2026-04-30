import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class RolesService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(): Promise<({
        permissions: ({
            permission: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                action: string;
                description: string | null;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    })[]>;
    findAllPermissions(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        action: string;
        description: string | null;
    }[]>;
    createRole(data: {
        name: string;
        description?: string;
        permissionIds?: string[];
    }, actorId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    updateRole(id: string, data: {
        name?: string;
        description?: string;
        permissionIds?: string[];
    }, actorId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
}
