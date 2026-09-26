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
};

export const CV_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'eu',
    layout: 'classic',
    accent: '#1e3a5f',
    showsPhoto: true,
    nameFr: 'Européen',
    nameEn: 'European',
    descFr: 'Format international avec photo portrait.',
    descEn: 'International layout with portrait photo.',
  },
  {
    id: 'us',
    layout: 'ats',
    accent: '#111111',
    showsPhoto: false,
    nameFr: 'US / ATS',
    nameEn: 'US / ATS',
    descFr: 'Sans photo, chronologique, optimisé ATS.',
    descEn: 'No photo, chronological, ATS-friendly.',
  },
  {
    id: 'sidebar',
    layout: 'sidebar',
    accent: '#0f4c5c',
    showsPhoto: true,
    nameFr: 'Moderne sidebar',
    nameEn: 'Modern sidebar',
    descFr: 'Bandeau latéral et photo ronde.',
    descEn: 'Colored sidebar with circular photo.',
  },
  {
    id: 'minimal',
    layout: 'minimal',
    accent: '#1a1a1a',
    showsPhoto: true,
    nameFr: 'Minimal',
    nameEn: 'Minimal',
    descFr: 'Élégant, aéré, typographie soignée.',
    descEn: 'Clean spacing and refined typography.',
  },
  {
    id: 'executive',
    layout: 'executive',
    accent: '#0b2545',
    showsPhoto: true,
    nameFr: 'Executive',
    nameEn: 'Executive',
    descFr: 'Direction / senior, lignes nettes.',
    descEn: 'Senior leadership, sharp structure.',
  },
  {
    id: 'nordic',
    layout: 'minimal',
    accent: '#1f4d3a',
    showsPhoto: true,
    nameFr: 'Nordique',
    nameEn: 'Nordic',
    descFr: 'Sobre et lumineux, inspiré Scandinavie.',
    descEn: 'Calm Scandinavian-inspired look.',
  },
  {
    id: 'corporate',
    layout: 'classic',
    accent: '#7a1f2b',
    showsPhoto: true,
    nameFr: 'Corporate',
    nameEn: 'Corporate',
    descFr: 'Entreprise, accent bordeaux.',
    descEn: 'Business tone with burgundy accent.',
  },
  {
    id: 'atlantic',
    layout: 'sidebar',
    accent: '#1b4f72',
    showsPhoto: true,
    nameFr: 'Atlantic',
    nameEn: 'Atlantic',
    descFr: 'Sidebar bleu océan, rendu pro.',
    descEn: 'Ocean-blue sidebar, professional.',
  },
  {
    id: 'swiss',
    layout: 'ats',
    accent: '#222222',
    showsPhoto: false,
    nameFr: 'Swiss',
    nameEn: 'Swiss',
    descFr: 'Grille stricte, très lisible, ATS.',
    descEn: 'Strict grid, highly readable, ATS.',
  },
  {
    id: 'timeline',
    layout: 'timeline',
    accent: '#0f766e',
    showsPhoto: true,
    nameFr: 'Timeline',
    nameEn: 'Timeline',
    descFr: 'Parcours en frise verticale.',
    descEn: 'Vertical career timeline.',
  },
  {
    id: 'elegant',
    layout: 'elegant',
    accent: '#3d2c2e',
    showsPhoto: true,
    nameFr: 'Élégant',
    nameEn: 'Elegant',
    descFr: 'Serif subtil, luxe discret.',
    descEn: 'Subtle serif feel, quiet luxury.',
  },
  {
    id: 'tech',
    layout: 'sidebar',
    accent: '#134e4a',
    showsPhoto: true,
    nameFr: 'Tech',
    nameEn: 'Tech',
    descFr: 'Profil technique / engineering.',
    descEn: 'Built for engineering profiles.',
  },
  {
    id: 'academic',
    layout: 'classic',
    accent: '#3730a3',
    showsPhoto: false,
    nameFr: 'Académique',
    nameEn: 'Academic',
    descFr: 'Recherche et formations mises en avant.',
    descEn: 'Education-forward academic style.',
  },
  {
    id: 'bold',
    layout: 'banner',
    accent: '#b45309',
    showsPhoto: true,
    nameFr: 'Bold',
    nameEn: 'Bold',
    descFr: 'Bandeau fort, impact immédiat.',
    descEn: 'Strong banner, high impact.',
  },
  {
    id: 'slate',
    layout: 'twocol',
    accent: '#334155',
    showsPhoto: true,
    nameFr: 'Slate',
    nameEn: 'Slate',
    descFr: 'Deux colonnes ardoise, moderne.',
    descEn: 'Two-column slate modern layout.',
  },
  {
    id: 'clean',
    layout: 'ats',
    accent: '#0f172a',
    showsPhoto: false,
    nameFr: 'Clean',
    nameEn: 'Clean',
    descFr: 'Ultra clair pour candidatures internationales.',
    descEn: 'Ultra-clear for international applications.',
  },
  {
    id: 'ivory',
    layout: 'elegant',
    accent: '#78590f',
    showsPhoto: true,
    nameFr: 'Ivory',
    nameEn: 'Ivory',
    descFr: 'Chaleureux, conseil / créatif.',
    descEn: 'Warm tone for consulting/creative.',
  },
  {
    id: 'metro',
    layout: 'banner',
    accent: '#0369a1',
    showsPhoto: true,
    nameFr: 'Metro',
    nameEn: 'Metro',
    descFr: 'Urbain, bandeau bleu vif.',
    descEn: 'Urban look with bright blue banner.',
  },
  {
    id: 'luxe',
    layout: 'executive',
    accent: '#1c1917',
    showsPhoto: true,
    nameFr: 'Luxe',
    nameEn: 'Luxe',
    descFr: 'Noir profond, très premium.',
    descEn: 'Deep black, premium executive.',
  },
  {
    id: 'pulse',
    layout: 'timeline',
    accent: '#be123c',
    showsPhoto: true,
    nameFr: 'Pulse',
    nameEn: 'Pulse',
    descFr: 'Dynamique, timeline accent rose.',
    descEn: 'Dynamic timeline with rose accent.',
  },
];

export const TEMPLATE_IDS = CV_TEMPLATES.map((t) => t.id);

export function getTemplateDef(id?: string | null): TemplateDefinition {
  if (id === 'classic') return CV_TEMPLATES[0];
  return CV_TEMPLATES.find((t) => t.id === id) ?? CV_TEMPLATES[0];
}

export function resolveTemplateId(value?: string | null): string {
  return getTemplateDef(value).id;
}
