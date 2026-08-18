import React from 'react';
import { Plus, Briefcase, GraduationCap, Sparkles, Code, Globe, Award, FolderGit2, MapPin, Mail, Phone, Camera, User } from 'lucide-react';
import { usePreviewEdit, CVEditorTab } from '../../context/PreviewEditContext';

interface SkeletonProps {
  primaryColor?: string;
  secondaryColor?: string;
  variant?: 'modern' | 'tech' | 'executive' | 'creative' | 'academic' | 'split';
  className?: string;
}

// 1. Ghost Contact Bar Placeholder
export const SkeletonContactBar: React.FC<{
  primaryColor?: string;
  variant?: string;
  centered?: boolean;
}> = ({ primaryColor = '#0284c7', centered = false }) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;

  return (
    <div 
      onClick={() => onEditSection?.('info')}
      data-no-print="true"
      data-export-ignore="true"
      className={`no-print cv-edit-only cv-edit-skeleton flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 select-none cursor-pointer py-1 px-2 rounded hover:bg-slate-50 transition-colors ${
        centered ? 'justify-center' : ''
      }`}
      title="Cliquer pour renseigner vos coordonnées"
    >
      <span className="flex items-center gap-1 opacity-70">
        <Mail className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
        <span>prenom.nom@email.com</span>
      </span>
      <span className="flex items-center gap-1 opacity-70">
        <Phone className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
        <span>+33 6 00 00 00 00</span>
      </span>
      <span className="flex items-center gap-1 opacity-70">
        <MapPin className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
        <span>Paris, France</span>
      </span>
    </div>
  );
};

// 2. Ghost Summary Box Placeholder
export const SkeletonSummaryBox: React.FC<{
  primaryColor?: string;
  variant?: 'modern' | 'tech' | 'executive' | 'creative' | 'academic' | 'split';
}> = ({ primaryColor = '#0284c7', variant = 'modern' }) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;

  if (variant === 'tech') {
    return (
      <div 
        onClick={() => onEditSection?.('info')}
        data-no-print="true"
        data-export-ignore="true"
        className="no-print cv-edit-only cv-edit-skeleton my-4 p-3 bg-slate-900/90 text-slate-400 rounded-lg text-xs font-mono border-l-4 border-dashed cursor-pointer hover:bg-slate-900 transition-colors group"
        style={{ borderColor: primaryColor }}
      >
        <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-between">
          <span className="text-emerald-400 font-bold">$ cat bio_summary.sh</span>
          <span className="text-[10px] opacity-75 text-slate-400 group-hover:text-emerald-400 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Rédiger l'accroche
          </span>
        </div>
        <p className="text-slate-400 italic">
          // Résumé professionnel : Décrivez vos compétences clés, architectures logicielles maîtrisées et objectifs...
        </p>
      </div>
    );
  }

  if (variant === 'creative') {
    return (
      <div 
        onClick={() => onEditSection?.('info')}
        data-no-print="true"
        data-export-ignore="true"
        className="no-print cv-edit-only cv-edit-skeleton mb-8 p-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 cursor-pointer hover:bg-zinc-100/60 transition-colors group"
      >
        <p className="text-xs text-zinc-400 font-light italic flex items-center justify-between">
          <span>"Présentez votre vision, vos atouts différenciants et vos réalisations majeures..."</span>
          <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-900 flex items-center gap-1 shrink-0 ml-2">
            <Plus className="w-3 h-3" /> Ajouter bio
          </span>
        </p>
      </div>
    );
  }

  if (variant === 'executive') {
    return (
      <div 
        onClick={() => onEditSection?.('info')}
        data-no-print="true"
        data-export-ignore="true"
        className="no-print cv-edit-only cv-edit-skeleton p-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-slate-100 transition-colors group"
      >
        <p className="text-xs text-slate-400 italic flex items-center justify-between">
          <span>Synthèse de gouvernance, vision managériale et jalons stratégiques...</span>
          <span className="text-[10px] font-semibold text-slate-600 group-hover:text-slate-900 flex items-center gap-1 shrink-0 ml-2">
            <Plus className="w-3 h-3" /> Éditer synthèse
          </span>
        </p>
      </div>
    );
  }

  // Modern / Academic / Split default
  return (
    <div 
      onClick={() => onEditSection?.('info')}
      data-no-print="true"
      data-export-ignore="true"
      className="no-print cv-edit-only cv-edit-skeleton mb-5 p-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100/80 transition-colors group"
    >
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="italic">
          Ajoutez un résumé percutant pour capter l'attention des recruteurs en quelques lignes...
        </span>
        <span className="text-[10px] font-semibold text-slate-500 group-hover:text-sky-600 flex items-center gap-1 shrink-0 ml-2">
          <Plus className="w-3 h-3" /> Rédiger
        </span>
      </div>
    </div>
  );
};

