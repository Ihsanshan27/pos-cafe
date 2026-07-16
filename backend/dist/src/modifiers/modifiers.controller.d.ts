import { ModifiersService } from './modifiers.service';
export declare class ModifiersController {
    private readonly modifiersService;
    constructor(modifiersService: ModifiersService);
    create(data: any): Promise<{
        options: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    }>;
    findAll(): Promise<({
        options: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    })[]>;
    findOne(id: string): Promise<{
        options: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    }>;
    update(id: string, data: any): Promise<{
        options: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    }>;
}
