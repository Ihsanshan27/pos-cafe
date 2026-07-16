import { Controller, Post, Body, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('mail')
@UseGuards(JwtAuthGuard)
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('broadcast')
  async sendBroadcast(
    @Request() req: any,
    @Body() dto: { subject: string; message: string; target: 'USERS' | 'CUSTOMERS' }
  ) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'MANAGER') {
      throw new BadRequestException('Only Owner and Manager can send broadcasts');
    }

    if (!dto.subject || !dto.message || !dto.target) {
      throw new BadRequestException('Subject, message, and target are required');
    }

    let targetEmails: string[] = [];

    if (dto.target === 'USERS') {
      const users = await this.prisma.user.findMany({
        where: { email: { not: '' } },
        select: { email: true }
      });
      targetEmails = users.map(u => u.email).filter(Boolean);
    } else if (dto.target === 'CUSTOMERS') {
      // Assuming you have a Customer model, adjust if necessary
      const customers = await this.prisma.customer.findMany({
        where: { email: { not: null } },
        select: { email: true }
      });
      targetEmails = customers.map(c => c.email!).filter(Boolean);
    }

    if (targetEmails.length === 0) {
      throw new BadRequestException('No emails found for the selected target');
    }

    await this.mailService.sendBroadcastEmail(dto.subject, dto.message, targetEmails);

    return { success: true, message: `Broadcast sent to ${targetEmails.length} recipients` };
  }
}
