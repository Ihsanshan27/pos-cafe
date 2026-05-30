import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async create(createDiscountDto: CreateDiscountDto) {
    const exists = await this.prisma.discount.findUnique({ where: { code: createDiscountDto.code } });
    if (exists) throw new BadRequestException('Discount code already exists');
    return this.prisma.discount.create({ data: createDiscountDto });
  }

  findAll() {
    return this.prisma.discount.findMany();
  }

  findOne(id: string) {
    return this.prisma.discount.findUnique({ where: { id } });
  }

  update(id: string, updateDiscountDto: UpdateDiscountDto) {
    return this.prisma.discount.update({
      where: { id },
      data: updateDiscountDto,
    });
  }

  remove(id: string) {
    return this.prisma.discount.delete({ where: { id } });
  }
}
