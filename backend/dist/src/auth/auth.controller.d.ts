import * as express from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import { SettingsService } from '../settings/settings.service';
export declare class AuthController {
    private readonly authService;
    private readonly settingsService;
    constructor(authService: AuthService, settingsService: SettingsService);
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
    login(dto: LoginDto, response: express.Response): Promise<{
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
    logout(response: express.Response): Promise<{
        success: boolean;
    }>;
    getProfile(req: any): any;
    updateProfile(req: any, data: {
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
