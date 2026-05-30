import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createShiftDto: CreateShiftDto) {
    const activeShift = await this.prisma.shift.findFirst({
      where: { userId, status: 'OPEN' },
    });
    if (activeShift) throw new BadRequestException('You already have an open shift');

    return this.prisma.shift.create({
      data: {
        userId,
        startingCash: createShiftDto.startingCash,
      },
    });
  }

  findAll() {
    return this.prisma.shift.findMany({
      include: { user: true },
      orderBy: { startTime: 'desc' }
    });
  }

  findActive(userId: string) {
    return this.prisma.shift.findFirst({
      where: { userId, status: 'OPEN' },
    });
  }

  findOne(id: string) {
    return this.prisma.shift.findUnique({ where: { id }, include: { transactions: true } });
  }

  async update(id: string, updateShiftDto: UpdateShiftDto) {
    return this.prisma.shift.update({
      where: { id },
      data: {
        ...updateShiftDto,
        endTime: updateShiftDto.status === 'CLOSED' ? new Date() : undefined,
      },
    });
  }
}
