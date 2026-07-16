import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ModifiersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        isRequired?: boolean;
        isMultiple?: boolean;
        options: {
            name: string;
            price: number;
        }[];
    }): Promise<{
        options: {
            id: string;
            name: string;
            price: Prisma.Decimal;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    }>;
    findAll(): Promise<({
        options: {
            id: string;
            name: string;
            price: Prisma.Decimal;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    })[]>;
    findOne(id: string): Promise<{
        options: {
            id: string;
            name: string;
            price: Prisma.Decimal;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    }>;
    update(id: string, data: {
        name?: string;
        isRequired?: boolean;
        isMultiple?: boolean;
        options?: {
            id?: string;
            name: string;
            price: number;
        }[];
    }): Promise<{
        options: {
            id: string;
            name: string;
            price: Prisma.Decimal;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        isRequired: boolean;
        isMultiple: boolean;
    }>;
}
