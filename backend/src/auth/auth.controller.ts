import { Controller, Post, Body, Get, Patch, UseGuards, Request, BadRequestException, Res } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SettingsService } from '../settings/settings.service';
import { LoginRateLimitGuard } from '../common/simple-rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService
  ) {}

  @UseGuards(LoginRateLimitGuard)
  @Post('register/request-otp')
  async requestRegisterOtp(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.authService.requestRegisterOtp(email);
  }

  @UseGuards(LoginRateLimitGuard)
  @Post('register')
  async register(@Body() dto: RegisterDto & { otp: string }) {
    const allowed = await this.settingsService.getAllowRegistration();
    if (!allowed) {
      throw new BadRequestException('Registration is currently disabled by administrator');
    }
    if (!dto.otp) throw new BadRequestException('OTP is required');
    return this.authService.register(dto);
  }

  @UseGuards(LoginRateLimitGuard)
  @Post('forgot-password/request-otp')
  async requestForgotPasswordOtp(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.authService.requestForgotPasswordOtp(email);
  }

  @UseGuards(LoginRateLimitGuard)
  @Post('forgot-password/reset')
  async resetPassword(@Body() dto: { email: string; otp: string; newPassword: string }) {
    if (!dto.email || !dto.otp || !dto.newPassword) {
      throw new BadRequestException('Email, OTP, and newPassword are required');
    }
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @UseGuards(LoginRateLimitGuard)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: express.Response) {
    const result = await this.authService.login(dto);
    const timeoutSetting = await this.settingsService.getSetting('SESSION_TIMEOUT_MINUTES');
    const timeoutMinutes = Number(timeoutSetting?.value ?? '120') || 120;
    
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: timeoutMinutes * 60 * 1000,
    });

    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: express.Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Request() req: any, @Body() data: { name?: string; email?: string; password?: string }) {
    return this.authService.updateProfile(req.user.id, data);
  }
}
