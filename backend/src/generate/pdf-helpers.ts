import { existsSync } from 'fs';
import type PDFKit from 'pdfkit';
import { SkillCategory } from '@prisma/client';
import { getLabels, type CvLabels } from '../common/cv-i18n';
import { resolveUploadAbsolute } from '../common/uploads-path';

export type ResumePdfData = {
  title: string;
  template: string;
  locale: string;
  sections?: unknown;
  personal: {
    fullName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    websiteUrl: string | null;
    summary: string | null;
    objective?: string | null;
    photoUrl: string | null;
  } | null;
  experiences: Array<{
    jobTitle: string;
    company: string;
    location: string | null;
    startDate: Date | null;
    endDate: Date | null;
    currentJob: boolean;
    description: string | null;
  }>;
  educations: Array<{
    degree: string;
    institution: string;
    location: string | null;
    startDate: Date | null;
    endDate: Date | null;
    currentEducation: boolean;
    description: string | null;
  }>;
  skills: Array<{
    name: string;
    category: SkillCategory;
    proficiency: number;
  }>;
  extras?: Array<{
    kind: string;
    title: string;
    subtitle: string | null;
    dateLabel: string | null;
    description: string | null;
    url: string | null;
  }>;
};

export function labelsFor(resume: ResumePdfData): CvLabels {
  return getLabels(resume.locale);
}

export function resolvePhotoPath(photoUrl?: string | null): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('/uploads/')) {
    const absolute = resolveUploadAbsolute(photoUrl);
    return existsSync(absolute) ? absolute : null;
  }
  if (existsSync(photoUrl)) return photoUrl;
  return null;
}

export function yearPeriod(
  start: Date | null,
  end: Date | null,
  current: boolean,
  currentLabel: string,
) {
  const year = (value: Date | null) => (value ? String(value.getFullYear()) : '');
  const from = year(start);
  const to = current ? currentLabel : year(end);
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

export function bulletLines(value?: string | null) {
  return (value || '')
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}

export function formatPeriod(
  labels: CvLabels,
  locale: string,
  start: Date | null,
  end: Date | null,
  current: boolean,
) {
  const loc = locale === 'en' ? 'en-GB' : 'fr-FR';
  const fmt = (d: Date) =>
    d.toLocaleDateString(loc, { month: 'short', year: 'numeric' });
  if (!start && !end && !current) return '';
  const from = start ? fmt(start) : '?';
  const to = current ? labels.today : end ? fmt(end) : '';
  return to ? `${from} – ${to}` : from;
}

export function skillCategoryLabel(
  labels: CvLabels,
  category: SkillCategory,
): string {
  const map: Record<SkillCategory, string> = {
    TECHNICAL: labels.technical,
    SOFT: labels.soft,
    LANGUAGE: labels.language,
    TOOL: labels.tool,
    OTHER: labels.other,
  };
  return map[category];
}

export function contactParts(
  personal: ResumePdfData['personal'],
): string[] {
  if (!personal) return [];
  return [
    personal.email,
    personal.phone,
    personal.address,
    personal.linkedinUrl,
    personal.githubUrl,
    personal.websiteUrl,
  ].filter(Boolean) as string[];
}

export function ensureSpace(doc: PDFKit.PDFDocument, needed: number, bottom = 55) {
  if (doc.y + needed > doc.page.height - bottom) {
    doc.addPage();
  }
}

export function drawFooter(
  doc: PDFKit.PDFDocument,
  labels: CvLabels,
  color = '#5c6b7a',
) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor(color)
      .text(
        `${labels.page} ${i - range.start + 1} / ${range.count}`,
        50,
        doc.page.height - 36,
        { align: 'center', width: doc.page.width - 100 },
      );
  }
}

export function sectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  color: string,
  x?: number,
  width?: number,
) {
  ensureSpace(doc, 36);
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(color)
    .text(title.toUpperCase(), x, undefined, width ? { width } : undefined);
  const lineY = doc.y + 2;
  const left = x ?? doc.page.margins.left;
  const right = width
    ? left + width
    : doc.page.width - doc.page.margins.right;
  doc
    .moveTo(left, lineY)
    .lineTo(right, lineY)
    .strokeColor('#d0d7de')
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.55);
}
