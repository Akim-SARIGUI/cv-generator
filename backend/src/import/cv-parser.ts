import type {
  ExtractedCvDraft,
  ExtractedEducation,
  ExtractedExperience,
  ExtractedExtra,
  ExtractedPersonal,
  ExtractedSkill,
} from './extracted-cv.types';

type SectionId =
  | 'profile'
  | 'objective'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'awards'
  | 'projects'
  | 'interests'
  | 'references';

const SECTION_PATTERNS: { id: SectionId; re: RegExp }[] = [
  {
    id: 'profile',
    re: /^(profil(?:\s+professionnel)?|profile|summary|professional\s+summary|à\s+propos|about(?:\s+me)?)\s*:?\s*$/i,
  },
  {
    id: 'objective',
    re: /^(objectif(?:\s+professionnel)?|objective|career\s+objective)\s*:?\s*$/i,
  },
  {
    id: 'experience',
    re: /^(exp[ée]riences?(?:\s+professionnelles?)?|work\s+experience|employment|professional\s+experience|parcours)\s*:?\s*$/i,
  },
  {
    id: 'education',
    re: /^(formations?|education|éducation|études|academic|dipl[oô]mes?)\s*:?\s*$/i,
  },
  {
    id: 'skills',
    re: /^(comp[ée]tences?(?:\s+techniques?)?|skills|technical\s+skills|savoir[-\s]?faire|technologies)\s*:?\s*$/i,
  },
  {
    id: 'languages',
    re: /^(langues?|languages?)\s*:?\s*$/i,
  },
  {
    id: 'certifications',
    re: /^(certifications?|certificats?|certificates?)\s*:?\s*$/i,
  },
  {
    id: 'awards',
    re: /^(distinctions?|awards?|honors?|prix|attestations?)\s*:?\s*$/i,
  },
  {
    id: 'projects',
    re: /^(projets?|projects?|réalisations?)\s*:?\s*$/i,
  },
  {
    id: 'interests',
    re: /^(centres?\s+d['’]int[ée]r[eê]t|loisirs?|interests?|hobbies)\s*:?\s*$/i,
  },
  {
    id: 'references',
    re: /^(r[ée]f[ée]rences?|references?)\s*:?\s*$/i,
  },
];

const MONTHS: Record<string, number> = {
  janvier: 1,
  jan: 1,
  january: 1,
  février: 2,
  fevrier: 2,
  feb: 2,
  february: 2,
  mars: 3,
  mar: 3,
  march: 3,
  avril: 4,
  apr: 4,
  april: 4,
  mai: 5,
  may: 5,
  juin: 6,
  jun: 6,
  june: 6,
  juillet: 7,
  jul: 7,
  july: 7,
  août: 8,
  aout: 8,
  aug: 8,
  august: 8,
  septembre: 9,
  sep: 9,
  sept: 9,
  september: 9,
  octobre: 10,
  oct: 10,
  october: 10,
  novembre: 11,
  nov: 11,
  november: 11,
  décembre: 12,
  decembre: 12,
  dec: 12,
  december: 12,
};

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function detectSection(line: string): SectionId | null {
  for (const { id, re } of SECTION_PATTERNS) {
    if (re.test(line)) return id;
  }
  return null;
}

function extractEmail(text: string): string | undefined {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m?.[0];
}

function extractPhone(text: string): string | undefined {
  const m = text.match(
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?0?\d{1,3}\)?[\s.-]?)?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}(?:[\s.-]?\d{2})?/,
  );
  if (!m) return undefined;
  const raw = m[0].trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return undefined;
  return raw;
}

function extractUrl(
  text: string,
  host: RegExp,
): string | undefined {
  const m = text.match(
    new RegExp(
      `(?:https?:\\/\\/)?(?:www\\.)?${host.source}[^\\s,;|]*`,
      'i',
    ),
  );
  if (!m) return undefined;
  let url = m[0].replace(/[),.;]+$/, '');
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

