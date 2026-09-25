import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, resumeId: string) {
    await this.assertOwner(userId, resumeId);
    return this.prisma.experience.findMany({
      where: { resumeId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(userId: string, resumeId: string, dto: CreateExperienceDto) {
    await this.assertOwner(userId, resumeId);
    return this.prisma.experience.create({
      data: {
        resumeId,
        jobTitle: dto.jobTitle,
        company: dto.company,
        location: dto.location,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        currentJob: dto.currentJob ?? false,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(
    userId: string,
    resumeId: string,
    id: string,
    dto: UpdateExperienceDto,
  ) {
    await this.assertItemOwner(userId, resumeId, id);
    return this.prisma.experience.update({
      where: { id },
      data: {
        jobTitle: dto.jobTitle,
        company: dto.company,
        location: dto.location,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        currentJob: dto.currentJob ?? false,
        description: dto.description,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(userId: string, resumeId: string, id: string) {
    await this.assertItemOwner(userId, resumeId, id);
    await this.prisma.experience.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertOwner(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      select: { userId: true },
    });
    if (!resume) throw new NotFoundException('CV introuvable');
    if (resume.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce CV');
    }
  }

  private async assertItemOwner(userId: string, resumeId: string, id: string) {
    await this.assertOwner(userId, resumeId);
    const item = await this.prisma.experience.findFirst({
      where: { id, resumeId },
    });
    if (!item) throw new NotFoundException('Expérience introuvable');
  }
}
