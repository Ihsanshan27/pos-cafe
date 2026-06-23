import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateOutletMenuDto } from './dto/outlet-menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    uploadImage(file: any): Promise<{
        filename: string;
        imageUrl: string;
    }>;
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
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        categoryId: string | null;
    } | null>;
    update(req: any, id: string, updateMenuDto: UpdateMenuDto): Promise<{
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
    upsertOutletOverride(req: any, id: string, updateOutletMenuDto: UpdateOutletMenuDto): Promise<{
        id: string;
        isActive: boolean;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        outletId: string;
        menuId: string;
    }>;
    deleteOutletOverride(req: any, id: string, outletId: string): Promise<{
        id: string;
        isActive: boolean;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        outletId: string;
        menuId: string;
    }>;
    remove(req: any, id: string): Promise<{
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
