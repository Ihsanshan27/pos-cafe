import { PrismaService } from '../prisma/prisma.service';
import { PurchaseOrderStatus } from '@prisma/client';
export declare class PurchaseOrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        supplierId: string;
        outletId?: string;
        notes?: string;
        expectedDate?: string;
        items: Array<{
            ingredientId: string;
            quantity: number;
            unitCost: number;
        }>;
    }): Promise<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            notes: string | null;
            isActive: boolean;
            phone: string | null;
            address: string | null;
        };
        items: ({
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
            quantity: number;
            ingredientId: string;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            receivedQuantity: number;
            purchaseOrderId: string;
        })[];
        createdBy: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        orderNumber: string;
        expectedDate: Date | null;
        receivedAt: Date | null;
        supplierId: string;
        createdById: string | null;
    }>;
    findAll(outletId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            notes: string | null;
            isActive: boolean;
            phone: string | null;
            address: string | null;
        };
        items: ({
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
            quantity: number;
            ingredientId: string;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            receivedQuantity: number;
            purchaseOrderId: string;
        })[];
        createdBy: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        orderNumber: string;
        expectedDate: Date | null;
        receivedAt: Date | null;
        supplierId: string;
        createdById: string | null;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__PurchaseOrderClient<({
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            notes: string | null;
            isActive: boolean;
            phone: string | null;
            address: string | null;
        };
        items: ({
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
            quantity: number;
            ingredientId: string;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            receivedQuantity: number;
            purchaseOrderId: string;
        })[];
        createdBy: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        orderNumber: string;
        expectedDate: Date | null;
        receivedAt: Date | null;
        supplierId: string;
        createdById: string | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateStatus(id: string, userId: string, status: PurchaseOrderStatus, receivedQuantities?: Record<string, number>): Promise<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            notes: string | null;
            isActive: boolean;
            phone: string | null;
            address: string | null;
        };
        items: ({
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
            quantity: number;
            ingredientId: string;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            receivedQuantity: number;
            purchaseOrderId: string;
        })[];
        createdBy: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string | null;
        notes: string | null;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        orderNumber: string;
        expectedDate: Date | null;
        receivedAt: Date | null;
        supplierId: string;
        createdById: string | null;
    }>;
    private defaultInclude;
}
