import { PrismaService } from '../prisma/prisma.service';
import { LogType } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';
export declare class InventoryLogsService {
    private prisma;
    private settingsService;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    create(data: {
        ingredientId: string;
        type: LogType;
        quantity: number;
        notes?: string;
        createdBy?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        quantity: number;
        ingredientId: string;
        notes: string | null;
        type: import("@prisma/client").$Enums.LogType;
        createdBy: string | null;
    }>;
    findAll(): Promise<{
        createdByName: string | null;
        ingredient: {
            id: string;
            name: string;
            unit: string;
            costPerUnit: import("@prisma/client-runtime-utils").Decimal;
            stockQuantity: number;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        createdAt: Date;
        quantity: number;
        ingredientId: string;
        notes: string | null;
        type: import("@prisma/client").$Enums.LogType;
        createdBy: string | null;
    }[]>;
}
