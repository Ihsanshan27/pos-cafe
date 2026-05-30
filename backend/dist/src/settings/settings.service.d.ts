import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSetting(key: string): Promise<{
        key: string;
        value: string;
    } | null>;
    setSetting(key: string, value: string): Promise<{
        key: string;
        value: string;
    }>;
    getAllowRegistration(): Promise<boolean>;
}
