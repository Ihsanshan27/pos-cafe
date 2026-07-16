import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { SettingsService } from '../settings/settings.service';
import { Role } from '@prisma/client';
import { sanitizeUser } from '../common/user-response.util';
import { MailService } from '../mail/mail.service';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private settingsService: SettingsService,
    private mailService: MailService,
  ) {}

  async requestRegisterOtp(email: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await this.prisma.otpVerification.create({
      data: { email, code: otp, expiresAt, type: 'REGISTER' },
    });

    await this.mailService.sendOTPEmail(email, otp);
    return { success: true, message: 'OTP sent to email' };
  }

  async register(dto: RegisterDto & { otp: string }) {
    // Check OTP
    const validOtp = await this.prisma.otpVerification.findFirst({
      where: { email: dto.email, code: dto.otp, type: 'REGISTER' },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp || validOtp.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: Role.CASHIER,
      },
      include: {
        outlet: true,
      },
    });

    // Clean up used OTPs
    await this.prisma.otpVerification.deleteMany({
      where: { email: dto.email, type: 'REGISTER' },
    });

    return {
      ...sanitizeUser(user),
      mustChangePassword: await this.settingsService.getForcePasswordChangeRequired(user.id),
    };
  }

  async requestForgotPasswordOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: { email, code: otp, expiresAt, type: 'FORGOT_PASSWORD' },
    });

    await this.mailService.sendOTPEmail(email, otp);
    return { success: true, message: 'OTP sent to email' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const validOtp = await this.prisma.otpVerification.findFirst({
      where: { email, code: otp, type: 'FORGOT_PASSWORD' },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp || validOtp.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await this.settingsService.markPasswordChanged(user.id);
    await this.prisma.otpVerification.deleteMany({
      where: { email, type: 'FORGOT_PASSWORD' },
    });

    return { success: true, message: 'Password has been reset' };
  }

  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { outlet: true },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    // Compare password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid email or password');

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        ...sanitizeUser(user),
        mustChangePassword: await this.settingsService.getForcePasswordChangeRequired(user.id),
      },
    };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; password?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (data.email && data.email !== user.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (exists) throw new ConflictException('Email already in use');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { outlet: true },
    });

    if (data.password) {
      await this.settingsService.markPasswordChanged(userId);
    }

    return {
      ...sanitizeUser(updatedUser),
      mustChangePassword: await this.settingsService.getForcePasswordChangeRequired(userId),
    };
  }
}