function parseDateToken(token: string): string | null {
  const t = token.trim().toLowerCase();
  if (!t) return null;
  if (/^(aujourd'?hui|present|actuel|current|now|en cours)$/i.test(t)) {
    return null;
  }
  const iso = t.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (iso) return `${iso[1]}-${iso[2]}-01`;
  const ym = t.match(/^(\d{1,2})[\/.\-](\d{4})$/);
  if (ym) {
    const month = ym[1].padStart(2, '0');
    return `${ym[2]}-${month}-01`;
  }
  const y = t.match(/^(\d{4})$/);
  if (y) return `${y[1]}-01-01`;
  const named = t.match(/^([a-zéûôà.]+)\s+(\d{4})$/i);
  if (named) {
    const monthKey = named[1].replace(/\./g, '').toLowerCase();
    const month = MONTHS[monthKey];
    if (month) {
      return `${named[2]}-${String(month).padStart(2, '0')}-01`;
    }
  }
  return null;
}

const MONTH_TOKEN =
  '(?:janvier|janv?\\.?|février|fevrier|févr?\\.?|fevr\\.?|mars|avril|avr\\.?|mai|juin|juillet|juil\\.?|août|aout|septembre|sept?\\.?|octobre|oct\\.?|novembre|nov\\.?|décembre|decembre|déc\\.?|dec\\.?|january|february|march|april|may|june|july|august|september|october|november|december)';

function parsePeriod(line: string): {
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  rest: string;
} {
  const periodRe = new RegExp(
    `((?:${MONTH_TOKEN}\\s+)?(?:\\d{1,2}[\\/.\\-])?\\d{4}|\\d{1,2}[\\/.\\-]\\d{4})\\s*(?:[-–—à]|to)\\s*((?:aujourd'?hui|present|actuel|current|now|en cours)|(?:${MONTH_TOKEN}\\s+)?(?:\\d{1,2}[\\/.\\-])?\\d{4}|\\d{1,2}[\\/.\\-]\\d{4})`,
    'i',
  );

  const m = line.match(periodRe);
  if (!m) return { rest: line };

  const startDate = parseDateToken(m[1]);
  const endRaw = m[2];
  const current = /aujourd'?hui|present|actuel|current|now|en cours/i.test(
    endRaw,
  );
  const endDate = current ? null : parseDateToken(endRaw);
  const rest = line.replace(m[0], ' ').replace(/\s+/g, ' ').trim();
  return { startDate, endDate, current, rest };
}

function splitBlocks(body: string): string[] {
  const lines = splitLines(body);
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const looksLikeNew =
      current.length > 0 &&
      (/[–—-]/.test(line) ||
        /\d{4}/.test(line) ||
        /chez|at\s|@/i.test(line));
    if (looksLikeNew && current.length >= 2) {
      blocks.push(current.join('\n'));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current.join('\n'));
  return blocks.filter((b) => b.trim().length > 3);
}

function parseExperienceBlock(block: string): ExtractedExperience | null {
  const lines = splitLines(block);
  if (!lines.length) return null;

  const period = parsePeriod(lines.join(' | '));
  let titleLine = lines[0];
  let companyLine = lines[1] || '';

  const dashSplit = titleLine.split(/\s+[–—|]\s+/);
  if (dashSplit.length >= 2) {
    titleLine = dashSplit[0];
    companyLine = dashSplit.slice(1).join(' — ');
  } else if (/chez\s+/i.test(titleLine)) {
    const parts = titleLine.split(/\s+chez\s+/i);
    titleLine = parts[0];
    companyLine = parts[1] || companyLine;
  }

  const companyPeriod = parsePeriod(companyLine);
  const jobTitle = (period.rest && period.rest !== titleLine
    ? titleLine
    : titleLine
  ).trim();
  const company = (companyPeriod.rest || companyLine || 'Entreprise').trim();

  if (!jobTitle || jobTitle.length < 2) return null;

  const descLines = lines.slice(2).filter((l) => !detectSection(l));
  return {
    jobTitle: jobTitle.slice(0, 120),
    company: company.slice(0, 120) || 'Entreprise',
    startDate: period.startDate ?? companyPeriod.startDate ?? null,
    endDate: period.endDate ?? companyPeriod.endDate ?? null,
    currentJob: Boolean(period.current || companyPeriod.current),
    description: descLines.join('\n').slice(0, 4000) || undefined,
  };
}

