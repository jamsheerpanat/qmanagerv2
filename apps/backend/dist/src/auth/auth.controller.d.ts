import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private readonly authService;
    private prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    login(body: any): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refresh(body: any): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: any): Promise<{
        success: boolean;
    }>;
    getProfile(req: any): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        companyId: string;
        branchId: string | null;
        roles: string[];
        permissions: string[];
    }>;
}
