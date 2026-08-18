import { CVData } from '../types';

export const TEMPLATES_META = [
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    category: 'Polyvalent & Moderne',
    description: 'Structure épurée avec bandeau d\'en-tête élégant, typographie équilibrée et badges de compétences soignés.',
    tag: 'Populaire',
    previewColor: '#0284c7',
  },
  {
    id: 'tech-developer',
    name: 'Tech & Engineering',
    category: 'Développeurs & DevOps',
    description: 'Format optimisé pour les profils techniques : stack groupée, métriques d\'impact, liens GitHub/projets.',
    tag: 'Spécial Tech',
    previewColor: '#10b981',
  },
  {
    id: 'executive',
    name: 'Executive & Management',
    category: 'Direction & Consultants',
    description: 'Colonne latérale contrastée, hiérarchie premium, valorisation du leadership et des résultats clés.',
    tag: 'Corporate',
    previewColor: '#3b82f6',
  },
  {
    id: 'creative-minimal',
    name: 'Creative Minimal',
    category: 'Design & Produit',
    description: 'Mise en page aérée et asymétrique, lignes fines et mise en avant visuelle des réalisations.',
    tag: 'Créatif',
    previewColor: '#8b5cf6',
  },
  {
    id: 'academic-classic',
    name: 'Academic & ATS Classic',
    category: 'International & Classique',
    description: 'Disposition mono-colonne universelle 100% compatible avec tous les logiciels ATS et comités de recrutement.',
    tag: 'ATS Friendly',
    previewColor: '#475569',
  },
  {
    id: 'accent-split',
    name: 'Accent Split (Bi-colonne)',
    category: 'Contemporain',
    description: 'Sidebar colorée pour le profil, contact et compétences ; large colonne principale pour le parcours.',
    tag: 'Dynamique',
    previewColor: '#f97316',
  },
];

export const COLOR_PALETTES = [
  { name: 'Océan Azur', primary: '#0284c7', secondary: '#0f172a' },
  { name: 'Émeraude Tech', primary: '#059669', secondary: '#111827' },
  { name: 'Indigo Royal', primary: '#4f46e5', secondary: '#1e1b4b' },
  { name: 'Violet Créatif', primary: '#7c3aed', secondary: '#2e1065' },
  { name: 'Ambre Moderne', primary: '#d97706', secondary: '#1c1917' },
  { name: 'Ardoise Minimal', primary: '#334155', secondary: '#09090b' },
  { name: 'Rubis Carmin', primary: '#e11d48', secondary: '#1f1315' },
  { name: 'Cyan Futuriste', primary: '#0891b2', secondary: '#082f49' },
];

export const DEFAULT_CV_DATA: CVData = {
  templateId: 'modern-clean',
  theme: {
    primaryColor: '#0284c7',
    secondaryColor: '#0f172a',
    fontHeading: 'Inter',
    fontBody: 'Inter',
    spacingDensity: 'normal',
    showPhoto: true,
    photoShape: 'rounded',
    accentStyle: 'badge',
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
  },
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  interests: [],
  sectionOrder: ['personalInfo', 'experiences', 'education', 'skills', 'projects', 'certifications', 'languages', 'interests']
};

export const SAMPLE_CVS: CVData[] = [];
