import { Controller, Post, Body, Get, Patch, UseGuards, Request, BadRequestException } from '@nestjs/common';
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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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
