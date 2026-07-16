import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateOutletMenuDto } from './dto/outlet-menu.dto';
import { SettingsService } from '../settings/settings.service';
export declare class MenusService {
    private prisma;
    private settingsService;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    create(createMenuDto: CreateMenuDto): Promise<{
        ingredients: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                unit: string;
                costPerUnit: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            id: string;
            quantity: number;
            ingredientId: string;
            menuId: string;
        })[];
        modifierGroups: ({
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
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        categoryId: string | null;
    }>;
    findAll(outletId?: string): Promise<{
        hpp: number;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
        outletMenus: {
            id: string;
            isActive: boolean;
            sellingPrice: import("@prisma/client-runtime-utils").Decimal;
            outletId: string;
            menuId: string;
        }[];
        category: {
            id: string;
            name: string;
            isStickerPrintable: boolean;
        } | null;
        ingredients: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                unit: string;
                costPerUnit: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            id: string;
            quantity: number;
            ingredientId: string;
            menuId: string;
        })[];
        modifierGroups: ({
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
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        categoryId: string | null;
    }[]>;
    findOne(id: string, outletId?: string): Promise<{
        hpp: number;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
        outletMenus: {
            id: string;
            isActive: boolean;
            sellingPrice: import("@prisma/client-runtime-utils").Decimal;
            outletId: string;
            menuId: string;
        }[];
        category: {
            id: string;
            name: string;
            isStickerPrintable: boolean;
        } | null;
        ingredients: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                unit: string;
                costPerUnit: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            id: string;
            quantity: number;
            ingredientId: string;
            menuId: string;
        })[];
        modifierGroups: ({
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
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        categoryId: string | null;
    } | null>;
    update(id: string, updateMenuDto: UpdateMenuDto, user?: any, ip?: string): Promise<{
        ingredients: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                unit: string;
                costPerUnit: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            id: string;
            quantity: number;
            ingredientId: string;
            menuId: string;
        })[];
        modifierGroups: ({
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
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        categoryId: string | null;
    }>;
    upsertOutletOverride(menuId: string, dto: UpdateOutletMenuDto, user?: any, ip?: string): Promise<{
        id: string;
        isActive: boolean;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        outletId: string;
        menuId: string;
    }>;
    deleteOutletOverride(menuId: string, outletId: string, user?: any, ip?: string): Promise<{
        id: string;
        isActive: boolean;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        outletId: string;
        menuId: string;
    }>;
    remove(id: string, user?: any, ip?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        categoryId: string | null;
    }>;
}
