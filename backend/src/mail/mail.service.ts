import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOTPEmail(email: string, otp: string) {
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
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}`, error);
      throw error;
    }
  }

  async sendBroadcastEmail(subject: string, message: string, targetEmails: string[]) {
    try {
      // Send emails in parallel or batches
      // For simplicity, we loop through
      const promises = targetEmails.map(email => 
        this.transporter.sendMail({
          from: `"POS F&B System" <${process.env.SMTP_USER}>`,
          to: email,
          subject: subject,
          text: message,
          html: `<div style="font-family: sans-serif; padding: 20px;">${message.replace(/\n/g, '<br/>')}</div>`,
        })
      );
      
      await Promise.all(promises);
      this.logger.log(`Broadcast sent to ${targetEmails.length} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send broadcast`, error);
      throw error;
    }
  }
}
