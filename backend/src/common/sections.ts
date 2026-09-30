export const SECTION_KEYS = [
  'profile',
  'objective',
  'experience',
  'education',
  'skills',
  'languages',
  'certifications',
  'awards',
  'projects',
  'interests',
  'references',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type SectionsConfig = Record<SectionKey, boolean>;

export const DEFAULT_SECTIONS: SectionsConfig = {
  profile: true,
  objective: false,
  experience: true,
  education: true,
  skills: true,
  languages: true,
  certifications: false,
  awards: false,
  projects: false,
  interests: false,
  references: false,
};

export function sectionOrder(value: unknown): SectionKey[] {
  const raw =
    value && typeof value === 'object'
      ? (value as { order?: unknown }).order
      : undefined;
  const picked: SectionKey[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (
        typeof item === 'string' &&
        (SECTION_KEYS as readonly string[]).includes(item) &&
        !seen.has(item)
      ) {
        seen.add(item);
        picked.push(item as SectionKey);
      }
    }
  }
  for (const key of SECTION_KEYS) {
    if (!seen.has(key)) picked.push(key);
  }
  return picked;
}

export function normalizeSections(
  value: unknown,
): SectionsConfig & { order: SectionKey[] } {
  const base = { ...DEFAULT_SECTIONS };
  if (!value || typeof value !== 'object') return { ...base, order: sectionOrder(value) };
  const input = value as Record<string, unknown>;
  for (const key of SECTION_KEYS) {
    if (typeof input[key] === 'boolean') {
      base[key] = input[key] as boolean;
    }
  }
  return { ...base, order: sectionOrder(value) };
}

export const SECTION_META: Record<
  SectionKey,
  { fr: string; en: string; descriptionFr: string; descriptionEn: string }
> = {
  profile: {
    fr: 'Profil',
    en: 'Profile',
    descriptionFr: 'Résumé / présentation',
    descriptionEn: 'Professional summary',
  },
  objective: {
    fr: 'Objectif',
    en: 'Objective',
    descriptionFr: 'Objectif de carrière',
    descriptionEn: 'Career objective',
  },
  experience: {
    fr: 'Expériences',
    en: 'Experience',
    descriptionFr: 'Parcours professionnel',
    descriptionEn: 'Work history',
  },
  education: {
    fr: 'Formations',
    en: 'Education',
    descriptionFr: 'Diplômes et études',
    descriptionEn: 'Degrees and studies',
  },
  skills: {
    fr: 'Compétences',
    en: 'Skills',
    descriptionFr: 'Savoir-faire techniques, outils, soft skills',
    descriptionEn: 'Technical skills, tools, soft skills',
  },
  languages: {
    fr: 'Langues',
    en: 'Languages',
    descriptionFr: 'Langues avec niveau CECR',
    descriptionEn: 'Languages with CEFR level',
  },
  certifications: {
    fr: 'Certifications',
    en: 'Certifications',
    descriptionFr: 'Certificats et formations courtes',
    descriptionEn: 'Certificates and short courses',
  },
  awards: {
    fr: 'Attestations / Distinctions',
    en: 'Awards',
    descriptionFr: 'Attestations, prix, distinctions',
    descriptionEn: 'Awards and distinctions',
  },
  projects: {
    fr: 'Projets',
    en: 'Projects',
    descriptionFr: 'Réalisations et projets personnels',
    descriptionEn: 'Personal and side projects',
  },
  interests: {
    fr: 'Centres d’intérêt',
    en: 'Interests',
    descriptionFr: 'Loisirs et centres d’intérêt',
    descriptionEn: 'Hobbies and interests',
  },
  references: {
    fr: 'Références',
    en: 'References',
    descriptionFr: 'Personnes de référence',
    descriptionEn: 'Professional references',
  },
};

/** Niveaux linguistiques professionnels (CECR). */
export const LANGUAGE_LEVELS = [
  { value: 'NATIVE', fr: 'Langue maternelle', en: 'Native' },
  { value: 'C2', fr: 'C2 — Maîtrise', en: 'C2 — Mastery' },
  { value: 'C1', fr: 'C1 — Avancé', en: 'C1 — Advanced' },
  { value: 'B2', fr: 'B2 — Indépendant', en: 'B2 — Upper intermediate' },
  { value: 'B1', fr: 'B1 — Seuil', en: 'B1 — Intermediate' },
  { value: 'A2', fr: 'A2 — Élémentaire', en: 'A2 — Elementary' },
  { value: 'A1', fr: 'A1 — Découverte', en: 'A1 — Beginner' },
  { value: 'BASIC', fr: 'Notions', en: 'Basic' },
] as const;
