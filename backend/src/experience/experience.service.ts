import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { coded } from '../common/coded-exception';
import { Prisma } from '@prisma/client';
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
    const count = await this.prisma.experience.count({ where: { resumeId } });
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
        sortOrder: dto.sortOrder ?? count,
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
    const data: Prisma.ExperienceUpdateInput = {};
    if (dto.jobTitle !== undefined) data.jobTitle = dto.jobTitle;
    if (dto.company !== undefined) data.company = dto.company;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.startDate !== undefined) {
      data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.currentJob !== undefined) data.currentJob = dto.currentJob;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    return this.prisma.experience.update({ where: { id }, data });
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
    if (!resume) throw coded(NotFoundException, 'RESUME_NOT_FOUND');
    if (resume.userId !== userId) {
      throw coded(ForbiddenException, 'RESUME_FORBIDDEN');
    }
  }

  private async assertItemOwner(userId: string, resumeId: string, id: string) {
    await this.assertOwner(userId, resumeId);
    const item = await this.prisma.experience.findFirst({
      where: { id, resumeId },
    });
    if (!item) throw coded(NotFoundException, 'EXPERIENCE_NOT_FOUND');
  }
}