// 3. Ghost Experiences Skeleton
export const SkeletonExperiencesSection: React.FC<{
  primaryColor?: string;
  variant?: 'modern' | 'tech' | 'executive' | 'creative' | 'academic' | 'split';
}> = ({ primaryColor = '#0284c7', variant = 'modern' }) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;

  return (
    <div 
      onClick={() => onEditSection?.('experiences')}
      data-no-print="true"
      data-export-ignore="true"
      className="no-print cv-edit-only cv-edit-skeleton p-3.5 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 transition-all cursor-pointer group select-none space-y-3"
      title="Cliquer pour ajouter une expérience professionnelle"
    >
      {/* Ghost Item 1 */}
      <div className="space-y-1.5 opacity-65">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-40 bg-slate-300 rounded font-semibold" />
          <span className="text-[10px] text-slate-400 font-mono">2022 — Présent</span>
        </div>
        <div className="h-3 w-28 rounded" style={{ backgroundColor: `${primaryColor}40` }} />
        <div className="space-y-1 pt-1">
          <div className="h-2.5 w-full bg-slate-200 rounded" />
          <div className="h-2.5 w-4/5 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Action prompt */}
      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          Aucune expérience ajoutée
        </span>
        <span 
          className="text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs text-white flex items-center gap-1 group-hover:scale-105 transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="w-3 h-3" /> Ajouter une expérience
        </span>
      </div>
    </div>
  );
};

// 4. Ghost Education Skeleton
export const SkeletonEducationSection: React.FC<{
  primaryColor?: string;
  variant?: string;
}> = ({ primaryColor = '#0284c7' }) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;

  return (
    <div 
      onClick={() => onEditSection?.('education')}
      data-no-print="true"
      data-export-ignore="true"
      className="no-print cv-edit-only cv-edit-skeleton p-3 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 transition-all cursor-pointer group select-none space-y-2"
      title="Cliquer pour ajouter une formation"
    >
      <div className="space-y-1 opacity-65">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-32 bg-slate-300 rounded" />
          <span className="text-[10px] text-slate-400 font-mono">2018 — 2021</span>
        </div>
        <div className="h-2.5 w-24 bg-slate-200 rounded" />
      </div>

      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <GraduationCap className="w-3 h-3 text-slate-400" />
          Formation & Diplômes
        </span>
        <span className="text-[10px] font-bold text-slate-700 group-hover:text-sky-600 flex items-center gap-0.5">
          <Plus className="w-3 h-3" /> Ajouter formation
        </span>
      </div>
    </div>
  );
};

// 5. Ghost Skills Skeleton
export const SkeletonSkillsSection: React.FC<{
  primaryColor?: string;
  variant?: 'modern' | 'tech' | 'executive' | 'creative' | 'academic' | 'split';
}> = ({ primaryColor = '#0284c7', variant = 'modern' }) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;

  const placeholderTags = ['Compétence 1', 'Expertise 2', 'Outil / Stack', 'Méthode', 'Savoir-faire'];

  return (
    <div 
      onClick={() => onEditSection?.('skills')}
      data-no-print="true"
      data-export-ignore="true"
      className="no-print cv-edit-only cv-edit-skeleton p-3 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 transition-all cursor-pointer group select-none"
      title="Cliquer pour ajouter des compétences"
    >
      <div className="flex flex-wrap gap-1.5 mb-2.5 opacity-60">
        {placeholderTags.map((tag, idx) => (
          <span 
            key={idx}
            className="text-[11px] px-2 py-0.5 rounded border border-dashed border-slate-300 text-slate-400 bg-white"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-400" />
          Compétences clés
        </span>
        <span className="text-[10px] font-bold text-slate-700 group-hover:text-sky-600 flex items-center gap-0.5">
          <Plus className="w-3 h-3" /> Ajouter compétences
        </span>
      </div>
    </div>
  );
};

// 6. Ghost Projects Skeleton
export const SkeletonProjectsSection: React.FC<{
  primaryColor?: string;
}> = ({ primaryColor = '#0284c7' }) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;

  return (
    <div 
      onClick={() => onEditSection?.('projects')}
      data-no-print="true"
      data-export-ignore="true"
      className="no-print cv-edit-only cv-edit-skeleton p-3 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 transition-all cursor-pointer group select-none space-y-2"
      title="Cliquer pour ajouter un projet marquant"
    >
      <div className="space-y-1.5 opacity-65">
        <div className="h-3.5 w-36 bg-slate-300 rounded" />
        <div className="h-2.5 w-full bg-slate-200 rounded" />
        <div className="flex gap-1 pt-1">
          <span className="h-3.5 w-12 bg-slate-200 rounded text-[9px]" />
          <span className="h-3.5 w-12 bg-slate-200 rounded text-[9px]" />
        </div>
      </div>

      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <FolderGit2 className="w-3 h-3 text-slate-400" />
          Projets & Réalisations
        </span>
        <span className="text-[10px] font-bold text-slate-700 group-hover:text-sky-600 flex items-center gap-0.5">
          <Plus className="w-3 h-3" /> Ajouter un projet
        </span>
      </div>
    </div>
  );
};

// 7. Ghost Languages Skeleton
export const SkeletonLanguagesSection: React.FC<{
  primaryColor?: string;
}> = ({ primaryColor = '#0284c7' }) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;

  return (
    <div 
      onClick={() => onEditSection?.('languages')}
      data-no-print="true"
      data-export-ignore="true"
      className="no-print cv-edit-only cv-edit-skeleton p-2.5 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 transition-all cursor-pointer group select-none"
      title="Cliquer pour ajouter une langue"
    >
      <div className="space-y-1 text-xs opacity-60 mb-2">
        <div className="flex justify-between text-slate-400">
          <span>Français</span>
          <span className="text-[10px]">Langue maternelle</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Anglais</span>
          <span className="text-[10px]">Professionnel</span>
        </div>
      </div>

      <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
        <span className="text-slate-500 flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-400" />
          Langues
        </span>
        <span className="font-bold text-slate-700 group-hover:text-sky-600 flex items-center gap-0.5">
          <Plus className="w-2.5 h-2.5" /> Ajouter
        </span>
      </div>
    </div>
  );
};

