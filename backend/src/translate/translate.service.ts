import { Injectable, Logger } from '@nestjs/common';
import translate from 'google-translate-api-x';
import { resolveLocale, type CvLocale } from '../common/cv-i18n';

type TranslateFn = (
  text: string,
  opts: { from: string; to: string },
) => Promise<{ text: string }>;

const translateFn = translate as unknown as TranslateFn;

type LocalizableResume = {
  locale: string;
  personal: {
    summary: string | null;
    objective?: string | null;
    address: string | null;
    [key: string]: unknown;
  } | null;
  experiences: Array<{
    jobTitle: string;
    company: string;
    location: string | null;
    description: string | null;
    [key: string]: unknown;
  }>;
  educations: Array<{
    degree: string;
    institution: string;
    location: string | null;
    description: string | null;
    [key: string]: unknown;
  }>;
  skills: Array<{
    name: string;
    [key: string]: unknown;
  }>;
  extras?: Array<{
    title: string;
    subtitle: string | null;
    dateLabel: string | null;
    description: string | null;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

@Injectable()
export class TranslateService {
  private readonly logger = new Logger(TranslateService.name);
  private readonly cache = new Map<string, string>();

  async localizeResume<T extends LocalizableResume>(
    resume: T,
    targetLocale?: string | null,
  ): Promise<T> {
    const locale = resolveLocale(targetLocale ?? resume.locale);
    const cloned = structuredClone(resume) as T;
    cloned.locale = locale;

    const texts: string[] = [];
    const push = (value?: string | null) => {
      if (value && value.trim()) texts.push(value);
    };

    if (cloned.personal) {
      push(cloned.personal.summary);
      push(cloned.personal.objective);
      push(cloned.personal.address);
    }
    for (const exp of cloned.experiences) {
      push(exp.jobTitle);
      push(exp.company);
      push(exp.location);
      push(exp.description);
    }
    for (const edu of cloned.educations) {
      push(edu.degree);
      push(edu.institution);
      push(edu.location);
      push(edu.description);
    }
    for (const skill of cloned.skills) {
      push(skill.name);
    }
    for (const extra of cloned.extras || []) {
      push(extra.title);
      push(extra.subtitle);
      push(extra.dateLabel);
      push(extra.description);
    }

    const map = await this.translateMany([...new Set(texts)], locale);
    const t = (value?: string | null) => {
      if (!value) return value ?? null;
      return map.get(value) ?? value;
    };

    if (cloned.personal) {
      cloned.personal.summary = t(cloned.personal.summary);
      cloned.personal.objective = t(cloned.personal.objective);
      cloned.personal.address = t(cloned.personal.address);
    }
    cloned.experiences = cloned.experiences.map((exp) => ({
      ...exp,
      jobTitle: t(exp.jobTitle) || exp.jobTitle,
      company: t(exp.company) || exp.company,
      location: t(exp.location),
      description: t(exp.description),
    }));
    cloned.educations = cloned.educations.map((edu) => ({
      ...edu,
      degree: t(edu.degree) || edu.degree,
      institution: t(edu.institution) || edu.institution,
      location: t(edu.location),
      description: t(edu.description),
    }));
    cloned.skills = cloned.skills.map((skill) => ({
      ...skill,
      name: t(skill.name) || skill.name,
    }));
    if (cloned.extras) {
      cloned.extras = cloned.extras.map((extra) => ({
        ...extra,
        title: t(extra.title) || extra.title,
        subtitle: t(extra.subtitle),
        dateLabel: t(extra.dateLabel),
        description: t(extra.description),
      }));
    }

    return cloned;
  }

  private async translateMany(
    texts: string[],
    target: CvLocale,
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (!texts.length) return result;

    const pending: string[] = [];
    for (const text of texts) {
      const key = `${target}::${text}`;
      const cached = this.cache.get(key);
      if (cached != null) result.set(text, cached);
      else pending.push(text);
    }

    const chunkSize = 6;
    for (let i = 0; i < pending.length; i += chunkSize) {
      const chunk = pending.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (text) => {
          const translated = await this.translateOne(text, target);
          this.cache.set(`${target}::${text}`, translated);
          result.set(text, translated);
        }),
      );
    }

    return result;
  }

  private async translateOne(text: string, target: CvLocale): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return text;
    if (
      /^https?:\/\//i.test(trimmed) ||
      /^[\w.+-]+@[\w.-]+$/i.test(trimmed) ||
      /^[+()\d\s.-]{6,}$/.test(trimmed)
    ) {
      return text;
    }

    try {
      const res = await translateFn(trimmed, {
        from: 'auto',
        to: target,
      });
      return res.text || text;
    } catch (error) {
      this.logger.warn(
        `Traduction échouée (« ${trimmed.slice(0, 36)} »): ${String(error)}`,
      );
      return text;
    }
  }
}
