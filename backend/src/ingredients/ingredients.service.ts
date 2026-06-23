import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(createIngredientDto: CreateIngredientDto) {
    const { outletId, stockQuantity, ...ingredientData } = createIngredientDto;
    
    const ingredient = await this.prisma.ingredient.create({
      data: ingredientData,
    });

    const outlets = await this.prisma.outlet.findMany({ select: { id: true } });
    const initialStock = stockQuantity ?? 0;

    await this.prisma.outletIngredient.createMany({
      data: outlets.map((outlet) => ({
        outletId: outlet.id,
        ingredientId: ingredient.id,
        stockQuantity: outlet.id === outletId ? initialStock : 0,
      })),
    });

    return {
      ...ingredient,
      stockQuantity: initialStock,
    };
  }

  async findAll(outletId?: string) {
    const ingredients = await this.prisma.ingredient.findMany({
      include: {
        outletStocks: outletId ? { where: { outletId } } : true,
      },
    });

    return ingredients.map((i) => {
      const { outletStocks, ...rest } = i;
      const stock = outletId
        ? (outletStocks[0]?.stockQuantity ?? 0)
        : outletStocks.reduce((sum, item) => sum + item.stockQuantity, 0);

      return {
        ...rest,
        stockQuantity: stock,
      };
    });
  }

  async findOne(id: string, outletId?: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      include: {
        outletStocks: outletId ? { where: { outletId } } : true,
      },
    });

    if (!ingredient) return null;

    const { outletStocks, ...rest } = ingredient;
    const stock = outletId
      ? (outletStocks[0]?.stockQuantity ?? 0)
      : outletStocks.reduce((sum, item) => sum + item.stockQuantity, 0);

    return {
      ...rest,
      stockQuantity: stock,
    };
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto) {
    const { outletId, stockQuantity, ...ingredientData } = updateIngredientDto;

    const ingredient = await this.prisma.ingredient.update({
      where: { id },
      data: ingredientData,
    });

    if (outletId && stockQuantity !== undefined) {
      await this.prisma.outletIngredient.upsert({
        where: {
          outletId_ingredientId: {
            outletId,
            ingredientId: id,
          },
        },
        update: { stockQuantity },
        create: {
          outletId,
          ingredientId: id,
          stockQuantity,
        },
      });
    }

    const currentStockRecord = outletId
      ? await this.prisma.outletIngredient.findUnique({
          where: {
            outletId_ingredientId: {
              outletId,
              ingredientId: id,
            },
          },
        })
      : null;

    return {
      ...ingredient,
      stockQuantity: currentStockRecord?.stockQuantity ?? 0,
    };
  }

  remove(id: string) {
    return this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
