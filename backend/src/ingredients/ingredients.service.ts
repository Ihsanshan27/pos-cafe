import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  create(createIngredientDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: createIngredientDto,
    });
  }

  findAll() {
    return this.prisma.ingredient.findMany();
  }

  findOne(id: string) {
    return this.prisma.ingredient.findUnique({
      where: { id },
    });
  }

  update(id: string, updateIngredientDto: UpdateIngredientDto) {
    return this.prisma.ingredient.update({
      where: { id },
      data: updateIngredientDto,
    });
  }

  remove(id: string) {
    return this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
