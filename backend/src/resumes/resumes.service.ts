import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { coded } from '../common/coded-exception';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResumeDto, UpdateResumeDto } from './dto/resume.dto';
import { normalizeSections } from '../common/sections';

const resumeInclude = {
  personal: true,
  experiences: { orderBy: { sortOrder: 'asc' as const } },
  educations: { orderBy: { sortOrder: 'asc' as const } },
  skills: { orderBy: { sortOrder: 'asc' as const } },
  extras: { orderBy: [{ kind: 'asc' as const }, { sortOrder: 'asc' as const }] },
};

@Injectable()
export class ResumesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      include: {
        personal: true,
        _count: {
          select: {
            experiences: true,
            educations: true,
            skills: true,
            extras: true,
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async getOne(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: resumeInclude,
    });

    if (!resume) {
      throw coded(NotFoundException, 'RESUME_NOT_FOUND');
    }
    if (resume.userId !== userId) {
      throw coded(ForbiddenException, 'RESUME_FORBIDDEN');
    }

    return resume;
  }

  async getDefault(userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { userId, isDefault: true },
      include: resumeInclude,
    });

    if (resume) return resume;

    const fallback = await this.prisma.resume.findFirst({
      where: { userId },
      include: resumeInclude,
      orderBy: { updatedAt: 'desc' },
    });

    if (!fallback) {
      throw coded(NotFoundException, 'RESUME_NONE');
    }

    return fallback;
  }

  create(userId: string, dto: CreateResumeDto) {
    return this.prisma.resume.create({
      data: {
        userId,
        title: dto.title,
        template: dto.template ?? 'classic-navy',
        locale: dto.locale ?? 'fr',
        isDefault: false,
        personal: {
          create: {
            fullName: '',
            email: '',
          },
        },
      },
      include: resumeInclude,
    });
  }

  async update(userId: string, resumeId: string, dto: UpdateResumeDto) {
    await this.assertOwner(userId, resumeId);

    if (dto.isDefault) {
      await this.prisma.resume.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.resume.update({
      where: { id: resumeId },
      data: {
        title: dto.title,
        template: dto.template,
        locale: dto.locale,
        isDefault: dto.isDefault,
        sections:
          dto.sections != null
            ? normalizeSections(dto.sections)
            : undefined,
      },
      include: resumeInclude,
    });
  }

  async remove(userId: string, resumeId: string) {
    await this.assertOwner(userId, resumeId);
    const count = await this.prisma.resume.count({ where: { userId } });
    if (count <= 1) {
      throw coded(ForbiddenException, 'RESUME_LAST');
    }
    await this.prisma.resume.delete({ where: { id: resumeId } });
    return { deleted: true };
  }

  private async assertOwner(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      select: { userId: true },
    });
    if (!resume) throw coded(NotFoundException, 'RESUME_NOT_FOUND');
    if (resume.userId !== userId) {
      throw coded(ForbiddenException, 'RESUME_FORBIDDEN');
    }
  }
}
