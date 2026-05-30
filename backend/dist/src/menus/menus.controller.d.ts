import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    create(createMenuDto: CreateMenuDto): Promise<{
        ingredients: ({
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
    findAll(): Promise<{
        hpp: number;
        category: {
            id: string;
            name: string;
        } | null;
        ingredients: ({
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
            menuId: string;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        categoryId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        hpp: number;
        category: {
            id: string;
            name: string;
        } | null;
        ingredients: ({
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
            menuId: string;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        categoryId: string | null;
    } | null>;
    update(id: string, updateMenuDto: UpdateMenuDto): Promise<{
        ingredients: ({
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
    remove(id: string): import("@prisma/client").Prisma.Prisma__MenuClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        categoryId: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
