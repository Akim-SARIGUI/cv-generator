import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SkillCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, resumeId: string) {
    await this.assertOwner(userId, resumeId);
    return this.prisma.skill.findMany({
      where: { resumeId },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async create(userId: string, resumeId: string, dto: CreateSkillDto) {
    await this.assertOwner(userId, resumeId);
    return this.prisma.skill.create({
      data: {
        resumeId,
        name: dto.name,
        category: dto.category ?? SkillCategory.TECHNICAL,
        proficiency: dto.proficiency ?? 3,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(
    userId: string,
    resumeId: string,
    id: string,
    dto: UpdateSkillDto,
  ) {
    await this.assertItemOwner(userId, resumeId, id);
    return this.prisma.skill.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        proficiency: dto.proficiency,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(userId: string, resumeId: string, id: string) {
    await this.assertItemOwner(userId, resumeId, id);
    await this.prisma.skill.delete({ where: { id } });
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
    const item = await this.prisma.skill.findFirst({
      where: { id, resumeId },
    });
    if (!item) throw new NotFoundException('Compétence introuvable');
  }
}
