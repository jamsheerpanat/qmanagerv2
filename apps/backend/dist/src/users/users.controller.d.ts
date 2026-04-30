import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    create(body: any, req: any): Promise<{
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
    update(id: string, body: any, req: any): Promise<{
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
