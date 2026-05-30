import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    create(createIngredientDto: CreateIngredientDto): import("@prisma/client").Prisma.Prisma__IngredientClient<{
        id: string;
        name: string;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
        stockQuantity: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
        stockQuantity: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__IngredientClient<{
        id: string;
        name: string;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
        stockQuantity: number;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateIngredientDto: UpdateIngredientDto): import("@prisma/client").Prisma.Prisma__IngredientClient<{
        id: string;
        name: string;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
        stockQuantity: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__IngredientClient<{
        id: string;
        name: string;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
        stockQuantity: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
