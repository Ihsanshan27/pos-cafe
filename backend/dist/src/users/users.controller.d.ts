import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(req: any, createUserDto: CreateUserDto): Promise<Omit<{
        outlet: {
            id: string;
            name: string;
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
    update(req: any, id: string, updateUserDto: UpdateUserDto): Promise<Omit<{
        outlet: {
            id: string;
            name: string;
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
    remove(req: any, id: string): Promise<Omit<{
        outlet: {
            id: string;
            name: string;
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
}
