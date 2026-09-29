import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { adminEmails } from '../common/admin-emails';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminBootstrap implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrap.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const emails = [...adminEmails(this.config)];
    if (!emails.length) return;

    const result = await this.prisma.user.updateMany({
      where: {
        email: { in: emails },
        role: { not: UserRole.ADMIN },
      },
      data: { role: UserRole.ADMIN },
    });

    if (result.count > 0) {
      this.logger.log(`${result.count} compte(s) promu(s) administrateur`);
    }
  }
}
