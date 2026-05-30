import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
