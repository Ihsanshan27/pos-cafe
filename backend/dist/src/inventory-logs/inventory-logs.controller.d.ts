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
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        quantity: number;
        ingredientId: string;
        notes: string | null;
        type: import("@prisma/client").$Enums.LogType;
        createdBy: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        ingredient: {
            id: string;
            name: string;
            unit: string;
            costPerUnit: import("@prisma/client-runtime-utils").Decimal;
            stockQuantity: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        quantity: number;
        ingredientId: string;
        notes: string | null;
        type: import("@prisma/client").$Enums.LogType;
        createdBy: string | null;
    })[]>;
}
