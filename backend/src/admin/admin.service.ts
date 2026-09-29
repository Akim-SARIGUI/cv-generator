import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new BadRequestException(
        'Vous ne pouvez pas retirer votre propre rôle administrateur',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
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
      throw new BadRequestException(
        'Vous ne pouvez pas supprimer votre propre compte depuis l’administration',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
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
      throw new BadRequestException('Impossible de retirer le dernier administrateur');
    }
  }
}
