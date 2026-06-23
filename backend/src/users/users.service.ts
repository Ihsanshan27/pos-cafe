import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { sanitizeUser } from '../common/user-response.util';

type AuthenticatedUser = {
  id: string;
  role: Role;
  outletId?: string | null;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(actor: AuthenticatedUser, createUserDto: CreateUserDto) {
    this.assertRoleAssignment(actor, createUserDto.role);

    const existingUser = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (existingUser) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        outlet: true,
      },
    });
    return sanitizeUser(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { outlet: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => sanitizeUser(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { outlet: true } });
    if (!user) throw new BadRequestException('User not found');
    return sanitizeUser(user);
  }

  async update(actor: AuthenticatedUser, id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new BadRequestException('User not found');

    this.assertUserMutationAccess(actor, existingUser.role);
    this.assertRoleAssignment(actor, updateUserDto.role, existingUser.role);

    let dataToUpdate = { ...updateUserDto };
    
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: { outlet: true },
    });
    return sanitizeUser(user);
  }

  async remove(actor: AuthenticatedUser, id: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new BadRequestException('User not found');

    this.assertUserMutationAccess(actor, existingUser.role);

    const user = await this.prisma.user.delete({ where: { id }, include: { outlet: true } });
    return sanitizeUser(user);
  }

  private assertRoleAssignment(
    actor: AuthenticatedUser,
    nextRole?: Role,
    currentRole?: Role,
  ) {
    if (actor.role === Role.OWNER) {
      return;
    }

    if (!nextRole) {
      return;
    }

    if (nextRole === Role.OWNER || nextRole === Role.MANAGER) {
      throw new BadRequestException('Manager cannot assign owner or manager role');
    }

    if (currentRole === Role.OWNER || currentRole === Role.MANAGER) {
      throw new BadRequestException('Manager cannot modify privileged users');
    }
  }

  private assertUserMutationAccess(actor: AuthenticatedUser, targetRole: Role) {
    if (actor.role === Role.OWNER) {
      return;
    }

    if (targetRole === Role.OWNER || targetRole === Role.MANAGER) {
      throw new BadRequestException('Manager cannot modify privileged users');
    }
  }
}
