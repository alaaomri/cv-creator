import React, { createContext, useContext } from 'react';
import { Pencil } from 'lucide-react';

export type CVEditorTab = 'info' | 'experiences' | 'education' | 'skills' | 'projects' | 'languages' | 'theme';

export interface PreviewEditContextType {
  onEditSection?: (sectionId: CVEditorTab) => void;
  maskContactInfo?: boolean;
  isInteractive?: boolean;
}

export const PreviewEditContext = createContext<PreviewEditContextType>({});

export const usePreviewEdit = () => useContext(PreviewEditContext);

interface SectionEditButtonProps {
  section: CVEditorTab;
  label?: string;
  className?: string;
  alwaysVisible?: boolean;
}

export const SectionEditButton: React.FC<SectionEditButtonProps> = ({
  section,
  label = 'Modifier',
  className = '',
  alwaysVisible = true,
}) => {
  const { onEditSection, isInteractive } = usePreviewEdit();

  if (!onEditSection || isInteractive === false) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onEditSection(section);
      }}
      data-no-print="true"
      data-export-ignore="true"
      aria-label={`Modifier la section ${label || section}`}
      title={`Cliquer pour aller directement à la section ${label || section} dans l'éditeur`}
      className={`no-print cv-edit-action-btn cv-edit-only inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all shadow-xs cursor-pointer select-none border group/pen bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border-slate-300 hover:border-sky-300 hover:scale-105 active:scale-95 ${className}`}
    >
      <Pencil className="w-3 h-3 text-sky-600 group-hover/pen:text-sky-700 transition-colors shrink-0" />
      <span className="text-[10px] font-medium tracking-normal whitespace-nowrap">{label}</span>
    </button>
  );
};

