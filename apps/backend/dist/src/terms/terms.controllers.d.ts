import { TermsCategoriesService, TermsTemplatesService } from './terms.services';
export declare class TermsCategoriesController {
    private readonly service;
    constructor(service: TermsCategoriesService);
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
    create(body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    }>;
}
export declare class TermsTemplatesController {
    private readonly service;
    constructor(service: TermsTemplatesService);
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
    create(body: any): Promise<{
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
    update(id: string, body: any): Promise<{
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
