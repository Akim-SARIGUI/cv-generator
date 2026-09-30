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
] as const

export type SectionKey = (typeof SECTION_KEYS)[number]

export type SectionsConfig = Record<SectionKey, boolean>

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
}

export const SECTION_META: Record<
  SectionKey,
  { fr: string; en: string; hintFr: string; hintEn: string }
> = {
  profile: {
    fr: 'Profil',
    en: 'Profile',
    hintFr: 'Résumé / présentation',
    hintEn: 'Professional summary',
  },
  objective: {
    fr: 'Objectif',
    en: 'Objective',
    hintFr: 'Objectif de carrière',
    hintEn: 'Career objective',
  },
  experience: {
    fr: 'Expériences',
    en: 'Experience',
    hintFr: 'Années, poste, employeur, missions',
    hintEn: 'Years, role, employer, duties',
  },
  education: {
    fr: 'Diplômes',
    en: 'Degrees',
    hintFr: 'Années, diplôme, établissement, mention',
    hintEn: 'Years, degree, school, honours',
  },
  skills: {
    fr: 'Compétences',
    en: 'Skills',
    hintFr: 'Une catégorie, puis la liste',
    hintEn: 'One category, then the list',
  },
  languages: {
    fr: 'Langues',
    en: 'Languages',
    hintFr: 'Langues avec niveau CECR',
    hintEn: 'Languages with CEFR level',
  },
  certifications: {
    fr: 'Certifications',
    en: 'Certificates',
    hintFr: 'Date, intitulé, organisme',
    hintEn: 'Date, title, issuer',
  },
  awards: {
    fr: 'Attestations / Distinctions',
    en: 'Awards',
    hintFr: 'Attestations, prix, distinctions',
    hintEn: 'Awards and distinctions',
  },
  projects: {
    fr: 'Projets',
    en: 'Projects',
    hintFr: 'Nom du projet, puis le résultat',
    hintEn: 'Project name, then the outcome',
  },
  interests: {
    fr: 'Centres d’intérêt',
    en: 'Interests',
    hintFr: 'Loisirs',
    hintEn: 'Hobbies',
  },
  references: {
    fr: 'Références',
    en: 'References',
    hintFr: 'Personnes de référence',
    hintEn: 'Professional references',
  },
}

export function normalizeSections(value: unknown): SectionsConfig {
  const base = { ...DEFAULT_SECTIONS }
  if (!value || typeof value !== 'object') return base
  const input = value as Record<string, unknown>
  for (const key of SECTION_KEYS) {
    if (typeof input[key] === 'boolean') base[key] = input[key] as boolean
  }
  return base
}

export function sectionOrder(value: unknown): SectionKey[] {
  const raw =
    value && typeof value === 'object'
      ? (value as { order?: unknown }).order
      : undefined
  const picked: SectionKey[] = []
  const seen = new Set<string>()
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (
        typeof item === 'string' &&
        (SECTION_KEYS as readonly string[]).includes(item) &&
        !seen.has(item)
      ) {
        seen.add(item)
        picked.push(item as SectionKey)
      }
    }
  }
  for (const key of SECTION_KEYS) {
    if (!seen.has(key)) picked.push(key)
  }
  return picked
}

export function packSections(flags: SectionsConfig, order: SectionKey[]) {
  return { ...flags, order: sectionOrder({ order }) }
}

export type ExtraKind =
  | 'CERTIFICATION'
  | 'AWARD'
  | 'PROJECT'
  | 'INTEREST'
  | 'REFERENCE'
  | 'LANGUAGE'

export const LANGUAGE_LEVELS = [
  { value: 'NATIVE', fr: 'Langue maternelle', en: 'Native', label: 'Langue maternelle' },
  { value: 'C2', fr: 'C2 — Maîtrise', en: 'C2 — Mastery', label: 'C2 — Maîtrise' },
  { value: 'C1', fr: 'C1 — Avancé', en: 'C1 — Advanced', label: 'C1 — Avancé' },
  { value: 'B2', fr: 'B2 — Indépendant', en: 'B2 — Upper intermediate', label: 'B2 — Indépendant' },
  { value: 'B1', fr: 'B1 — Seuil', en: 'B1 — Intermediate', label: 'B1 — Seuil' },
  { value: 'A2', fr: 'A2 — Élémentaire', en: 'A2 — Elementary', label: 'A2 — Élémentaire' },
  { value: 'A1', fr: 'A1 — Découverte', en: 'A1 — Beginner', label: 'A1 — Découverte' },
  { value: 'BASIC', fr: 'Notions', en: 'Basic', label: 'Notions' },
] as const

export function languageLevelLabel(value?: string | null, locale: 'fr' | 'en' = 'fr') {
  const found = LANGUAGE_LEVELS.find((l) => l.value === value || l.fr === value || l.en === value || l.label === value)
  if (!found) return value || ''
  return locale === 'en' ? found.en : found.fr
}
