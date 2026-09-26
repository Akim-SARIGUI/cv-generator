export type LayoutId =
  | 'classic'
  | 'ats'
  | 'sidebar'
  | 'minimal'
  | 'banner'
  | 'executive'
  | 'timeline'
  | 'twocol'
  | 'elegant'

export type TemplateId = string
export type CvLocale = 'fr' | 'en'

export type TemplateMeta = {
  id: TemplateId
  layout: LayoutId
  family?: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  showsPhoto: boolean
  accent: string
}

export const TEMPLATE_ALIASES: Record<string, string> = {
  classic: 'classic-navy',
  eu: 'classic-navy',
  us: 'ats-ink',
  sidebar: 'sidebar-teal',
  minimal: 'minimal-charcoal',
  executive: 'executive-midnight',
  nordic: 'minimal-forest',
  corporate: 'classic-bordeaux',
  atlantic: 'sidebar-ocean',
  swiss: 'ats-graphite',
  timeline: 'timeline-emerald',
  elegant: 'elegant-espresso',
  tech: 'sidebar-pine',
  academic: 'classic-indigo',
  bold: 'banner-amber',
  slate: 'twocol-slate',
  clean: 'ats-slate',
  ivory: 'elegant-gold',
  metro: 'banner-sky',
  luxe: 'executive-ink',
  pulse: 'timeline-rose',
}

/** Fallback local si l’API templates n’est pas encore chargée. */
export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'classic-navy',
    layout: 'classic',
    name: 'Classique Marine',
    nameEn: 'Classic Navy',
    description: 'Structure internationale claire.',
    descriptionEn: 'Clear international structure.',
    showsPhoto: true,
    accent: '#1e3a5f',
  },
]

export type CvLabels = {
  profile: string
  objective: string
  experience: string
  education: string
  skills: string
  languages: string
  certifications: string
  awards: string
  projects: string
  interests: string
  references: string
  contact: string
  today: string
  technical: string
  soft: string
  language: string
  tool: string
  other: string
}

const LABELS: Record<CvLocale, CvLabels> = {
  fr: {
    profile: 'Profil professionnel',
    objective: 'Objectif',
    experience: 'Expériences',
    education: 'Formations',
    skills: 'Compétences',
    languages: 'Langues',
    certifications: 'Certifications',
    awards: 'Attestations & distinctions',
    projects: 'Projets',
    interests: "Centres d'intérêt",
    references: 'Références',
    contact: 'Coordonnées',
    today: "Aujourd'hui",
    technical: 'Techniques',
    soft: 'Soft skills',
    language: 'Langues',
    tool: 'Outils',
    other: 'Autres',
  },
  en: {
    profile: 'Professional summary',
    objective: 'Objective',
    experience: 'Work experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    certifications: 'Certifications',
    awards: 'Awards & distinctions',
    projects: 'Projects',
    interests: 'Interests',
    references: 'References',
    contact: 'Contact',
    today: 'Present',
    technical: 'Technical',
    soft: 'Soft skills',
    language: 'Languages',
    tool: 'Tools',
    other: 'Other',
  },
}

export function resolveTemplate(value?: string | null): TemplateId {
  if (!value) return 'classic-navy'
  if (TEMPLATE_ALIASES[value]) return TEMPLATE_ALIASES[value]
  return value
}

export function resolveLocale(value?: string | null): CvLocale {
  return value === 'en' ? 'en' : 'fr'
}

export function getLabels(locale?: string | null): CvLabels {
  return LABELS[resolveLocale(locale)]
}

export function getTemplateMeta(
  id?: string | null,
  catalog?: TemplateMeta[],
): TemplateMeta {
  const resolved = resolveTemplate(id)
  const list = catalog?.length ? catalog : TEMPLATES
  return (
    list.find((t) => t.id === resolved) ||
    list[0] || {
      id: 'classic-navy',
      layout: 'classic' as LayoutId,
      name: 'Classique Marine',
      nameEn: 'Classic Navy',
      description: '',
      descriptionEn: '',
      showsPhoto: true,
      accent: '#1e3a5f',
    }
  )
}

export const LAYOUT_FILTERS: { id: LayoutId | 'all'; fr: string; en: string }[] = [
  { id: 'all', fr: 'Tous', en: 'All' },
  { id: 'classic', fr: 'Classique', en: 'Classic' },
  { id: 'ats', fr: 'ATS', en: 'ATS' },
  { id: 'sidebar', fr: 'Sidebar', en: 'Sidebar' },
  { id: 'minimal', fr: 'Minimal', en: 'Minimal' },
  { id: 'banner', fr: 'Banner', en: 'Banner' },
  { id: 'executive', fr: 'Executive', en: 'Executive' },
  { id: 'timeline', fr: 'Timeline', en: 'Timeline' },
  { id: 'twocol', fr: '2 colonnes', en: '2 columns' },
  { id: 'elegant', fr: 'Élégant', en: 'Elegant' },
]
