import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { SettingsService } from '../settings/settings.service';
export declare class AuthController {
    private readonly authService;
    private readonly settingsService;
    constructor(authService: AuthService, settingsService: SettingsService);
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
    getProfile(req: any): any;
    updateProfile(req: any, data: {
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
