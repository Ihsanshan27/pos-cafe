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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private settingsService: SettingsService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
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

    return {
      ...sanitizeUser(user),
      mustChangePassword: await this.settingsService.getForcePasswordChangeRequired(user.id),
    };
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
