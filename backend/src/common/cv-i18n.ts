export type CvLocale = 'fr' | 'en';

export type CvLabels = {
  profile: string;
  objective: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  certifications: string;
  awards: string;
  projects: string;
  interests: string;
  references: string;
  contact: string;
  today: string;
  technical: string;
  soft: string;
  language: string;
  tool: string;
  other: string;
  page: string;
};

const fr: CvLabels = {
  profile: 'Profil professionnel',
  objective: 'Objectif',
  experience: 'Expériences professionnelles',
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
  page: 'Page',
};

const en: CvLabels = {
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
  page: 'Page',
};

export function resolveLocale(value?: string | null): CvLocale {
  return value === 'en' ? 'en' : 'fr';
}

export function getLabels(locale?: string | null): CvLabels {
  return resolveLocale(locale) === 'en' ? en : fr;
}

export { TEMPLATE_IDS, resolveTemplateId as resolveTemplate } from './cv-templates';
export type { TemplateDefinition } from './cv-templates';
export { getTemplateDef, CV_TEMPLATES } from './cv-templates';

import { getTemplateDef } from './cv-templates';

export type TemplateId = string;

export function templateShowsPhoto(template?: string | null): boolean {
  return getTemplateDef(template).showsPhoto;
}
