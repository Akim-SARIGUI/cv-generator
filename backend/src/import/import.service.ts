import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { coded } from '../common/coded-exception';
import { ExtraKind, SkillCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeSections } from '../common/sections';
import { extractTextFromUpload } from './cv-text-extract';
import { parseCvText } from './cv-parser';
import type { ExtractedCvDraft } from './extracted-cv.types';
import { ApplyImportDto } from './dto/apply-import.dto';

const resumeInclude = {
  personal: true,
  experiences: { orderBy: { sortOrder: 'asc' as const } },
  educations: { orderBy: { sortOrder: 'asc' as const } },
  skills: { orderBy: { sortOrder: 'asc' as const } },
  extras: { orderBy: [{ kind: 'asc' as const }, { sortOrder: 'asc' as const }] },
};

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async parseUpload(
    userId: string,
    resumeId: string,
    file: Express.Multer.File,
  ): Promise<ExtractedCvDraft> {
    await this.assertOwner(userId, resumeId);
    const source = await extractTextFromUpload(file);
    return parseCvText(source.text, {
      sourceName: source.sourceName,
      sourceType: source.sourceType,
    });
  }

  async applyDraft(
    userId: string,
    resumeId: string,
    dto: ApplyImportDto,
  ) {
    await this.assertOwner(userId, resumeId);
    const replace = dto.replaceExisting !== false;

    return this.prisma.$transaction(async (tx) => {
      const personalData = {
        fullName: (dto.personal.fullName || '').trim() || 'À compléter',
        email: dto.personal.email?.trim() || null,
        phone: dto.personal.phone?.trim() || null,
        address: dto.personal.address?.trim() || null,
        linkedinUrl: dto.personal.linkedinUrl?.trim() || null,
        githubUrl: dto.personal.githubUrl?.trim() || null,
        websiteUrl: dto.personal.websiteUrl?.trim() || null,
        summary: dto.personal.summary?.trim() || null,
        objective: dto.personal.objective?.trim() || null,
      };

      await tx.personalInfo.upsert({
        where: { resumeId },
        create: { resumeId, ...personalData },
        update: personalData,
      });

      if (replace) {
        await tx.experience.deleteMany({ where: { resumeId } });
        await tx.education.deleteMany({ where: { resumeId } });
        await tx.skill.deleteMany({ where: { resumeId } });
        await tx.extraEntry.deleteMany({ where: { resumeId } });
      }

      if (dto.experiences?.length) {
        await tx.experience.createMany({
          data: dto.experiences.map((item, index) => ({
            resumeId,
            jobTitle: item.jobTitle,
            company: item.company,
            location: item.location || null,
            startDate: toDate(item.startDate),
            endDate: item.currentJob ? null : toDate(item.endDate),
            currentJob: Boolean(item.currentJob),
            description: item.description || null,
            sortOrder: index,
          })),
        });
      }

      if (dto.educations?.length) {
        await tx.education.createMany({
          data: dto.educations.map((item, index) => ({
            resumeId,
            degree: item.degree,
            institution: item.institution,
            location: item.location || null,
            startDate: toDate(item.startDate),
            endDate: item.currentEducation ? null : toDate(item.endDate),
            currentEducation: Boolean(item.currentEducation),
            description: item.description || null,
            sortOrder: index,
          })),
        });
      }

      if (dto.skills?.length) {
        await tx.skill.createMany({
          data: dto.skills.map((item, index) => ({
            resumeId,
            name: item.name,
            category: (item.category || 'TECHNICAL') as SkillCategory,
            proficiency: 3,
            sortOrder: index,
          })),
        });
      }

      if (dto.extras?.length) {
        await tx.extraEntry.createMany({
          data: dto.extras.map((item, index) => ({
            resumeId,
            kind: item.kind as ExtraKind,
            title: item.title,
            subtitle: item.subtitle || null,
            dateLabel: item.dateLabel || null,
            description: item.description || null,
            url: item.url || null,
            sortOrder: index,
          })),
        });
      }

      const sections = normalizeSections({
        profile: Boolean(personalData.summary),
        objective: Boolean(personalData.objective),
        experience: (dto.experiences?.length || 0) > 0,
        education: (dto.educations?.length || 0) > 0,
        skills: (dto.skills?.length || 0) > 0,
        languages: dto.extras?.some((e) => e.kind === 'LANGUAGE') || false,
        certifications:
          dto.extras?.some((e) => e.kind === 'CERTIFICATION') || false,
        awards: dto.extras?.some((e) => e.kind === 'AWARD') || false,
        projects: dto.extras?.some((e) => e.kind === 'PROJECT') || false,
        interests: dto.extras?.some((e) => e.kind === 'INTEREST') || false,
        references: dto.extras?.some((e) => e.kind === 'REFERENCE') || false,
      });

      // Garde les sections de base actives même si vides pour permettre l’édition
      sections.profile = true;
      sections.experience = true;
      sections.education = true;
      sections.skills = true;
      sections.languages = true;

      return tx.resume.update({
        where: { id: resumeId },
        data: { sections },
        include: resumeInclude,
      });
    });
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

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
