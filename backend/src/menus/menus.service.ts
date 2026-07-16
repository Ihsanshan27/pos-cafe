import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateOutletMenuDto } from './dto/outlet-menu.dto';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MenusService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    const { ingredients, modifierGroupIds, ...menuData } = createMenuDto;
    
    return this.prisma.menu.create({
      data: {
        ...menuData,
        ingredients: {
          create: ingredients?.map((item) => ({
            quantity: item.quantity,
            ingredientId: item.ingredientId,
          })) || [],
        },
        modifierGroups: {
          connect: modifierGroupIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        modifierGroups: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  async findAll(outletId?: string) {
    const menus = await this.prisma.menu.findMany({
      include: {
        category: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        modifierGroups: {
          include: {
            options: true,
          },
        },
        outletMenus: outletId ? { where: { outletId } } : true,
      },
    });

    return menus.map((menu) => {
      const hpp = menu.ingredients.reduce((total, recipeItem) => {
        const cost = Number(recipeItem.ingredient.costPerUnit) * recipeItem.quantity;
        return total + cost;
      }, 0);

      const { outletMenus, ...menuData } = menu;
      const override = outletId ? outletMenus[0] : null;

      return {
        ...menuData,
        hpp,
        sellingPrice: override ? override.sellingPrice : menu.sellingPrice,
        isActive: override ? override.isActive : true,
        outletMenus,
      };
    });
  }

  async findOne(id: string, outletId?: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        category: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        modifierGroups: {
          include: {
            options: true,
          },
        },
        outletMenus: outletId ? { where: { outletId } } : true,
      },
    });

    if (!menu) return null;

    const hpp = menu.ingredients.reduce((total, recipeItem) => {
      const cost = Number(recipeItem.ingredient.costPerUnit) * recipeItem.quantity;
      return total + cost;
    }, 0);

    const { outletMenus, ...menuData } = menu;
    const override = outletId ? outletMenus[0] : null;

    return {
      ...menuData,
      hpp,
      sellingPrice: override ? override.sellingPrice : menu.sellingPrice,
      isActive: override ? override.isActive : true,
      outletMenus,
    };
  }

  async update(id: string, updateMenuDto: UpdateMenuDto, user?: any, ip?: string) {
    const oldMenu = await this.prisma.menu.findUnique({ where: { id } });
    const { ingredients, modifierGroupIds, ...menuData } = updateMenuDto;

    const result = await this.prisma.$transaction(async (tx) => {
      if (ingredients) {
        await tx.recipeItem.deleteMany({
          where: { menuId: id },
        });
      }

      return tx.menu.update({
        where: { id },
        data: {
          ...menuData,
          ...(ingredients ? {
            ingredients: {
              create: ingredients.map((item) => ({
                quantity: item.quantity,
                ingredientId: item.ingredientId,
              })),
            },
          } : {}),
          ...(modifierGroupIds ? {
            modifierGroups: {
              set: modifierGroupIds.map((id) => ({ id })),
            },
          } : {}),
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
          modifierGroups: {
            include: {
              options: true,
            },
          },
        },
      });
    });

    if (user && oldMenu) {
      const changes: string[] = [];
      if (menuData.name && menuData.name !== oldMenu.name) {
        changes.push(`Nama: "${oldMenu.name}" -> "${menuData.name}"`);
      }
      if (menuData.sellingPrice && Number(menuData.sellingPrice) !== Number(oldMenu.sellingPrice)) {
        changes.push(`Harga Global: ${oldMenu.sellingPrice} -> ${menuData.sellingPrice}`);
      }
    }

    return result;
  }

  async upsertOutletOverride(menuId: string, dto: UpdateOutletMenuDto, user?: any, ip?: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
    const oldOverride = await this.prisma.outletMenu.findUnique({
      where: {
        outletId_menuId: {
          outletId: dto.outletId,
          menuId,
        },
      },
    });

    const result = await this.prisma.outletMenu.upsert({
      where: {
        outletId_menuId: {
          outletId: dto.outletId,
          menuId,
        },
      },
      update: {
        sellingPrice: dto.sellingPrice,
        isActive: dto.isActive,
      },
      create: {
        outletId: dto.outletId,
        menuId,
        sellingPrice: dto.sellingPrice,
        isActive: dto.isActive,
      },
    });

    if (user && menu) {
      let details = '';
      if (oldOverride) {
        const changes: string[] = [];
        if (Number(oldOverride.sellingPrice) !== Number(dto.sellingPrice)) {
          changes.push(`Harga Cabang: ${oldOverride.sellingPrice} -> ${dto.sellingPrice}`);
        }
        if (oldOverride.isActive !== dto.isActive) {
          changes.push(`Status Aktif: ${oldOverride.isActive} -> ${dto.isActive}`);
        }
        details = changes.join(', ') || 'Update override cabang';
      } else {
        details = `Tambah override cabang: Harga = ${dto.sellingPrice}, Aktif = ${dto.isActive}`;
      }

      const outlet = await this.prisma.outlet.findUnique({ where: { id: dto.outletId } });
    }

    return result;
  }

  async deleteOutletOverride(menuId: string, outletId: string, user?: any, ip?: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
    const outlet = await this.prisma.outlet.findUnique({ where: { id: outletId } });
    const result = await this.prisma.outletMenu.delete({
      where: {
        outletId_menuId: {
          outletId,
          menuId,
        },
      },
    });

    if (user && menu) {
    }

    return result;
  }

  async remove(id: string, user?: any, ip?: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    const result = await this.prisma.menu.delete({
      where: { id },
    });

    if (user && menu) {
    }

    return result;
  }
}
