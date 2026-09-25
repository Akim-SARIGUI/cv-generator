import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PDFDocument = require('pdfkit');
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { SkillCategory } from '@prisma/client';
import type PDFKit from 'pdfkit';

@Injectable()
export class GenerateService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePdf(userId: string, resumeId: string, res: Response) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        personal: true,
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] },
      },
    });

    if (!resume) throw new NotFoundException('CV introuvable');
    if (resume.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à ce CV');
    }

    const personal = resume.personal;
    const safeName = (personal?.fullName || 'cv')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeName || 'cv'}.pdf"`,
    );

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: resume.title,
        Author: personal?.fullName || 'CV Generator',
      },
    });

    doc.pipe(res);

    const accent = '#1e3a5f';
    const muted = '#5c6b7a';

    if (personal?.fullName) {
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(accent)
        .text(personal.fullName.toUpperCase(), { align: 'center' });
      doc.moveDown(0.4);
    }

    const contactParts = [
      personal?.email,
      personal?.phone,
      personal?.address,
      personal?.linkedinUrl ? `LinkedIn: ${personal.linkedinUrl}` : null,
      personal?.githubUrl ? `GitHub: ${personal.githubUrl}` : null,
      personal?.websiteUrl,
    ].filter(Boolean) as string[];

    if (contactParts.length) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(muted)
        .text(contactParts.join('  ·  '), { align: 'center' });
      doc.moveDown(0.8);
    }

    this.drawLine(doc);

    if (personal?.summary) {
      this.sectionTitle(doc, 'Profil professionnel', accent);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#222')
        .text(personal.summary, { align: 'justify', lineGap: 2 });
      doc.moveDown(0.8);
    }

    if (resume.experiences.length) {
      this.sectionTitle(doc, 'Expériences professionnelles', accent);
      for (const exp of resume.experiences) {
        this.ensureSpace(doc, 70);
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#222')
          .text(exp.jobTitle, { continued: true })
          .font('Helvetica')
          .fillColor(muted)
          .text(`  —  ${exp.company}`);

        const period = this.formatPeriod(
          exp.startDate,
          exp.endDate,
          exp.currentJob,
        );
        const meta = [period, exp.location].filter(Boolean).join(' · ');
        if (meta) {
          doc.font('Helvetica').fontSize(9).fillColor(muted).text(meta);
        }
        if (exp.description) {
          doc
            .moveDown(0.2)
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#333')
            .text(exp.description, { lineGap: 1.5 });
        }
        doc.moveDown(0.6);
      }
    }

    if (resume.educations.length) {
      this.sectionTitle(doc, 'Formations', accent);
      for (const edu of resume.educations) {
        this.ensureSpace(doc, 60);
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#222')
          .text(edu.degree, { continued: true })
          .font('Helvetica')
          .fillColor(muted)
          .text(`  —  ${edu.institution}`);

        const period = this.formatPeriod(
          edu.startDate,
          edu.endDate,
          edu.currentEducation,
        );
        const meta = [period, edu.location].filter(Boolean).join(' · ');
        if (meta) {
          doc.font('Helvetica').fontSize(9).fillColor(muted).text(meta);
        }
        if (edu.description) {
          doc
            .moveDown(0.2)
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#333')
            .text(edu.description);
        }
        doc.moveDown(0.6);
      }
    }

    if (resume.skills.length) {
      this.sectionTitle(doc, 'Compétences', accent);
      const byCategory = new Map<SkillCategory, string[]>();
      for (const skill of resume.skills) {
        const list = byCategory.get(skill.category) ?? [];
        list.push(`${skill.name} (${skill.proficiency}/5)`);
        byCategory.set(skill.category, list);
      }

      const labels: Record<SkillCategory, string> = {
        TECHNICAL: 'Techniques',
        SOFT: 'Soft skills',
        LANGUAGE: 'Langues',
        TOOL: 'Outils',
        OTHER: 'Autres',
      };

      for (const [category, items] of byCategory) {
        this.ensureSpace(doc, 40);
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#222')
          .text(labels[category]);
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#333')
          .text(items.join('  ·  '));
        doc.moveDown(0.4);
      }
    }

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor(muted)
        .text(
          `Page ${i + 1} / ${range.count}`,
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 },
        );
    }

    doc.end();
  }

  private sectionTitle(
    doc: PDFKit.PDFDocument,
    title: string,
    color: string,
  ) {
    this.ensureSpace(doc, 40);
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor(color)
      .text(title.toUpperCase());
    doc.moveDown(0.15);
    this.drawLine(doc);
    doc.moveDown(0.4);
  }

  private drawLine(doc: PDFKit.PDFDocument) {
    const y = doc.y;
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .strokeColor('#d0d7de')
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.4);
  }

  private ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
    if (doc.y + needed > doc.page.height - 60) {
      doc.addPage();
    }
  }

  private formatPeriod(
    start: Date | null,
    end: Date | null,
    current: boolean,
  ) {
    const fmt = (d: Date) =>
      d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    if (!start && !end && !current) return '';
    const from = start ? fmt(start) : '?';
    const to = current ? "Aujourd'hui" : end ? fmt(end) : '';
    return to ? `${from} – ${to}` : from;
  }
}
