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
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  showsPhoto: boolean
  accent: string
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'eu', layout: 'classic', name: 'Européen', nameEn: 'European', description: 'Format international avec photo portrait.', descriptionEn: 'International layout with portrait photo.', showsPhoto: true, accent: '#1e3a5f' },
  { id: 'us', layout: 'ats', name: 'US / ATS', nameEn: 'US / ATS', description: 'Sans photo, chronologique, optimisé ATS.', descriptionEn: 'No photo, chronological, ATS-friendly.', showsPhoto: false, accent: '#111111' },
  { id: 'sidebar', layout: 'sidebar', name: 'Moderne sidebar', nameEn: 'Modern sidebar', description: 'Bandeau latéral et photo ronde.', descriptionEn: 'Colored sidebar with circular photo.', showsPhoto: true, accent: '#0f4c5c' },
  { id: 'minimal', layout: 'minimal', name: 'Minimal', nameEn: 'Minimal', description: 'Élégant, aéré, typographie soignée.', descriptionEn: 'Clean spacing and refined typography.', showsPhoto: true, accent: '#1a1a1a' },
  { id: 'executive', layout: 'executive', name: 'Executive', nameEn: 'Executive', description: 'Direction / senior, lignes nettes.', descriptionEn: 'Senior leadership, sharp structure.', showsPhoto: true, accent: '#0b2545' },
  { id: 'nordic', layout: 'minimal', name: 'Nordique', nameEn: 'Nordic', description: 'Sobre et lumineux, inspiré Scandinavie.', descriptionEn: 'Calm Scandinavian-inspired look.', showsPhoto: true, accent: '#1f4d3a' },
  { id: 'corporate', layout: 'classic', name: 'Corporate', nameEn: 'Corporate', description: 'Entreprise, accent bordeaux.', descriptionEn: 'Business tone with burgundy accent.', showsPhoto: true, accent: '#7a1f2b' },
  { id: 'atlantic', layout: 'sidebar', name: 'Atlantic', nameEn: 'Atlantic', description: 'Sidebar bleu océan, rendu pro.', descriptionEn: 'Ocean-blue sidebar, professional.', showsPhoto: true, accent: '#1b4f72' },
  { id: 'swiss', layout: 'ats', name: 'Swiss', nameEn: 'Swiss', description: 'Grille stricte, très lisible, ATS.', descriptionEn: 'Strict grid, highly readable, ATS.', showsPhoto: false, accent: '#222222' },
  { id: 'timeline', layout: 'timeline', name: 'Timeline', nameEn: 'Timeline', description: 'Parcours en frise verticale.', descriptionEn: 'Vertical career timeline.', showsPhoto: true, accent: '#0f766e' },
  { id: 'elegant', layout: 'elegant', name: 'Élégant', nameEn: 'Elegant', description: 'Serif subtil, luxe discret.', descriptionEn: 'Subtle serif feel, quiet luxury.', showsPhoto: true, accent: '#3d2c2e' },
  { id: 'tech', layout: 'sidebar', name: 'Tech', nameEn: 'Tech', description: 'Profil technique / engineering.', descriptionEn: 'Built for engineering profiles.', showsPhoto: true, accent: '#134e4a' },
  { id: 'academic', layout: 'classic', name: 'Académique', nameEn: 'Academic', description: 'Recherche et formations mises en avant.', descriptionEn: 'Education-forward academic style.', showsPhoto: false, accent: '#3730a3' },
  { id: 'bold', layout: 'banner', name: 'Bold', nameEn: 'Bold', description: 'Bandeau fort, impact immédiat.', descriptionEn: 'Strong banner, high impact.', showsPhoto: true, accent: '#b45309' },
  { id: 'slate', layout: 'twocol', name: 'Slate', nameEn: 'Slate', description: 'Deux colonnes ardoise, moderne.', descriptionEn: 'Two-column slate modern layout.', showsPhoto: true, accent: '#334155' },
  { id: 'clean', layout: 'ats', name: 'Clean', nameEn: 'Clean', description: 'Ultra clair pour candidatures internationales.', descriptionEn: 'Ultra-clear for international applications.', showsPhoto: false, accent: '#0f172a' },
  { id: 'ivory', layout: 'elegant', name: 'Ivory', nameEn: 'Ivory', description: 'Chaleureux, conseil / créatif.', descriptionEn: 'Warm tone for consulting/creative.', showsPhoto: true, accent: '#78590f' },
  { id: 'metro', layout: 'banner', name: 'Metro', nameEn: 'Metro', description: 'Urbain, bandeau bleu vif.', descriptionEn: 'Urban look with bright blue banner.', showsPhoto: true, accent: '#0369a1' },
  { id: 'luxe', layout: 'executive', name: 'Luxe', nameEn: 'Luxe', description: 'Noir profond, très premium.', descriptionEn: 'Deep black, premium executive.', showsPhoto: true, accent: '#1c1917' },
  { id: 'pulse', layout: 'timeline', name: 'Pulse', nameEn: 'Pulse', description: 'Dynamique, timeline accent rose.', descriptionEn: 'Dynamic timeline with rose accent.', showsPhoto: true, accent: '#be123c' },
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
  if (value === 'classic') return 'eu'
  if (value && TEMPLATES.some((t) => t.id === value)) return value
  return 'eu'
}

export function resolveLocale(value?: string | null): CvLocale {
  return value === 'en' ? 'en' : 'fr'
}

export function getLabels(locale?: string | null): CvLabels {
  return LABELS[resolveLocale(locale)]
}

export function getTemplateMeta(id?: string | null): TemplateMeta {
  const resolved = resolveTemplate(id)
  return TEMPLATES.find((t) => t.id === resolved) || TEMPLATES[0]
}
