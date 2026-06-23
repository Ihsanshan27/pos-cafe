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

  /**
   * Calculates shift summary for a given shift ID.
   * Returns cash/non-cash sales, expenses, expected ending cash, etc.
   */
  async getShiftSummary(user: AuthenticatedUser, id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: { transactions: true },
    });
    if (!shift) throw new BadRequestException('Shift not found');
    this.assertShiftAccess(user, shift.userId, shift.outletId);

    return this.computeShiftSummary(shift);
  }

  private async computeShiftSummary(shift: any) {
    // Get all COMPLETED transactions in this shift
    const transactions = await this.prisma.transaction.findMany({
      where: { shiftId: shift.id, status: 'COMPLETED' },
    });

    // Get expenses logged during this shift's duration in this outlet
    const expenses = await this.prisma.expense.findMany({
      where: {
        ...(shift.outletId ? { outletId: shift.outletId } : {}),
        createdAt: {
          gte: shift.startTime,
          ...(shift.endTime ? { lte: shift.endTime } : {}),
        },
      },
    });

    const cashTxs = transactions.filter((t) => t.paymentMethod === 'CASH');
    const nonCashTxs = transactions.filter((t) => t.paymentMethod !== 'CASH');

    const totalCashSales = cashTxs.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const totalNonCashSales = nonCashTxs.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const transactionCount = transactions.length;

    // Expected cash = Starting cash + all CASH sales - expenses
    const expectedEndingCash = Number(shift.startingCash) + totalCashSales - totalExpenses;

    return {
      startingCash: Number(shift.startingCash),
      totalCashSales,
      totalNonCashSales,
      totalExpenses,
      transactionCount,
      expectedEndingCash,
      expenseDetails: expenses,
    };
  }

  async update(user: AuthenticatedUser, id: string, updateShiftDto: UpdateShiftDto) {
    const existingShift = await this.prisma.shift.findUnique({ where: { id } });
    if (!existingShift) {
      throw new BadRequestException('Shift not found');
    }

    this.assertShiftAccess(user, existingShift.userId, existingShift.outletId);

    // If closing the shift, calculate reconciliation data
    if (updateShiftDto.status === 'CLOSED') {
      const shiftWithEndTime = {
        ...existingShift,
        endTime: new Date(),
      };

      const summary = await this.computeShiftSummary(shiftWithEndTime);
      const actualEndingCash = updateShiftDto.actualEndingCash !== undefined
        ? updateShiftDto.actualEndingCash
        : undefined;

      const cashDifference = actualEndingCash !== undefined
        ? actualEndingCash - summary.expectedEndingCash
        : undefined;

      return this.prisma.shift.update({
        where: { id },
        data: {
          status: 'CLOSED',
          endTime: new Date(),
          actualEndingCash: actualEndingCash,
          expectedEndingCash: summary.expectedEndingCash,
          cashDifference: cashDifference,
          totalCashSales: summary.totalCashSales,
          totalNonCashSales: summary.totalNonCashSales,
          totalExpenses: summary.totalExpenses,
          transactionCount: summary.transactionCount,
          notes: updateShiftDto.notes ?? undefined,
        },
      });
    }

    // For other updates (status OPEN or just updating notes)
    return this.prisma.shift.update({
      where: { id },
      data: {
        actualEndingCash: updateShiftDto.actualEndingCash,
        notes: updateShiftDto.notes,
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
