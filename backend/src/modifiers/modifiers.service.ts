import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ModifiersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; isRequired?: boolean; isMultiple?: boolean; options: { name: string; price: number }[] }) {
    return this.prisma.modifierGroup.create({
      data: {
        name: data.name,
        isRequired: data.isRequired ?? false,
        isMultiple: data.isMultiple ?? false,
        options: {
          create: data.options.map(opt => ({
            name: opt.name,
            price: opt.price
          }))
        }
      },
      include: {
        options: true
      }
    });
  }

  async findAll() {
    return this.prisma.modifierGroup.findMany({
      include: {
        options: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.modifierGroup.findUnique({
      where: { id },
      include: { options: true }
    });
    if (!group) throw new NotFoundException('Modifier group not found');
    return group;
  }

  async update(id: string, data: { name?: string; isRequired?: boolean; isMultiple?: boolean; options?: { id?: string; name: string; price: number }[] }) {
    const group = await this.findOne(id);
    
    return this.prisma.$transaction(async (tx) => {
      // If options are provided, we replace them or update them.
      // Easiest is to delete old ones and recreate, or sync. Let's delete and recreate if provided.
      if (data.options) {
        await tx.modifierOption.deleteMany({
          where: { groupId: id }
        });
      }

      return tx.modifierGroup.update({
        where: { id },
        data: {
          name: data.name !== undefined ? data.name : group.name,
          isRequired: data.isRequired !== undefined ? data.isRequired : group.isRequired,
          isMultiple: data.isMultiple !== undefined ? data.isMultiple : group.isMultiple,
          ...(data.options && {
            options: {
              create: data.options.map(opt => ({
                name: opt.name,
                price: opt.price
              }))
            }
          })
        },
        include: {
          options: true
        }
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.modifierGroup.delete({
      where: { id }
    });
  }
}
