import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    updateProfile(userId: string, data: {
        name?: string;
        email?: string;
        password?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
