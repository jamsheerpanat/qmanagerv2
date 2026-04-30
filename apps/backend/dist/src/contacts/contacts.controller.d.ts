import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    create(customerId: string, body: any, req: any): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string | null;
        notes: string | null;
        customerId: string;
        isPrimary: boolean;
        designation: string | null;
        department: string | null;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string | null;
        notes: string | null;
        customerId: string;
        isPrimary: boolean;
        designation: string | null;
        department: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        whatsapp: string | null;
        notes: string | null;
        customerId: string;
        isPrimary: boolean;
        designation: string | null;
        department: string | null;
    }>;
}