function parseEducationBlock(block: string): ExtractedEducation | null {
  const lines = splitLines(block);
  if (!lines.length) return null;
  const period = parsePeriod(lines.join(' | '));
  let degree = lines[0];
  let institution = lines[1] || '';
  const dashSplit = degree.split(/\s+[–—|]\s+/);
  if (dashSplit.length >= 2) {
    degree = dashSplit[0];
    institution = dashSplit.slice(1).join(' — ');
  }
  const instPeriod = parsePeriod(institution);
  return {
    degree: degree.slice(0, 160),
    institution: (instPeriod.rest || institution || 'Établissement').slice(0, 160),
    startDate: period.startDate ?? instPeriod.startDate ?? null,
    endDate: period.endDate ?? instPeriod.endDate ?? null,
    currentEducation: Boolean(period.current || instPeriod.current),
    description: lines.slice(2).join('\n').slice(0, 2000) || undefined,
  };
}

function parseSkills(body: string): ExtractedSkill[] {
  const chunks = body
    .split(/[,;•·|/]| - |\n/)
    .map((s) => s.replace(/^[\-–—*•]+\s*/, '').trim())
    .filter((s) => s.length >= 2 && s.length <= 60 && !detectSection(s));

  const seen = new Set<string>();
  const skills: ExtractedSkill[] = [];
  for (const name of chunks) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    let category: ExtractedSkill['category'] = 'TECHNICAL';
    if (/communication|leadership|team|gestion|organisation|créativ/i.test(name)) {
      category = 'SOFT';
    } else if (/git|docker|jira|figma|excel|office|notion/i.test(name)) {
      category = 'TOOL';
    }
    skills.push({ name, category });
    if (skills.length >= 40) break;
  }
  return skills;
}

