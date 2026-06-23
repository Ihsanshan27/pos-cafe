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
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const allowed = await this.settingsService.getAllowRegistration();
    if (!allowed) {
      throw new BadRequestException('Registration is currently disabled by administrator');
    }
    return this.authService.register(dto);
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
