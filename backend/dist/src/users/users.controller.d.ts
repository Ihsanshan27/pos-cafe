import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
