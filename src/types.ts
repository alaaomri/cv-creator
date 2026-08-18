export type TemplateId = 
  | 'modern-clean'
  | 'tech-developer'
  | 'executive'
  | 'creative-minimal'
  | 'academic-classic'
  | 'accent-split';

export type FontChoice = 'Inter' | 'Plus Jakarta Sans' | 'Merriweather' | 'Poppins' | 'Roboto Mono' | 'Playfair Display';

export type SpacingDensity = 'compact' | 'normal' | 'spacious';
export type PhotoShape = 'round' | 'square' | 'rounded';
export type AccentStyle = 'badge' | 'line' | 'dot' | 'subtle';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  fontHeading: FontChoice;
  fontBody: FontChoice;
  spacingDensity: SpacingDensity;
  showPhoto: boolean;
  photoShape: PhotoShape;
  accentStyle: AccentStyle;
  showDividers?: boolean;
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  twitter?: string;
  summary: string;
  avatarUrl: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number; // 1 to 5
  category: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  role: string;
  link: string;
  github: string;
  description: string;
  technologies: string[];
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface InterestItem {
  id: string;
  name: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface CVSecurityConfig {
  isProtected?: boolean;
  hasPassword?: boolean;
  maskContactInfo?: boolean;
  expiresAt?: string;
  pinHint?: string;
}

export interface CVData {
  id?: string;
  title?: string;
  slug?: string;
  isPublished?: boolean;
  publishedAt?: string;
  viewCount?: number;
  lastViewedAt?: string;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  version?: number;
  updatedAt?: string;
  createdAt?: string;
  securityConfig?: CVSecurityConfig;
  templateId: TemplateId;
  theme: ThemeConfig;
  personalInfo: PersonalInfo;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  interests: InterestItem[];
  customSections?: CustomSection[];
  sectionOrder: string[];
}

export interface CVDocument {
  id: string;
  userId?: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  lastViewedAt?: string;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  version: number;
  updatedAt: string;
  createdAt: string;
  securityConfig?: CVSecurityConfig;
  data: CVData;
}

export interface CVListItem {
  id: string;
  userId?: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  lastViewedAt?: string;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  version?: number;
  updatedAt: string;
  createdAt?: string;
  templateId: TemplateId;
  candidateName: string;
  candidateRole: string;
  skillsCount?: number;
  experiencesCount?: number;
}


export interface SystemMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  pdfGenerations: number;
  aiGenerations: number;
  cvViews: number;
  totalStoredCVs: number;
  cachedKeysCount: number;
  uptimeSeconds: number;
}

export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive?: boolean;
  disabledAt?: string;
  disabledReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string;
}

