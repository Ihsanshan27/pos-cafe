import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
type AuthenticatedUser = {
    id: string;
    role: Role;
    outletId?: string | null;
};
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(actor: AuthenticatedUser, createUserDto: CreateUserDto): Promise<Omit<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        password: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
    }, "password">>;
    findAll(): Promise<Omit<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        password: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
    }, "password">[]>;
    findOne(id: string): Promise<Omit<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        password: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
    }, "password">>;
    update(actor: AuthenticatedUser, id: string, updateUserDto: UpdateUserDto): Promise<Omit<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        password: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
    }, "password">>;
    remove(actor: AuthenticatedUser, id: string): Promise<Omit<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            phone: string | null;
            slug: string;
            address: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        password: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
    }, "password">>;
    private assertRoleAssignment;
    private assertUserMutationAccess;
}
export {};
