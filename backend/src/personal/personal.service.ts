import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { coded } from '../common/coded-exception';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { resolveUploadAbsolute, uploadsRoot } from '../common/uploads-path';
import { UpsertPersonalDto } from './dto/personal.dto';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 2 * 1024 * 1024;

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
    if (!personal) throw coded(NotFoundException, 'PERSONAL_NOT_FOUND');
    return personal;
  }

  async uploadPhoto(
    userId: string,
    resumeId: string,
    file?: Express.Multer.File,
  ) {
    await this.assertOwner(userId, resumeId);

    if (!file) {
      throw coded(BadRequestException, 'FILE_MISSING');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw coded(BadRequestException, 'PHOTO_FORMAT');
    }
    if (file.size > MAX_BYTES) {
      throw coded(BadRequestException, 'PHOTO_TOO_LARGE');
    }

    const ext =
      file.mimetype === 'image/png'
        ? '.png'
        : file.mimetype === 'image/webp'
          ? '.webp'
          : '.jpg';

    const dir = join(uploadsRoot(), 'photos', userId);
    mkdirSync(dir, { recursive: true });

    const existing = await this.prisma.personalInfo.findUnique({
      where: { resumeId },
      select: { photoUrl: true },
    });
    if (existing?.photoUrl?.startsWith('/uploads/')) {
      const previous = resolveUploadAbsolute(existing.photoUrl);
      if (existsSync(previous)) {
        try {
          unlinkSync(previous);
        } catch {
          /* ignore */
        }
      }
    }

    const filename = `${resumeId}${ext}`;
    const absolute = join(dir, filename);
    writeFileSync(absolute, file.buffer);

    const photoUrl = `/uploads/photos/${userId}/${filename}`;

    return this.prisma.personalInfo.upsert({
      where: { resumeId },
      create: {
        resumeId,
        fullName: '',
        photoUrl,
      },
      update: { photoUrl },
    });
  }

  async removePhoto(userId: string, resumeId: string) {
    await this.assertOwner(userId, resumeId);
    const personal = await this.prisma.personalInfo.findUnique({
      where: { resumeId },
    });
    if (!personal) throw coded(NotFoundException, 'PERSONAL_NOT_FOUND');

    if (personal.photoUrl?.startsWith('/uploads/')) {
      const absolute = resolveUploadAbsolute(personal.photoUrl);
      if (existsSync(absolute)) {
        try {
          unlinkSync(absolute);
        } catch {
          /* ignore */
        }
      }
    }

    return this.prisma.personalInfo.update({
      where: { resumeId },
      data: { photoUrl: null },
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
