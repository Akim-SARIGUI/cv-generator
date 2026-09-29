export type UserRole = 'USER' | 'ADMIN'

export type AuthUser = {
  id: string
  email: string
  username: string
  role?: UserRole
  createdAt?: string
}

export type PersonalInfo = {
  id: string
  resumeId: string
  fullName: string
  email?: string | null
  phone?: string | null
  address?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  websiteUrl?: string | null
  summary?: string | null
  objective?: string | null
  photoUrl?: string | null
}

export type Experience = {
  id: string
  resumeId: string
  jobTitle: string
  company: string
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  currentJob: boolean
  description?: string | null
  sortOrder: number
}

export type Education = {
  id: string
  resumeId: string
  degree: string
  institution: string
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  currentEducation: boolean
  description?: string | null
  sortOrder: number
}

export type SkillCategory = 'TECHNICAL' | 'SOFT' | 'LANGUAGE' | 'TOOL' | 'OTHER'

export type Skill = {
  id: string
  resumeId: string
  name: string
  category: SkillCategory
  proficiency: number
  sortOrder: number
}

export type ExtraKind =
  | 'CERTIFICATION'
  | 'AWARD'
  | 'PROJECT'
  | 'INTEREST'
  | 'REFERENCE'
  | 'LANGUAGE'

export type ExtraEntry = {
  id: string
  resumeId: string
  kind: ExtraKind
  title: string
  subtitle?: string | null
  dateLabel?: string | null
  description?: string | null
  url?: string | null
  sortOrder: number
}

export type Resume = {
  id: string
  title: string
  template: string
  locale: string
  sections?: Record<string, boolean>
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
  personal?: PersonalInfo | null
  experiences?: Experience[]
  educations?: Education[]
  skills?: Skill[]
  extras?: ExtraEntry[]
  _count?: {
    experiences: number
    educations: number
    skills: number
    extras: number
  }
}

export type AuthResponse = {
  user: AuthUser
  accessToken: string
}

export type ExtractedPersonal = {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  linkedinUrl?: string
  githubUrl?: string
  websiteUrl?: string
  summary?: string
  objective?: string
}

export type ExtractedExperience = {
  jobTitle: string
  company: string
  location?: string
  startDate?: string | null
  endDate?: string | null
  currentJob?: boolean
  description?: string
}

export type ExtractedEducation = {
  degree: string
  institution: string
  location?: string
  startDate?: string | null
  endDate?: string | null
  currentEducation?: boolean
  description?: string
}

export type ExtractedSkill = {
  name: string
  category?: SkillCategory
}

export type ExtractedExtra = {
  kind: ExtraKind
  title: string
  subtitle?: string
  dateLabel?: string
  description?: string
  url?: string
}

export type ExtractedCvDraft = {
  personal: ExtractedPersonal
  experiences: ExtractedExperience[]
  educations: ExtractedEducation[]
  skills: ExtractedSkill[]
  extras: ExtractedExtra[]
  warnings: string[]
  meta: {
    sourceName: string
    sourceType: 'pdf' | 'docx' | 'txt'
    textLength: number
    detectedSections: string[]
  }
}

