import { InventoryLogsService } from './inventory-logs.service';
import { LogType } from '@prisma/client';
export declare class InventoryLogsController {
    private readonly inventoryLogsService;
    constructor(inventoryLogsService: InventoryLogsService);
    create(data: {
        ingredientId: string;
        type: LogType;
        quantity: number;
        notes?: string;
        outletId?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        quantity: number;
        ingredientId: string;
        outletId: string | null;
        type: import("@prisma/client").$Enums.LogType;
        notes: string | null;
        createdBy: string | null;
    }>;
    findAll(req: any, outletId?: string): Promise<{
        createdByName: string | null;
        ingredient: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            unit: string;
            costPerUnit: import("@prisma/client-runtime-utils").Decimal;
        };
        id: string;
        createdAt: Date;
        quantity: number;
        ingredientId: string;
        outletId: string | null;
        type: import("@prisma/client").$Enums.LogType;
        notes: string | null;
        createdBy: string | null;
    }[]>;
}