function parseLanguages(body: string): ExtractedExtra[] {
  const lines = body.split(/[,;\n]/).map((l) => l.trim()).filter(Boolean);
  const out: ExtractedExtra[] = [];
  for (const line of lines) {
    const levelMatch = line.match(
      /\b(A1|A2|B1|B2|C1|C2|NATIVE|maternel(?:le)?|native|courant|fluent|bilingual|bilingue|intermédiaire|basic|notions)\b/i,
    );
    let subtitle = 'B2';
    if (levelMatch) {
      const raw = levelMatch[1].toUpperCase();
      if (/NATIVE|MATERNEL|BILINGUE|BILINGUAL/.test(raw)) subtitle = 'NATIVE';
      else if (/COURANT|FLUENT/.test(raw)) subtitle = 'C1';
      else if (/INTERMEDIAIRE|INTERMEDIATE/.test(raw)) subtitle = 'B1';
      else if (/BASIC|NOTIONS/.test(raw)) subtitle = 'BASIC';
      else if (/^A1|A2|B1|B2|C1|C2$/.test(raw)) subtitle = raw;
    }
    const title = line
      .replace(levelMatch?.[0] || '', '')
      .replace(/[():\-–—|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (title.length >= 2) {
      out.push({ kind: 'LANGUAGE', title: title.slice(0, 80), subtitle });
    }
  }
  return out.slice(0, 12);
}

function parseSimpleExtras(
  body: string,
  kind: ExtractedExtra['kind'],
): ExtractedExtra[] {
  return splitBlocks(body)
    .slice(0, 15)
    .map((block) => {
      const lines = splitLines(block);
      return {
        kind,
        title: lines[0].slice(0, 160),
        subtitle: lines[1]?.slice(0, 160),
        description: lines.slice(2).join('\n').slice(0, 2000) || undefined,
      };
    })
    .filter((e) => e.title.length >= 2);
}

function guessFullName(headerLines: string[], email?: string): string | undefined {
  for (const line of headerLines.slice(0, 6)) {
    if (detectSection(line)) continue;
    if (line.includes('@')) continue;
    if (/https?:|linkedin|github|www\./i.test(line)) continue;
    if (extractPhone(line) && line.replace(/\D/g, '').length > 8) continue;
    const words = line.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 5 &&
      words.every((w) => /^[\p{L}'’-]+$/u.test(w)) &&
      line.length <= 60
    ) {
      return line;
    }
  }
  if (email) {
    const local = email.split('@')[0].replace(/[._]/g, ' ');
    return local
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return undefined;
}

function guessAddress(headerLines: string[]): string | undefined {
  for (const line of headerLines) {
    if (/\d{5}/.test(line) || /paris|lyon|marseille|france|belgium|canada|remote/i.test(line)) {
      if (!line.includes('@') && !/linkedin|github/i.test(line)) {
        return line.slice(0, 200);
      }
    }
  }
  return undefined;
}

export function parseCvText(
  rawText: string,
  meta: { sourceName: string; sourceType: 'pdf' | 'docx' | 'txt' },
): ExtractedCvDraft {
  const warnings: string[] = [];
  const text = normalizeText(rawText);

  if (text.length < 40) {
    warnings.push(
      'Peu de texte détecté. Si le CV est scanné (image), convertissez-le en PDF texte ou DOCX.',
    );
  }

  const lines = splitLines(text);
  const sections = new Map<SectionId, string[]>();
  let current: SectionId | 'header' = 'header';
  const headerLines: string[] = [];

  for (const line of lines) {
    const section = detectSection(line);
    if (section) {
      current = section;
      if (!sections.has(section)) sections.set(section, []);
      continue;
    }
    if (current === 'header') headerLines.push(line);
    else sections.get(current as SectionId)?.push(line);
  }

  const email = extractEmail(text);
  const phone = extractPhone(headerLines.join(' ') || text.slice(0, 500));
  const linkedinUrl = extractUrl(text, /linkedin\.com\/in\//i);
  const githubUrl = extractUrl(text, /github\.com\//i);
  const websiteUrl =
    extractUrl(text, /(?:portfolio|vercel|netlify|gitlab)\.[a-z.]+/i) ||
    undefined;

  const personal: ExtractedPersonal = {
    fullName: guessFullName(headerLines, email),
    email,
    phone,
    address: guessAddress(headerLines),
    linkedinUrl,
    githubUrl,
    websiteUrl,
    summary: (sections.get('profile') || []).join('\n').slice(0, 4000) || undefined,
    objective:
      (sections.get('objective') || []).join('\n').slice(0, 2000) || undefined,
  };

  const experiences = (sections.get('experience')
    ? splitBlocks(sections.get('experience')!.join('\n'))
    : []
  )
    .map(parseExperienceBlock)
    .filter((x): x is ExtractedExperience => Boolean(x))
    .slice(0, 20);

  const educations = (sections.get('education')
    ? splitBlocks(sections.get('education')!.join('\n'))
    : []
  )
    .map(parseEducationBlock)
    .filter((x): x is ExtractedEducation => Boolean(x))
    .slice(0, 15);

  const skills = sections.get('skills')
    ? parseSkills(sections.get('skills')!.join('\n'))
    : [];

  const extras: ExtractedExtra[] = [
    ...(sections.get('languages')
      ? parseLanguages(sections.get('languages')!.join('\n'))
      : []),
    ...(sections.get('certifications')
      ? parseSimpleExtras(sections.get('certifications')!.join('\n'), 'CERTIFICATION')
      : []),
    ...(sections.get('awards')
      ? parseSimpleExtras(sections.get('awards')!.join('\n'), 'AWARD')
      : []),
    ...(sections.get('projects')
      ? parseSimpleExtras(sections.get('projects')!.join('\n'), 'PROJECT')
      : []),
    ...(sections.get('interests')
      ? parseSimpleExtras(sections.get('interests')!.join('\n'), 'INTEREST')
      : []),
    ...(sections.get('references')
      ? parseSimpleExtras(sections.get('references')!.join('\n'), 'REFERENCE')
      : []),
  ];

  if (!personal.fullName) warnings.push('Nom non détecté automatiquement.');
  if (!experiences.length) warnings.push('Aucune expérience clairement détectée.');
  if (!educations.length) warnings.push('Aucune formation clairement détectée.');
  if (!skills.length) warnings.push('Compétences non détectées ou section absente.');

  return {
    personal,
    experiences,
    educations,
    skills,
    extras,
    warnings,
    meta: {
      sourceName: meta.sourceName,
      sourceType: meta.sourceType,
      textLength: text.length,
      detectedSections: [...sections.keys()],
    },
  };
}
