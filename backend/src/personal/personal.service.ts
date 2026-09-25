import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPersonalDto } from './dto/personal.dto';

@Injectable()
export class PersonalService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, resumeId: string, dto: UpsertPersonalDto) {
    await this.assertOwner(userId, resumeId);

    return this.prisma.personalInfo.upsert({
      where: { resumeId },
      create: { resumeId, ...dto },
      update: { ...dto },
    });
  }

  async get(userId: string, resumeId: string) {
    await this.assertOwner(userId, resumeId);
    const personal = await this.prisma.personalInfo.findUnique({
      where: { resumeId },
    });
    if (!personal) throw new NotFoundException('Infos personnelles introuvables');
    return personal;
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
}
