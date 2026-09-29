import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../decorators/current-user.decorator';
import { coded } from '../coded-exception';

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
      throw coded(ForbiddenException, 'RESUME_ID_REQUIRED');
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      select: { id: true, userId: true },
    });

    if (!resume) {
      throw coded(NotFoundException, 'RESUME_NOT_FOUND');
    }

    if (resume.userId !== request.user.id) {
      throw coded(ForbiddenException, 'RESUME_FORBIDDEN');
    }

    return true;
  }
}
