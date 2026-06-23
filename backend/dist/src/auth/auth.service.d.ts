import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import { SettingsService } from '../settings/settings.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private settingsService;
    constructor(prisma: PrismaService, jwtService: JwtService, settingsService: SettingsService);
    register(dto: RegisterDto): Promise<{
        mustChangePassword: boolean;
        id: string;
        name: string;
        createdAt: Date;
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
        email: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            mustChangePassword: boolean;
            id: string;
            name: string;
            createdAt: Date;
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
            email: string;
            outletId: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    updateProfile(userId: string, data: {
        name?: string;
        email?: string;
        password?: string;
    }): Promise<{
        mustChangePassword: boolean;
        id: string;
        name: string;
        createdAt: Date;
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
        email: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
