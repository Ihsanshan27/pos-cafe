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
        outletId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        quantity: number;
        ingredientId: string;
        outletId: string | null;
        type: import("@prisma/client").$Enums.LogType;
        notes: string | null;
        createdBy: string | null;
    }>;
    findAll(outletId?: string): Promise<{
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
