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
        email: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
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
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            mustChangePassword: boolean;
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            outletId: string | null;
            role: import("@prisma/client").$Enums.Role;
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
        email: string;
        outletId: string | null;
        role: import("@prisma/client").$Enums.Role;
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
    }>;
}
