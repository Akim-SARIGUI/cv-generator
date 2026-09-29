import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { coded } from '../common/coded-exception';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [users, resumes, admins, recentUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.resume.count(),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: publicUserSelect,
      }),
    ]);

    return { users, resumes, admins, recentUsers };
  }

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        ...publicUserSelect,
        _count: { select: { resumes: true } },
      },
    });
  }

  async setRole(actorId: string, userId: string, role: UserRole) {
    if (actorId === userId && role !== UserRole.ADMIN) {
      throw coded(BadRequestException, 'ADMIN_SELF_DEMOTE');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw coded(NotFoundException, 'USER_NOT_FOUND');
    }

    if (user.role === UserRole.ADMIN && role === UserRole.USER) {
      await this.assertNotLastAdmin();
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: publicUserSelect,
    });
  }

  async removeUser(actorId: string, userId: string) {
    if (actorId === userId) {
      throw coded(BadRequestException, 'ADMIN_SELF_DELETE');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw coded(NotFoundException, 'USER_NOT_FOUND');
    }

    if (user.role === UserRole.ADMIN) {
      await this.assertNotLastAdmin();
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }

  private async assertNotLastAdmin() {
    const admins = await this.prisma.user.count({
      where: { role: UserRole.ADMIN },
    });
    if (admins <= 1) {
      throw coded(BadRequestException, 'ADMIN_LAST');
    }
  }
}
