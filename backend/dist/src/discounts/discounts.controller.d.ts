import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
export declare class DiscountsController {
    private readonly discountsService;
    constructor(discountsService: DiscountsService);
    create(createDiscountDto: CreateDiscountDto): Promise<{
        id: string;
        isActive: boolean;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        isActive: boolean;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__DiscountClient<{
        id: string;
        isActive: boolean;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateDiscountDto: UpdateDiscountDto): import("@prisma/client").Prisma.Prisma__DiscountClient<{
        id: string;
        isActive: boolean;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__DiscountClient<{
        id: string;
        isActive: boolean;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        type: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
