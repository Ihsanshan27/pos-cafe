import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    create(createIngredientDto: CreateIngredientDto): Promise<{
        stockQuantity: number;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
    }>;
    findAll(outletId?: string): Promise<{
        stockQuantity: number;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    findOne(id: string, outletId?: string): Promise<{
        stockQuantity: number;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
    } | null>;
    update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<{
        stockQuantity: number;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__IngredientClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
