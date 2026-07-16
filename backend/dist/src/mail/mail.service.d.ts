export declare class MailService {
    private transporter;
    private readonly logger;
    constructor();
    sendOTPEmail(email: string, otp: string): Promise<void>;
    sendBroadcastEmail(subject: string, message: string, targetEmails: string[]): Promise<void>;
}
