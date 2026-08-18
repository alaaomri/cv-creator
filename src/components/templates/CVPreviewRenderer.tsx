import React from 'react';
import { CVData } from '../../types';
import { ensureValidCVData } from '../../utils/cvDefaults';
import { PreviewEditContext, CVEditorTab } from '../../context/PreviewEditContext';
import { ModernCleanTemplate } from './ModernCleanTemplate';
import { TechDeveloperTemplate } from './TechDeveloperTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { CreativeMinimalTemplate } from './CreativeMinimalTemplate';
import { AcademicClassicTemplate } from './AcademicClassicTemplate';
import { AccentSplitTemplate } from './AccentSplitTemplate';

interface CVPreviewRendererProps {
  data: CVData;
  scale?: number;
  printMode?: boolean;
  onEditSection?: (sectionId: CVEditorTab) => void;
}

export const CVPreviewRenderer: React.FC<CVPreviewRendererProps> = ({ 
  data, 
  scale = 1,
  printMode = false,
  onEditSection,
}) => {
  const safeData = ensureValidCVData(data);

  const renderTemplate = () => {
    switch (safeData.templateId) {
      case 'tech-developer':
        return <TechDeveloperTemplate data={safeData} />;
      case 'executive':
        return <ExecutiveTemplate data={safeData} />;
      case 'creative-minimal':
        return <CreativeMinimalTemplate data={safeData} />;
      case 'academic-classic':
        return <AcademicClassicTemplate data={safeData} />;
      case 'accent-split':
        return <AccentSplitTemplate data={safeData} />;
      case 'modern-clean':
      default:
        return <ModernCleanTemplate data={safeData} />;
    }
  };

  const isContactMasked = Boolean(safeData.securityConfig?.maskContactInfo);
  const isInteractive = !printMode && Boolean(onEditSection);

  return (
    <PreviewEditContext.Provider value={{ 
      onEditSection: isInteractive ? onEditSection : undefined,
      maskContactInfo: isContactMasked,
      isInteractive: isInteractive,
    }}>
      <div 
        id="cv-printable-document"
        className={`cv-page-container bg-white transition-transform origin-top ${
          printMode ? 'w-full shadow-none m-0' : 'w-full max-w-[820px] shadow-xl rounded-md border border-slate-200 overflow-hidden'
        }`}
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {renderTemplate()}
      </div>
    </PreviewEditContext.Provider>
  );
};
