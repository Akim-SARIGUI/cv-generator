export type ExtractedPersonal = {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  summary?: string;
  objective?: string;
};

export type ExtractedExperience = {
  jobTitle: string;
  company: string;
  location?: string;
  startDate?: string | null;
  endDate?: string | null;
  currentJob?: boolean;
  description?: string;
};

export type ExtractedEducation = {
  degree: string;
  institution: string;
  location?: string;
  startDate?: string | null;
  endDate?: string | null;
  currentEducation?: boolean;
  description?: string;
};

export type ExtractedSkill = {
  name: string;
  category?: 'TECHNICAL' | 'SOFT' | 'TOOL' | 'OTHER';
};

export type ExtractedExtra = {
  kind:
    | 'LANGUAGE'
    | 'CERTIFICATION'
    | 'AWARD'
    | 'PROJECT'
    | 'INTEREST'
    | 'REFERENCE';
  title: string;
  subtitle?: string;
  dateLabel?: string;
  description?: string;
  url?: string;
};

export type ExtractedCvDraft = {
  personal: ExtractedPersonal;
  experiences: ExtractedExperience[];
  educations: ExtractedEducation[];
  skills: ExtractedSkill[];
  extras: ExtractedExtra[];
  warnings: string[];
  meta: {
    sourceName: string;
    sourceType: 'pdf' | 'docx' | 'txt';
    textLength: number;
    detectedSections: string[];
  };
};
