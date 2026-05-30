import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; phone?: string; email?: string }) {
    return this.prisma.customer.create({ data });
  }

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: { transactions: true }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }
}
