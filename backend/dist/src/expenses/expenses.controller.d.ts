import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto): import("@prisma/client").Prisma.Prisma__ExpenseClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        outletId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(outletId?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        outletId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ExpenseClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        outletId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): import("@prisma/client").Prisma.Prisma__ExpenseClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        outletId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ExpenseClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        outletId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
