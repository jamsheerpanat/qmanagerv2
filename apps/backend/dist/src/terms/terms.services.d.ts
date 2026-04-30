import { PrismaService } from '../prisma/prisma.service';
export declare class TermsCategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        templates: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            serviceTypeId: string | null;
            categoryId: string;
            title: string;
            content: string;
            sortOrder: number;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    })[]>;
    create(data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    }>;
}
export declare class TermsTemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        serviceType: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            slug: string;
            defaultQuotationTemplateId: string | null;
            defaultTerms: import("@prisma/client/runtime/client").JsonValue | null;
            visualTheme: string | null;
        } | null;
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        serviceTypeId: string | null;
        categoryId: string;
        title: string;
        content: string;
        sortOrder: number;
        isDefault: boolean;
    })[]>;
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        serviceTypeId: string | null;
        categoryId: string;
        title: string;
        content: string;
        sortOrder: number;
        isDefault: boolean;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        serviceTypeId: string | null;
        categoryId: string;
        title: string;
        content: string;
        sortOrder: number;
        isDefault: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        serviceTypeId: string | null;
        categoryId: string;
        title: string;
        content: string;
        sortOrder: number;
        isDefault: boolean;
    }>;
}
