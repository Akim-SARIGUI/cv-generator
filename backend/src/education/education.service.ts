import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, resumeId: string) {
    await this.assertOwner(userId, resumeId);
    return this.prisma.education.findMany({
      where: { resumeId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(userId: string, resumeId: string, dto: CreateEducationDto) {
    await this.assertOwner(userId, resumeId);
    const count = await this.prisma.education.count({ where: { resumeId } });
    return this.prisma.education.create({
      data: {
        resumeId,
        degree: dto.degree,
        institution: dto.institution,
        location: dto.location,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        currentEducation: dto.currentEducation ?? false,
        description: dto.description,
        sortOrder: dto.sortOrder ?? count,
      },
    });
  }

  async update(
    userId: string,
    resumeId: string,
    id: string,
    dto: UpdateEducationDto,
  ) {
    await this.assertItemOwner(userId, resumeId, id);
    const data: Prisma.EducationUpdateInput = {};
    if (dto.degree !== undefined) data.degree = dto.degree;
    if (dto.institution !== undefined) data.institution = dto.institution;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.startDate !== undefined) {
      data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.currentEducation !== undefined) {
      data.currentEducation = dto.currentEducation;
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    return this.prisma.education.update({ where: { id }, data });
  }

  async remove(userId: string, resumeId: string, id: string) {
    await this.assertItemOwner(userId, resumeId, id);
    await this.prisma.education.delete({ where: { id } });
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
    const item = await this.prisma.education.findFirst({
      where: { id, resumeId },
    });
    if (!item) throw new NotFoundException('Formation introuvable');
  }
}
