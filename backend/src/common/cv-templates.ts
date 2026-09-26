export type LayoutId =
  | 'classic'
  | 'ats'
  | 'sidebar'
  | 'minimal'
  | 'banner'
  | 'executive'
  | 'timeline'
  | 'twocol'
  | 'elegant';

export type TemplateDefinition = {
  id: string;
  layout: LayoutId;
  accent: string;
  muted?: string;
  showsPhoto: boolean;
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
  family?: string;
};

type Palette = { slug: string; hex: string; fr: string; en: string };
type LayoutSpec = {
  id: LayoutId;
  fr: string;
  en: string;
  descFr: string;
  descEn: string;
  photo: boolean;
};

const PALETTES: Palette[] = [
  { slug: 'navy', hex: '#1e3a5f', fr: 'Marine', en: 'Navy' },
  { slug: 'ink', hex: '#111111', fr: 'Encre', en: 'Ink' },
  { slug: 'teal', hex: '#0f4c5c', fr: 'Sarcelle', en: 'Teal' },
  { slug: 'charcoal', hex: '#1a1a1a', fr: 'Charbon', en: 'Charcoal' },
  { slug: 'midnight', hex: '#0b2545', fr: 'Minuit', en: 'Midnight' },
  { slug: 'forest', hex: '#1f4d3a', fr: 'Forêt', en: 'Forest' },
  { slug: 'bordeaux', hex: '#7a1f2b', fr: 'Bordeaux', en: 'Bordeaux' },
  { slug: 'ocean', hex: '#1b4f72', fr: 'Océan', en: 'Ocean' },
  { slug: 'graphite', hex: '#222222', fr: 'Graphite', en: 'Graphite' },
  { slug: 'emerald', hex: '#0f766e', fr: 'Émeraude', en: 'Emerald' },
  { slug: 'espresso', hex: '#3d2c2e', fr: 'Espresso', en: 'Espresso' },
  { slug: 'pine', hex: '#134e4a', fr: 'Pin', en: 'Pine' },
];

const LAYOUTS: LayoutSpec[] = [
  {
    id: 'classic',
    fr: 'Classique',
    en: 'Classic',
    descFr: 'Structure internationale claire.',
    descEn: 'Clear international structure.',
    photo: true,
  },
  {
    id: 'ats',
    fr: 'ATS',
    en: 'ATS',
    descFr: 'Sans photo, optimisé recrutement.',
    descEn: 'No photo, recruiter/ATS friendly.',
    photo: false,
  },
  {
    id: 'sidebar',
    fr: 'Sidebar',
    en: 'Sidebar',
    descFr: 'Bandeau latéral contemporain.',
    descEn: 'Contemporary colored sidebar.',
    photo: true,
  },
  {
    id: 'minimal',
    fr: 'Minimal',
    en: 'Minimal',
    descFr: 'Aéré et typographique.',
    descEn: 'Airy typographic layout.',
    photo: true,
  },
  {
    id: 'banner',
    fr: 'Banner',
    en: 'Banner',
    descFr: 'En-tête fort et impactant.',
    descEn: 'Strong impactful header.',
    photo: true,
  },
  {
    id: 'executive',
    fr: 'Executive',
    en: 'Executive',
    descFr: 'Style direction / senior.',
    descEn: 'Leadership / senior style.',
    photo: true,
  },
  {
    id: 'timeline',
    fr: 'Timeline',
    en: 'Timeline',
    descFr: 'Parcours en frise verticale.',
    descEn: 'Vertical career timeline.',
    photo: true,
  },
  {
    id: 'twocol',
    fr: 'Deux colonnes',
    en: 'Two columns',
    descFr: 'Colonnes équilibrées modernes.',
    descEn: 'Balanced modern columns.',
    photo: true,
  },
  {
    id: 'elegant',
    fr: 'Élégant',
    en: 'Elegant',
    descFr: 'Rendu serif premium.',
    descEn: 'Premium serif presentation.',
    photo: true,
  },
];

/** Alias historiques → ids générés (compatibilité). */
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
};

const EXTRA_PALETTES: Palette[] = [
  { slug: 'indigo', hex: '#3730a3', fr: 'Indigo', en: 'Indigo' },
  { slug: 'amber', hex: '#b45309', fr: 'Ambre', en: 'Amber' },
  { slug: 'slate', hex: '#334155', fr: 'Ardoise', en: 'Slate' },
  { slug: 'gold', hex: '#78590f', fr: 'Or', en: 'Gold' },
  { slug: 'sky', hex: '#0369a1', fr: 'Ciel', en: 'Sky' },
  { slug: 'rose', hex: '#be123c', fr: 'Rose', en: 'Rose' },
  { slug: 'copper', hex: '#9a3412', fr: 'Cuivre', en: 'Copper' },
  { slug: 'violet', hex: '#5b21b6', fr: 'Violet', en: 'Violet' },
  { slug: 'moss', hex: '#3f6212', fr: 'Mousse', en: 'Moss' },
  { slug: 'steel', hex: '#475569', fr: 'Acier', en: 'Steel' },
];

function buildCatalog(): TemplateDefinition[] {
  const allPalettes = [...PALETTES, ...EXTRA_PALETTES];
  const list: TemplateDefinition[] = [];
  const seen = new Set<string>();

  for (const layout of LAYOUTS) {
    for (const palette of allPalettes) {
      const id = `${layout.id}-${palette.slug}`;
      if (seen.has(id)) continue;
      seen.add(id);
      list.push({
        id,
        layout: layout.id,
        accent: palette.hex,
        showsPhoto: layout.photo,
        family: layout.id,
        nameFr: `${layout.fr} ${palette.fr}`,
        nameEn: `${layout.en} ${palette.en}`,
        descFr: `${layout.descFr} Accent ${palette.fr.toLowerCase()}.`,
        descEn: `${layout.descEn} ${palette.en} accent.`,
      });
    }
  }

  // Variantes sans photo pour layouts photo (sauf ATS déjà sans)
  for (const layout of LAYOUTS.filter((l) => l.photo)) {
    for (const palette of PALETTES.slice(0, 4)) {
      const id = `${layout.id}-${palette.slug}-plain`;
      if (seen.has(id)) continue;
      seen.add(id);
      list.push({
        id,
        layout: layout.id,
        accent: palette.hex,
        showsPhoto: false,
        family: layout.id,
        nameFr: `${layout.fr} ${palette.fr} (sans photo)`,
        nameEn: `${layout.en} ${palette.en} (no photo)`,
        descFr: `${layout.descFr} Version sans photo.`,
        descEn: `${layout.descEn} Photo-free version.`,
      });
    }
  }

  return list;
}

export const CV_TEMPLATES: TemplateDefinition[] = buildCatalog();

export const TEMPLATE_IDS = CV_TEMPLATES.map((t) => t.id);

export function isValidTemplateId(id?: string | null): boolean {
  if (!id) return false;
  if (id in TEMPLATE_ALIASES) return true;
  return CV_TEMPLATES.some((t) => t.id === id);
}

export function getTemplateDef(id?: string | null): TemplateDefinition {
  const resolved =
    id && TEMPLATE_ALIASES[id] ? TEMPLATE_ALIASES[id] : id || 'classic-navy';
  return (
    CV_TEMPLATES.find((t) => t.id === resolved) ??
    CV_TEMPLATES.find((t) => t.id === 'classic-navy') ??
    CV_TEMPLATES[0]
  );
}

export function resolveTemplateId(value?: string | null): string {
  return getTemplateDef(value).id;
}

export function listTemplateFamilies(): LayoutId[] {
  return LAYOUTS.map((l) => l.id);
}
