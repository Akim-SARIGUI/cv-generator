import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class ResumeOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: AuthUser;
      params: { resumeId?: string; id?: string };
    }>();

    const resumeId = request.params.resumeId ?? request.params.id;
    if (!resumeId) {
      throw new ForbiddenException('Resume ID requis');
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      select: { id: true, userId: true },
    });

    if (!resume) {
      throw new NotFoundException('CV introuvable');
    }

    if (resume.userId !== request.user.id) {
      throw new ForbiddenException('Accès non autorisé à ce CV');
    }

    return true;
  }
}
