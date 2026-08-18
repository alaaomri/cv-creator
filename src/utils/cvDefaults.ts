import { CVData } from '../types';
import { DEFAULT_CV_DATA } from '../data/sampleCVs';

export function ensureValidCVData(cv: any): CVData {
  if (!cv) return { ...DEFAULT_CV_DATA };
  
  const inner = cv.data || cv;

  return {
    ...inner,
    id: cv.id || inner.id || `cv-${Date.now()}`,
    title: typeof cv.title === 'string' ? cv.title : (typeof inner.title === 'string' ? inner.title : 'Mon CV'),
    slug: cv.slug || inner.slug || `cv-${Date.now()}`,
    isPublished: cv.isPublished ?? inner.isPublished ?? false,
    publishedAt: cv.publishedAt || inner.publishedAt,
    viewCount: cv.viewCount ?? inner.viewCount ?? 0,
    lastViewedAt: cv.lastViewedAt || inner.lastViewedAt,
    updatedAt: cv.updatedAt || inner.updatedAt || new Date().toISOString(),
    createdAt: cv.createdAt || inner.createdAt || new Date().toISOString(),
    securityConfig: cv.securityConfig || inner.securityConfig || {
      isProtected: false,
      hasPassword: false,
      maskContactInfo: false,
    },
    templateId: inner.templateId || 'modern-clean',
    theme: {
      primaryColor: '#0284c7',
      secondaryColor: '#0f172a',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      spacingDensity: 'normal',
      showPhoto: true,
      photoShape: 'rounded',
      accentStyle: 'badge',
      ...(inner.theme || {}),
    },
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: '',
      avatarUrl: '',
      ...(inner.personalInfo || {}),
    },
    experiences: Array.isArray(inner.experiences) ? inner.experiences : [],
    education: Array.isArray(inner.education) ? inner.education : [],
    skills: Array.isArray(inner.skills) ? inner.skills : [],
    languages: Array.isArray(inner.languages) ? inner.languages : [],
    projects: Array.isArray(inner.projects) ? inner.projects : [],
    certifications: Array.isArray(inner.certifications) ? inner.certifications : [],
    interests: Array.isArray(inner.interests) ? inner.interests : [],
    sectionOrder: Array.isArray(inner.sectionOrder)
      ? inner.sectionOrder
      : ['personalInfo', 'experiences', 'education', 'skills', 'projects', 'certifications', 'languages', 'interests'],
  };
}

export function createBlankCV(title = 'Mon CV', authorName = '', authorEmail = ''): CVData {
  const newId = `cv-${Date.now()}`;
  return {
    ...DEFAULT_CV_DATA,
    id: newId,
    title,
    slug: `cv-${Date.now()}`,
    isPublished: false,
    viewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personalInfo: {
      ...DEFAULT_CV_DATA.personalInfo,
      fullName: authorName,
      email: authorEmail,
    },
  };
}
