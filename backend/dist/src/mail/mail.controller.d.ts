import { MailService } from './mail.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MailController {
    private readonly mailService;
    private readonly prisma;
    constructor(mailService: MailService, prisma: PrismaService);
    sendBroadcast(req: any, dto: {
        subject: string;
        message: string;
        target: 'USERS' | 'CUSTOMERS';
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
