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