// 8. Ghost Certifications Skeleton
export const SkeletonCertificationsSection: React.FC<{
  primaryColor?: string;
}> = ({ primaryColor = '#0284c7' }) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;

  return (
    <div 
      onClick={() => onEditSection?.('languages')}
      data-no-print="true"
      data-export-ignore="true"
      className="no-print cv-edit-only cv-edit-skeleton p-2.5 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 transition-all cursor-pointer group select-none"
      title="Cliquer pour ajouter une certification"
    >
      <div className="opacity-60 space-y-1 mb-1.5">
        <div className="h-3 w-32 bg-slate-300 rounded" />
        <div className="h-2 w-20 bg-slate-200 rounded" />
      </div>

      <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
        <span className="text-slate-500 flex items-center gap-1">
          <Award className="w-3 h-3 text-amber-500" />
          Certifications
        </span>
        <span className="font-bold text-slate-700 group-hover:text-sky-600 flex items-center gap-0.5">
          <Plus className="w-2.5 h-2.5" /> Ajouter
        </span>
      </div>
    </div>
  );
};

// 9. Ghost Photo Placeholder (indicates dedicated avatar slot)
export const SkeletonPhotoPlaceholder: React.FC<{
  primaryColor?: string;
  shape?: 'round' | 'rounded' | 'square';
  sizeClassName?: string;
  className?: string;
  dark?: boolean;
}> = ({
  primaryColor = '#0284c7',
  shape = 'round',
  sizeClassName = 'w-24 h-24 sm:w-28 sm:h-28',
  className = '',
  dark = false,
}) => {
  const { onEditSection, isInteractive } = usePreviewEdit();
  if (!onEditSection || isInteractive === false) return null;
  
  const shapeClass = 
    shape === 'round' ? 'rounded-full' :
    shape === 'rounded' ? 'rounded-2xl' :
    'rounded-none';

  return (
    <div
      onClick={() => onEditSection?.('info')}
      data-no-print="true"
      data-export-ignore="true"
      className={`no-print cv-edit-only cv-edit-skeleton shrink-0 relative group cursor-pointer select-none flex flex-col items-center justify-center border-2 border-dashed transition-all duration-200 ${
        dark 
          ? 'bg-slate-800/70 border-slate-600 hover:border-slate-400 text-slate-400 hover:text-slate-200' 
          : 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 hover:bg-slate-100/90'
      } ${shapeClass} ${sizeClassName} ${className}`}
      title="Emplacement photo de profil — Cliquer pour ajouter ou modifier votre photo"
    >
      <div className="flex flex-col items-center justify-center p-2 text-center">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-110 ${
            dark ? 'bg-slate-700/80' : 'bg-slate-200/90'
          }`}
        >
          <Camera className="w-4 h-4 opacity-75 group-hover:opacity-100" style={{ color: primaryColor }} />
        </div>
        <span className="text-[10px] font-semibold tracking-tight leading-none group-hover:underline flex items-center gap-0.5">
          <Plus className="w-2.5 h-2.5" /> Photo
        </span>
      </div>
      <div className="absolute inset-0 rounded-[inherit] bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
    </div>
  );
};

