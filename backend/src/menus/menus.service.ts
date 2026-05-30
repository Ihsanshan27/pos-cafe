import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto) {
    const { ingredients, ...menuData } = createMenuDto;
    
    return this.prisma.menu.create({
      data: {
        ...menuData,
        ingredients: {
          create: ingredients?.map((item) => ({
            quantity: item.quantity,
            ingredientId: item.ingredientId,
          })) || [],
        },
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  async findAll() {
    const menus = await this.prisma.menu.findMany({
      include: {
        category: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return menus.map((menu) => {
      const hpp = menu.ingredients.reduce((total, recipeItem) => {
        const cost = Number(recipeItem.ingredient.costPerUnit) * recipeItem.quantity;
        return total + cost;
      }, 0);

      return { ...menu, hpp };
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        category: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!menu) return null;

    const hpp = menu.ingredients.reduce((total, recipeItem) => {
      const cost = Number(recipeItem.ingredient.costPerUnit) * recipeItem.quantity;
      return total + cost;
    }, 0);

    return { ...menu, hpp };
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const { ingredients, ...menuData } = updateMenuDto;

    return this.prisma.$transaction(async (tx) => {
      if (ingredients) {
        await tx.recipeItem.deleteMany({
          where: { menuId: id },
        });
      }

      return tx.menu.update({
        where: { id },
        data: {
          ...menuData,
          ...(ingredients && {
            ingredients: {
              create: ingredients.map((item) => ({
                quantity: item.quantity,
                ingredientId: item.ingredientId,
              })),
            },
          }),
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    });
  }

  remove(id: string) {
    return this.prisma.menu.delete({
      where: { id },
    });
  }
}
