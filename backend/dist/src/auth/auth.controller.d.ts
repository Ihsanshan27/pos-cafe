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
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        outlet: {
            name: string;
            id: string;
            createdAt: Date;
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            updatedAt: Date;
        } | null;
        outletId: string | null;
    }>;
    login(dto: LoginDto, response: express.Response): Promise<{
        accessToken: string;
        user: {
            mustChangePassword: boolean;
            name: string;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
            outlet: {
                name: string;
                id: string;
                createdAt: Date;
                slug: string;
                address: string | null;
                phone: string | null;
                isActive: boolean;
                updatedAt: Date;
            } | null;
            outletId: string | null;
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
        name: string;
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        outlet: {
            name: string;
            id: string;
            createdAt: Date;
            slug: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            updatedAt: Date;
        } | null;
        outletId: string | null;
    }>;
}
