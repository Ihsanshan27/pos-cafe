"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    transporter;
    logger = new common_1.Logger(MailService_1.name);
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendOTPEmail(email, otp) {
        try {
            await this.transporter.sendMail({
                from: `"POS F&B System" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your OTP Code',
                text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
                html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
            <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">SHN COFFEE</h2>
            </div>
            <div style="padding: 32px 24px; text-align: center;">
              <h3 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 600;">Verifikasi Email Anda</h3>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                Gunakan kode One-Time Password (OTP) berikut untuk melanjutkan proses di sistem kami.
              </p>
              <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h1 style="color: #4f46e5; font-size: 40px; letter-spacing: 12px; margin: 0; font-weight: 800; padding-left: 12px;">${otp}</h1>
              </div>
              <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">
                Kode ini akan kadaluarsa dalam <strong>5 menit</strong>.<br>
                Mohon untuk tidak memberikan kode ini kepada siapapun.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #f3f4f6;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} SHN COFFEE Restaurant System.<br>All rights reserved.
              </p>
            </div>
          </div>
        `,
            });
            this.logger.log(`OTP sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send OTP to ${email}`, error);
            throw error;
        }
    }
    async sendBroadcastEmail(subject, message, targetEmails) {
        try {
            const promises = targetEmails.map(email => this.transporter.sendMail({
                from: `"POS F&B System" <${process.env.SMTP_USER}>`,
                to: email,
                subject: subject,
                text: message,
                html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
              <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">SHN COFFEE</h2>
              </div>
              <div style="padding: 32px 24px;">
                <h3 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 600; text-align: center;">${subject}</h3>
                <div style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                  ${message.replace(/\n/g, '<br/>')}
                </div>
              </div>
              <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #f3f4f6;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  &copy; ${new Date().getFullYear()} SHN COFFEE Restaurant System.<br>All rights reserved.
                </p>
              </div>
            </div>
          `,
            }));
            await Promise.all(promises);
            this.logger.log(`Broadcast sent to ${targetEmails.length} recipients`);
        }
        catch (error) {
            this.logger.error(`Failed to send broadcast`, error);
            throw error;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map