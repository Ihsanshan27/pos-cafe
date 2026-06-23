import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class DiscountsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDiscountDto: CreateDiscountDto): Promise<{
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
        isActive: boolean;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
        isActive: boolean;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__DiscountClient<{
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
        isActive: boolean;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateDiscountDto: UpdateDiscountDto): import("@prisma/client").Prisma.Prisma__DiscountClient<{
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__DiscountClient<{
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
