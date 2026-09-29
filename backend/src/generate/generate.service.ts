import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { coded } from '../common/coded-exception';
import PDFDocument = require('pdfkit');
import type { Response } from 'express';
import type PDFKit from 'pdfkit';
import { SkillCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TranslateService } from '../translate/translate.service';
import {
  getTemplateDef,
  type TemplateDefinition,
} from '../common/cv-templates';
import { normalizeSections } from '../common/sections';
import {
  contactParts,
  drawFooter,
  ensureSpace,
  bulletLines,
  formatPeriod,
  labelsFor,
  yearPeriod,
  resolvePhotoPath,
  sectionTitle,
  skillCategoryLabel,
  type ResumePdfData,
} from './pdf-helpers';

@Injectable()
export class GenerateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translateService: TranslateService,
  ) {}

  async getLocalizedResume(
    userId: string,
    resumeId: string,
    localeOverride?: string,
  ) {
    const resume = await this.loadResume(userId, resumeId);
    const locale =
      localeOverride === 'en' || localeOverride === 'fr'
        ? localeOverride
        : resume.locale;
    return this.translateService.localizeResume(resume, locale);
  }

  async generatePdf(
    userId: string,
    resumeId: string,
    res: Response,
    localeOverride?: string,
  ) {
    const resume = await this.loadResume(userId, resumeId);
    const locale =
      localeOverride === 'en' || localeOverride === 'fr'
        ? localeOverride
        : resume.locale;
    const data = (await this.translateService.localizeResume(
      resume,
      locale,
    )) as unknown as ResumePdfData;

    const personal = data.personal;
    const safeName = (personal?.fullName || 'cv')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeName || 'cv'}.pdf"`,
    );

    const theme = getTemplateDef(data.template);
    const zeroMargin = theme.layout === 'sidebar' || theme.layout === 'banner';
    const doc = new PDFDocument({
      margin: zeroMargin ? 0 : 48,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: data.title,
        Author: personal?.fullName || 'CV Studio',
      },
    });

    doc.pipe(res);

    switch (theme.layout) {
      case 'ats':
        this.renderAts(doc, data, theme);
        break;
      case 'sidebar':
        this.renderSidebar(doc, data, theme);
        break;
      case 'minimal':
        this.renderMinimal(doc, data, theme);
        break;
      case 'banner':
        this.renderBanner(doc, data, theme);
        break;
      case 'executive':
        this.renderExecutive(doc, data, theme);
        break;
      case 'timeline':
        this.renderTimeline(doc, data, theme);
        break;
      case 'twocol':
        this.renderTwoCol(doc, data, theme);
        break;
      case 'elegant':
        this.renderElegant(doc, data, theme);
        break;
      case 'classic':
      default:
        this.renderClassic(doc, data, theme);
        break;
    }

    drawFooter(doc, labelsFor(data), theme.muted || '#5c6b7a');
    doc.end();
  }

  private async loadResume(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        personal: true,
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] },
        extras: { orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }] },
      },
    });
    if (!resume) throw coded(NotFoundException, 'RESUME_NOT_FOUND');
    if (resume.userId !== userId) {
      throw coded(ForbiddenException, 'RESUME_FORBIDDEN');
    }
    return resume;
  }

  private renderClassic(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const accent = theme.accent;
    const muted = theme.muted || '#5c6b7a';
    const personal = data.personal;
    const photo = theme.showsPhoto
      ? resolvePhotoPath(personal?.photoUrl)
      : null;
    const left = 48;
    const contentWidth = doc.page.width - 96;

    if (personal?.fullName || photo) {
      const headerTop = doc.y;
      const photoW = 78;
      const photoH = 100;
      if (photo) {
        doc.image(photo, doc.page.width - 48 - photoW, headerTop, {
          fit: [photoW, photoH],
        });
      }
      const textWidth = photo ? contentWidth - photoW - 16 : contentWidth;
      if (personal?.fullName) {
        doc
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor(accent)
          .text(personal.fullName.toUpperCase(), left, headerTop, {
            width: textWidth,
          });
      }
      const parts = contactParts(personal);
      if (parts.length) {
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(muted)
          .text(parts.join('  ·  '), left, doc.y + 4, { width: textWidth });
      }
      doc.y = Math.max(doc.y, headerTop + (photo ? photoH : 0)) + 14;
    }

    this.drawHairline(doc, left, contentWidth, '#d0d7de');
    this.writeProfileBlocks(doc, data, accent);
    this.writeExperiences(doc, data, accent, muted);
    this.writeEducations(doc, data, accent, muted);
    this.writeSkills(doc, data, accent);
    this.writeExtras(doc, data, accent, muted);
  }

  private renderAts(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const ink = theme.accent;
    const muted = '#444444';
    const personal = data.personal;

    if (personal?.fullName) {
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor(ink)
        .text(personal.fullName, { align: 'center' });
      doc.moveDown(0.25);
    }
    const parts = contactParts(personal);
    if (parts.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(muted)
        .text(parts.join(' | '), { align: 'center' });
      doc.moveDown(0.7);
    }
    this.writeProfileBlocks(doc, data, ink, true);
    this.writeExperiences(doc, data, ink, muted, true);
    this.writeEducations(doc, data, ink, muted, true);
    this.writeSkills(doc, data, ink, true);
    this.writeExtras(doc, data, ink, muted, true);
  }

  private renderSidebar(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const sidebarW = 185;
    const accent = theme.accent;
    const personal = data.personal;
    const photo = theme.showsPhoto
      ? resolvePhotoPath(personal?.photoUrl)
      : null;
    const pageH = doc.page.height;
    const pageW = doc.page.width;

    const paintSidebar = () => {
      doc.rect(0, 0, sidebarW, pageH).fill(accent);
    };
    paintSidebar();

    let sideY = 36;
    if (photo) {
      const size = 96;
      const x = (sidebarW - size) / 2;
      doc.save();
      doc.circle(x + size / 2, sideY + size / 2, size / 2).clip();
      doc.image(photo, x, sideY, { cover: [size, size] });
      doc.restore();
      sideY += size + 18;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#ffffff')
      .text(labels.contact.toUpperCase(), 20, sideY, { width: sidebarW - 40 });
    sideY = doc.y + 8;
    doc.font('Helvetica').fontSize(8).fillColor('#e8f1f3');
    for (const line of contactParts(personal)) {
      doc.text(line, 20, sideY, { width: sidebarW - 40 });
      sideY = doc.y + 6;
    }

    if (data.skills.length) {
      sideY += 10;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#ffffff')
        .text(labels.skills.toUpperCase(), 20, sideY, {
          width: sidebarW - 40,
        });
      sideY = doc.y + 8;
      doc.font('Helvetica').fontSize(8).fillColor('#e8f1f3');
      for (const [label, items] of this.skillLines(labels, data.skills)) {
        doc.text(`${label} : ${items.join(', ')}.`, 20, sideY, {
          width: sidebarW - 40,
        });
        sideY = doc.y + 4;
      }
    }

    const mainX = sidebarW + 28;
    const mainW = pageW - mainX - 28;
    doc.x = mainX;
    doc.y = 40;

    if (personal?.fullName) {
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(accent)
        .text(personal.fullName, mainX, 40, { width: mainW });
      doc.moveDown(0.5);
    }
    if (personal?.summary) {
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(accent)
        .text(labels.profile.toUpperCase(), mainX, doc.y, { width: mainW });
      doc.moveDown(0.3);
      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor('#222')
        .text(personal.summary, mainX, doc.y, {
          width: mainW,
          align: 'justify',
          lineGap: 1.5,
        });
      doc.moveDown(0.7);
    }

    if (data.experiences.length) {
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(accent)
        .text(labels.experience.toUpperCase(), mainX, doc.y, { width: mainW });
      doc.moveDown(0.35);
      for (const exp of data.experiences) {
        if (doc.y > pageH - 70) {
          doc.addPage();
          paintSidebar();
          doc.x = mainX;
          doc.y = 40;
        }
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#222')
          .text(exp.jobTitle, mainX, doc.y, { width: mainW });
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#555')
          .text(
            [
              exp.company,
              formatPeriod(
                labels,
                data.locale,
                exp.startDate,
                exp.endDate,
                exp.currentJob,
              ),
              exp.location,
            ]
              .filter(Boolean)
              .join(' · '),
            mainX,
            doc.y,
            { width: mainW },
          );
        if (exp.description) {
          doc
            .moveDown(0.15)
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#333')
            .text(exp.description, mainX, doc.y, { width: mainW, lineGap: 1 });
        }
        doc.moveDown(0.55);
      }
    }

    if (data.educations.length) {
      if (doc.y > pageH - 70) {
        doc.addPage();
        paintSidebar();
        doc.x = mainX;
        doc.y = 40;
      }
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(accent)
        .text(labels.education.toUpperCase(), mainX, doc.y, { width: mainW });
      doc.moveDown(0.35);
      for (const edu of data.educations) {
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#222')
          .text(edu.degree, mainX, doc.y, { width: mainW });
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#555')
          .text(
            [
              edu.institution,
              formatPeriod(
                labels,
                data.locale,
                edu.startDate,
                edu.endDate,
                edu.currentEducation,
              ),
            ]
              .filter(Boolean)
              .join(' · '),
            mainX,
            doc.y,
            { width: mainW },
          );
        doc.moveDown(0.45);
      }
    }
  }

  private renderMinimal(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const ink = theme.accent;
    const muted = '#6b7280';
    const personal = data.personal;
    const photo = theme.showsPhoto
      ? resolvePhotoPath(personal?.photoUrl)
      : null;

    doc.page.margins = { top: 48, bottom: 48, left: 48, right: 48 };
    doc.x = 48;
    doc.y = 48;

    if (personal?.fullName) {
      doc.font('Helvetica-Bold').fontSize(26).fillColor(ink).text(personal.fullName);
      doc.moveDown(0.2);
    }
    if (photo) {
      doc.image(photo, doc.page.width - 48 - 64, 48, { fit: [64, 80] });
    }
    const parts = contactParts(personal);
    if (parts.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(muted)
        .text(parts.join('  ·  '), { width: doc.page.width - 160 });
      doc.moveDown(1);
    }
    if (personal?.summary) {
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#333')
        .text(personal.summary, { lineGap: 2.5 });
      doc.moveDown(1);
    }
    if (data.experiences.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(muted)
        .text(labels.experience.toUpperCase(), { characterSpacing: 1.2 });
      doc.moveDown(0.5);
      for (const exp of data.experiences) {
        ensureSpace(doc, 60);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(ink).text(exp.jobTitle);
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(muted)
          .text(
            `${exp.company}  ·  ${formatPeriod(
              labels,
              data.locale,
              exp.startDate,
              exp.endDate,
              exp.currentJob,
            )}`,
          );
        if (exp.description) {
          doc
            .moveDown(0.2)
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#333')
            .text(exp.description, { lineGap: 1.5 });
        }
        doc.moveDown(0.7);
      }
    }
    if (data.educations.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(muted)
        .text(labels.education.toUpperCase(), { characterSpacing: 1.2 });
      doc.moveDown(0.5);
      for (const edu of data.educations) {
        ensureSpace(doc, 45);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(ink).text(edu.degree);
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(muted)
          .text(
            `${edu.institution}  ·  ${formatPeriod(
              labels,
              data.locale,
              edu.startDate,
              edu.endDate,
              edu.currentEducation,
            )}`,
          );
        doc.moveDown(0.55);
      }
    }
    if (data.skills.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(muted)
        .text(labels.skills.toUpperCase(), { characterSpacing: 1.2 });
      doc.moveDown(0.4);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(ink)
        .text(data.skills.map((s) => s.name).join('   ·   '));
    }
  }

  private renderBanner(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const accent = theme.accent;
    const personal = data.personal;
    const photo = theme.showsPhoto
      ? resolvePhotoPath(personal?.photoUrl)
      : null;
    const bannerH = 118;

    doc.rect(0, 0, doc.page.width, bannerH).fill(accent);
    if (photo) {
      doc.image(photo, 36, 22, { fit: [74, 74] });
    }
    const textX = photo ? 126 : 40;
    if (personal?.fullName) {
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#ffffff')
        .text(personal.fullName, textX, 34, {
          width: doc.page.width - textX - 40,
        });
    }
    const parts = contactParts(personal);
    if (parts.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#f8fafc')
        .text(parts.join('  ·  '), textX, doc.y + 4, {
          width: doc.page.width - textX - 40,
        });
    }

    doc.x = 48;
    doc.y = bannerH + 28;
    doc.page.margins = { top: 48, bottom: 48, left: 48, right: 48 };

    if (personal?.summary) {
      sectionTitle(doc, labels.profile, accent);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#222')
        .text(personal.summary, { align: 'justify', lineGap: 2 });
      doc.moveDown(0.7);
    }
    this.writeExperiences(doc, data, accent, '#5c6b7a');
    this.writeEducations(doc, data, accent, '#5c6b7a');
    this.writeSkills(doc, data, accent);
    this.writeExtras(doc, data, accent, '#5c6b7a');
  }

  private renderExecutive(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const accent = theme.accent;
    const personal = data.personal;
    const photo = theme.showsPhoto
      ? resolvePhotoPath(personal?.photoUrl)
      : null;

    if (photo) {
      doc.image(photo, doc.page.width - 48 - 70, 48, { fit: [70, 88] });
    }
    if (personal?.fullName) {
      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor(accent)
        .text(personal.fullName, 48, 52, {
          width: doc.page.width - (photo ? 140 : 96),
        });
    }
    doc
      .moveTo(48, doc.y + 8)
      .lineTo(220, doc.y + 8)
      .strokeColor(accent)
      .lineWidth(2.5)
      .stroke();
    doc.moveDown(0.8);
    const parts = contactParts(personal);
    if (parts.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#555')
        .text(parts.join('   ·   '));
      doc.moveDown(0.8);
    }
    if (personal?.summary) {
      sectionTitle(doc, labels.profile, accent);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#222')
        .text(personal.summary, { align: 'justify', lineGap: 2 });
      doc.moveDown(0.7);
    }
    this.writeExperiences(doc, data, accent, '#5c6b7a');
    this.writeEducations(doc, data, accent, '#5c6b7a');
    this.writeSkills(doc, data, accent);
    this.writeExtras(doc, data, accent, '#5c6b7a');
  }

  private renderTimeline(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const accent = theme.accent;
    const personal = data.personal;
    const photo = theme.showsPhoto
      ? resolvePhotoPath(personal?.photoUrl)
      : null;

    if (personal?.fullName) {
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(accent)
        .text(personal.fullName);
    }
    if (photo) {
      doc.image(photo, doc.page.width - 48 - 68, 48, { fit: [68, 86] });
    }
    const parts = contactParts(personal);
    if (parts.length) {
      doc.font('Helvetica').fontSize(9).fillColor('#666').text(parts.join(' · '));
      doc.moveDown(0.7);
    }
    if (personal?.summary) {
      sectionTitle(doc, labels.profile, accent);
      doc.font('Helvetica').fontSize(10).fillColor('#222').text(personal.summary);
      doc.moveDown(0.6);
    }

    if (data.experiences.length) {
      sectionTitle(doc, labels.experience, accent);
      const axisX = 58;
      for (const exp of data.experiences) {
        ensureSpace(doc, 70);
        const y = doc.y;
        doc.circle(axisX, y + 4, 3.5).fill(accent);
        doc
          .moveTo(axisX, y + 8)
          .lineTo(axisX, y + 52)
          .strokeColor('#cbd5e1')
          .lineWidth(1)
          .stroke();
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#222')
          .text(exp.jobTitle, axisX + 16, y, {
            width: doc.page.width - axisX - 64,
          });
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#666')
          .text(
            [
              exp.company,
              formatPeriod(
                labels,
                data.locale,
                exp.startDate,
                exp.endDate,
                exp.currentJob,
              ),
            ]
              .filter(Boolean)
              .join(' · '),
            axisX + 16,
            doc.y,
            { width: doc.page.width - axisX - 64 },
          );
        if (exp.description) {
          doc
            .font('Helvetica')
            .fontSize(9.5)
            .fillColor('#333')
            .text(exp.description, axisX + 16, doc.y + 2, {
              width: doc.page.width - axisX - 64,
            });
        }
        doc.moveDown(0.7);
      }
    }

    this.writeEducations(doc, data, accent, '#5c6b7a');
    this.writeSkills(doc, data, accent);
    this.writeExtras(doc, data, accent, '#5c6b7a');
  }

  private renderTwoCol(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const accent = theme.accent;
    const personal = data.personal;
    const photo = theme.showsPhoto
      ? resolvePhotoPath(personal?.photoUrl)
      : null;
    const leftW = 185;
    const gap = 22;
    const rightX = 48 + leftW + gap;
    const rightW = doc.page.width - rightX - 48;

    if (personal?.fullName) {
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(accent)
        .text(personal.fullName, 48, 48, {
          width: doc.page.width - 96,
        });
      doc.moveDown(0.3);
    }
    this.drawHairline(doc, 48, doc.page.width - 96, accent);

    let leftY = doc.y + 8;
    let rightY = leftY;

    if (photo) {
      doc.image(photo, 48, leftY, { fit: [72, 92] });
      leftY += 100;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(accent)
      .text(labels.contact.toUpperCase(), 48, leftY, { width: leftW });
    leftY = doc.y + 6;
    doc.font('Helvetica').fontSize(8).fillColor('#444');
    for (const line of contactParts(personal)) {
      doc.text(line, 48, leftY, { width: leftW });
      leftY = doc.y + 4;
    }

    if (data.skills.length) {
      leftY += 10;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(accent)
        .text(labels.skills.toUpperCase(), 48, leftY, { width: leftW });
      leftY = doc.y + 6;
      doc.font('Helvetica').fontSize(8).fillColor('#333');
      for (const [label, items] of this.skillLines(labels, data.skills)) {
        doc.text(`${label} : ${items.join(', ')}.`, 48, leftY, { width: leftW });
        leftY = doc.y + 3;
      }
    }

    doc.x = rightX;
    doc.y = rightY;
    if (personal?.summary) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(accent)
        .text(labels.profile.toUpperCase(), rightX, doc.y, { width: rightW });
      doc.moveDown(0.25);
      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor('#222')
        .text(personal.summary, rightX, doc.y, { width: rightW, lineGap: 1.5 });
      doc.moveDown(0.6);
    }
    if (data.experiences.length) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(accent)
        .text(labels.experience.toUpperCase(), rightX, doc.y, { width: rightW });
      doc.moveDown(0.3);
      for (const exp of data.experiences) {
        ensureSpace(doc, 60);
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#222')
          .text(exp.jobTitle, rightX, doc.y, { width: rightW });
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor('#666')
          .text(
            [
              exp.company,
              formatPeriod(
                labels,
                data.locale,
                exp.startDate,
                exp.endDate,
                exp.currentJob,
              ),
            ]
              .filter(Boolean)
              .join(' · '),
            rightX,
            doc.y,
            { width: rightW },
          );
        if (exp.description) {
          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#333')
            .text(exp.description, rightX, doc.y + 2, { width: rightW });
        }
        doc.moveDown(0.5);
      }
    }
    if (data.educations.length) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(accent)
        .text(labels.education.toUpperCase(), rightX, doc.y, { width: rightW });
      doc.moveDown(0.3);
      for (const edu of data.educations) {
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#222')
          .text(edu.degree, rightX, doc.y, { width: rightW });
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor('#666')
          .text(edu.institution, rightX, doc.y, { width: rightW });
        doc.moveDown(0.4);
      }
    }
  }

  private renderElegant(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    theme: TemplateDefinition,
  ) {
    const labels = labelsFor(data);
    const accent = theme.accent;
    const personal = data.personal;
    const photo = theme.showsPhoto
      ? resolvePhotoPath(personal?.photoUrl)
      : null;

    if (personal?.fullName) {
      doc
        .font('Times-Bold')
        .fontSize(26)
        .fillColor(accent)
        .text(personal.fullName, { align: 'center' });
      doc.moveDown(0.25);
    }
    if (photo) {
      const w = 62;
      const x = (doc.page.width - w) / 2;
      doc.image(photo, x, doc.y, { fit: [w, 78] });
      doc.y += 86;
    }
    const parts = contactParts(personal);
    if (parts.length) {
      doc
        .font('Times-Roman')
        .fontSize(9)
        .fillColor('#666')
        .text(parts.join('  ·  '), { align: 'center' });
      doc.moveDown(0.8);
    }
    this.drawHairline(doc, 120, doc.page.width - 240, accent);

    if (personal?.summary) {
      doc
        .font('Times-Bold')
        .fontSize(12)
        .fillColor(accent)
        .text(labels.profile, { align: 'center' });
      doc.moveDown(0.3);
      doc
        .font('Times-Roman')
        .fontSize(10)
        .fillColor('#333')
        .text(personal.summary, { align: 'center', lineGap: 2 });
      doc.moveDown(0.8);
    }

    if (data.experiences.length) {
      doc
        .font('Times-Bold')
        .fontSize(12)
        .fillColor(accent)
        .text(labels.experience, { align: 'center' });
      doc.moveDown(0.4);
      for (const exp of data.experiences) {
        ensureSpace(doc, 60);
        doc
          .font('Times-Bold')
          .fontSize(11)
          .fillColor('#222')
          .text(exp.jobTitle, { align: 'left' });
        doc
          .font('Times-Italic')
          .fontSize(9)
          .fillColor('#666')
          .text(
            `${exp.company} — ${formatPeriod(
              labels,
              data.locale,
              exp.startDate,
              exp.endDate,
              exp.currentJob,
            )}`,
          );
        if (exp.description) {
          doc
            .font('Times-Roman')
            .fontSize(10)
            .fillColor('#333')
            .text(exp.description);
        }
        doc.moveDown(0.55);
      }
    }

    if (data.educations.length) {
      doc
        .font('Times-Bold')
        .fontSize(12)
        .fillColor(accent)
        .text(labels.education, { align: 'center' });
      doc.moveDown(0.4);
      for (const edu of data.educations) {
        ensureSpace(doc, 45);
        doc.font('Times-Bold').fontSize(11).fillColor('#222').text(edu.degree);
        doc
          .font('Times-Italic')
          .fontSize(9)
          .fillColor('#666')
          .text(edu.institution);
        doc.moveDown(0.45);
      }
    }

    if (data.skills.length) {
      doc
        .font('Times-Bold')
        .fontSize(12)
        .fillColor(accent)
        .text(labels.skills, { align: 'center' });
      doc.moveDown(0.35);
      doc
        .font('Times-Roman')
        .fontSize(10)
        .fillColor('#333')
        .text(data.skills.map((s) => s.name).join('  ·  '), {
          align: 'center',
        });
    }
  }

  private sectionOn(data: ResumePdfData, key: string) {
    return normalizeSections(data.sections)[key as keyof ReturnType<typeof normalizeSections>];
  }

  private writeProfileBlocks(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    accent: string,
    ats = false,
  ) {
    const labels = labelsFor(data);
    const personal = data.personal;
    if (this.sectionOn(data, 'profile') && personal?.summary) {
      sectionTitle(doc, labels.profile, accent);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(ats ? accent : '#222')
        .text(personal.summary, {
          align: ats ? 'left' : 'justify',
          lineGap: 1.5,
        });
      doc.moveDown(0.6);
    }
    if (this.sectionOn(data, 'objective') && personal?.objective) {
      sectionTitle(doc, labels.objective, accent);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#222')
        .text(personal.objective, { align: 'justify', lineGap: 1.5 });
      doc.moveDown(0.6);
    }
  }

  private writeExtras(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    accent: string,
    muted: string,
    compact = false,
  ) {
    const labels = labelsFor(data);
    const extras = data.extras || [];
    const groups: Array<{
      key:
        | 'languages'
        | 'certifications'
        | 'awards'
        | 'projects'
        | 'interests'
        | 'references';
      kind: string;
      title: string;
    }> = [
      { key: 'languages', kind: 'LANGUAGE', title: labels.languages },
      {
        key: 'certifications',
        kind: 'CERTIFICATION',
        title: labels.certifications,
      },
      { key: 'awards', kind: 'AWARD', title: labels.awards },
      { key: 'projects', kind: 'PROJECT', title: labels.projects },
      { key: 'interests', kind: 'INTEREST', title: labels.interests },
      { key: 'references', kind: 'REFERENCE', title: labels.references },
    ];

    for (const group of groups) {
      if (!this.sectionOn(data, group.key)) continue;
      const items = extras.filter((e) => e.kind === group.kind);
      if (!items.length) continue;
      sectionTitle(doc, group.title, accent);
      if (group.key === 'languages') {
        for (const item of items) {
          ensureSpace(doc, 28);
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#222')
            .text(item.title, { continued: true })
            .font('Helvetica')
            .fillColor(muted)
            .text(item.subtitle ? `  —  ${item.subtitle}` : '');
        }
        doc.moveDown(0.45);
        continue;
      }
      if (group.key === 'interests' || compact) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#222')
          .text(items.map((i) => i.title).join(compact ? ', ' : '  ·  '));
        doc.moveDown(0.5);
        continue;
      }
      for (const item of items) {
        ensureSpace(doc, 45);
        if (group.key === 'projects') {
          const detail = [item.subtitle, item.description].filter(Boolean).join(' — ');
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#222')
            .text(item.title, { continued: Boolean(detail) })
            .font('Helvetica')
            .text(detail ? ` : ${detail}` : '');
          doc.moveDown(0.35);
          continue;
        }
        const period = item.dateLabel?.trim();
        const head = [item.title, item.subtitle].filter(Boolean).join(' — ');
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#222')
          .text(period ? `${period} : ${head}` : head);
        for (const line of bulletLines(item.description)) {
          doc.font('Helvetica').fontSize(9.5).fillColor('#333').text(`• ${line}`);
        }
        doc.moveDown(0.4);
      }
    }
  }

  private writeExperiences(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    accent: string,
    muted: string,
    ats = false,
  ) {
    if (!this.sectionOn(data, 'experience') || !data.experiences.length) return;
    const labels = labelsFor(data);
    sectionTitle(doc, labels.experience, accent);
    const present = data.locale === 'en' ? 'Present' : 'Présent';
    for (const exp of data.experiences) {
      ensureSpace(doc, 70);
      const period = yearPeriod(
        exp.startDate,
        exp.endDate,
        exp.currentJob,
        present,
      );
      const place = [exp.company, exp.location].filter(Boolean).join(', ');
      const title = place ? `${exp.jobTitle} — ${place}` : exp.jobTitle;
      doc
        .font('Helvetica-Bold')
        .fontSize(ats ? 11 : 10)
        .fillColor(ats ? accent : '#222')
        .text(period ? `${period} : ${title}` : title);
      const lines = bulletLines(exp.description);
      if (lines.length) {
        doc.moveDown(0.15);
        for (const line of lines) {
          doc.font('Helvetica').fontSize(10).fillColor('#333').text(`• ${line}`);
        }
      }
      doc.moveDown(0.55);
    }
  }

  private writeEducations(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    accent: string,
    muted: string,
    ats = false,
  ) {
    if (!this.sectionOn(data, 'education') || !data.educations.length) return;
    const labels = labelsFor(data);
    sectionTitle(doc, labels.education, accent);
    const ongoing = data.locale === 'en' ? 'Ongoing' : 'En cours';
    for (const edu of data.educations) {
      ensureSpace(doc, 55);
      const period = yearPeriod(
        edu.startDate,
        edu.endDate,
        edu.currentEducation,
        ongoing,
      );
      const place = [edu.institution, edu.location].filter(Boolean).join(', ');
      const lines = bulletLines(edu.description);
      const mention = lines.length === 1 && lines[0].length <= 80 ? lines[0] : '';
      const degree = mention ? `${edu.degree} (${mention})` : edu.degree;
      const title = place ? `${degree} — ${place}` : degree;
      doc
        .font('Helvetica-Bold')
        .fontSize(ats ? 11 : 10)
        .fillColor(ats ? accent : '#222')
        .text(period ? `${period} : ${title}` : title);
      if (!mention) {
        for (const line of lines) {
          doc.font('Helvetica').fontSize(10).fillColor('#333').text(`• ${line}`);
        }
      }
      doc.moveDown(0.5);
    }
  }

  private skillLines(
    labels: ReturnType<typeof labelsFor>,
    skills: ResumePdfData['skills'],
  ) {
    const byCategory = new Map<string, string[]>();
    for (const skill of skills) {
      if (skill.category === 'LANGUAGE') continue;
      const label = skillCategoryLabel(labels, skill.category);
      const list = byCategory.get(label) ?? [];
      list.push(skill.name);
      byCategory.set(label, list);
    }
    return byCategory;
  }

  private writeSkills(
    doc: PDFKit.PDFDocument,
    data: ResumePdfData,
    accent: string,
    compact = false,
  ) {
    if (!this.sectionOn(data, 'skills') || !data.skills.length) return;
    const labels = labelsFor(data);
    sectionTitle(doc, labels.skills, accent);
    if (compact) {
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#222')
        .text(
          data.skills
            .filter((s) => s.category !== 'LANGUAGE')
            .map((s) => s.name)
            .join(', '),
        );
      return;
    }
    const byCategory = new Map<SkillCategory, string[]>();
    for (const skill of data.skills) {
      if (skill.category === 'LANGUAGE') continue;
      const list = byCategory.get(skill.category) ?? [];
      list.push(skill.name);
      byCategory.set(skill.category, list);
    }
    for (const [category, items] of byCategory) {
      ensureSpace(doc, 36);
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#222')
        .text(`${skillCategoryLabel(labels, category)} : `, { continued: true })
        .font('Helvetica')
        .fillColor('#333')
        .text(`${items.join(', ')}.`);
      doc.moveDown(0.35);
    }
  }

  private drawHairline(
    doc: PDFKit.PDFDocument,
    x: number,
    width: number,
    color: string,
  ) {
    const y = doc.y;
    doc
      .moveTo(x, y)
      .lineTo(x + width, y)
      .strokeColor(color)
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.5);
  }
}
