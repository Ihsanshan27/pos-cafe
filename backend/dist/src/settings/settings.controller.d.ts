import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getAllowRegistration(): Promise<{
        allowed: boolean;
    }>;
    setAllowRegistration(allowed: boolean): Promise<{
        allowed: boolean;
    }>;
    getGenericSetting(key: string): Promise<{
        key: string;
        value: string;
    } | {
        key: string;
        value: null;
    }>;
    setGenericSetting(key: string, value: string): Promise<{
        key: string;
        value: string;
    }>;
}
