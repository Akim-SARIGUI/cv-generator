import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExtraDto, UpdateExtraDto } from './dto/extra.dto';

@Injectable()
export class ExtrasService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, resumeId: string) {
    await this.assertOwner(userId, resumeId);
    return this.prisma.extraEntry.findMany({
      where: { resumeId },
      orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async create(userId: string, resumeId: string, dto: CreateExtraDto) {
    await this.assertOwner(userId, resumeId);
    const count = await this.prisma.extraEntry.count({
      where: { resumeId, kind: dto.kind },
    });
    return this.prisma.extraEntry.create({
      data: {
        resumeId,
        kind: dto.kind,
        title: dto.title,
        subtitle: dto.subtitle,
        dateLabel: dto.dateLabel,
        description: dto.description,
        url: dto.url,
        sortOrder: dto.sortOrder ?? count,
      },
    });
  }

  async update(
    userId: string,
    resumeId: string,
    id: string,
    dto: UpdateExtraDto,
  ) {
    await this.assertItemOwner(userId, resumeId, id);
    return this.prisma.extraEntry.update({
      where: { id },
      data: {
        kind: dto.kind,
        title: dto.title,
        subtitle: dto.subtitle,
        dateLabel: dto.dateLabel,
        description: dto.description,
        url: dto.url,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(userId: string, resumeId: string, id: string) {
    await this.assertItemOwner(userId, resumeId, id);
    await this.prisma.extraEntry.delete({ where: { id } });
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
    const item = await this.prisma.extraEntry.findFirst({
      where: { id, resumeId },
    });
    if (!item) throw new NotFoundException('Entrée introuvable');
  }
}
