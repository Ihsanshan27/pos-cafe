import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { sanitizeUser } from '../common/user-response.util';

type AuthenticatedUser = {
  id: string;
  role: Role;
  outletId?: string | null;
};

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createShiftDto: CreateShiftDto) {
    const activeShift = await this.prisma.shift.findFirst({
      where: { userId, status: 'OPEN', outletId: createShiftDto.outletId ?? undefined },
    });
    if (activeShift) throw new BadRequestException('You already have an open shift');

    return this.prisma.shift.create({
      data: {
        userId,
        startingCash: createShiftDto.startingCash,
        outletId: createShiftDto.outletId,
      },
    });
  }

  async findAll(user: AuthenticatedUser, outletId?: string) {
    const scopedOutletId = this.resolveScopedOutletId(user, outletId);
    const where =
      user.role === Role.OWNER || user.role === Role.MANAGER
        ? scopedOutletId
          ? { outletId: scopedOutletId }
          : undefined
        : {
            userId: user.id,
            ...(scopedOutletId ? { outletId: scopedOutletId } : {}),
          };

    const shifts = await this.prisma.shift.findMany({
      where,
      include: {
        user: {
          include: {
            outlet: true,
          },
        },
        outlet: true,
      },
      orderBy: { startTime: 'desc' },
    });

    return shifts.map((shift) => ({
      ...shift,
      user: sanitizeUser(shift.user),
    }));
  }

  findActive(user: AuthenticatedUser, outletId?: string) {
    const scopedOutletId = this.resolveScopedOutletId(user, outletId);
    return this.prisma.shift.findFirst({
      where: { userId: user.id, status: 'OPEN', outletId: scopedOutletId ?? undefined },
    });
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        transactions: true,
        user: {
          include: {
            outlet: true,
          },
        },
        outlet: true,
      },
    });
    if (!shift) return shift;

    this.assertShiftAccess(user, shift.userId, shift.outletId);
    return {
      ...shift,
      user: sanitizeUser(shift.user),
    };
  }

  async update(user: AuthenticatedUser, id: string, updateShiftDto: UpdateShiftDto) {
    const existingShift = await this.prisma.shift.findUnique({ where: { id } });
    if (!existingShift) {
      throw new BadRequestException('Shift not found');
    }

    this.assertShiftAccess(user, existingShift.userId, existingShift.outletId);

    return this.prisma.shift.update({
      where: { id },
      data: {
        ...updateShiftDto,
        endTime: updateShiftDto.status === 'CLOSED' ? new Date() : undefined,
      },
    });
  }

  private resolveScopedOutletId(user: AuthenticatedUser, requestedOutletId?: string) {
    if (user.role === Role.OWNER || user.role === Role.MANAGER) {
      return requestedOutletId;
    }

    if (requestedOutletId && user.outletId && requestedOutletId !== user.outletId) {
      throw new BadRequestException('You do not have access to this outlet');
    }

    return requestedOutletId ?? user.outletId ?? undefined;
  }

  private assertShiftAccess(
    user: AuthenticatedUser,
    shiftUserId: string,
    shiftOutletId?: string | null,
  ) {
    if (user.role === Role.OWNER || user.role === Role.MANAGER) {
      if (user.role === Role.MANAGER && user.outletId && shiftOutletId && shiftOutletId !== user.outletId) {
        throw new BadRequestException('You do not have access to this shift');
      }
      return;
    }

    if (shiftUserId !== user.id) {
      throw new BadRequestException('You do not have access to this shift');
    }

    if (user.outletId && shiftOutletId && shiftOutletId !== user.outletId) {
      throw new BadRequestException('You do not have access to this shift');
    }
  }
}
