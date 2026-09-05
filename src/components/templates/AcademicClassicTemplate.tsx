import React from 'react';
import { CVData, ThemeConfig, PersonalInfo } from '../../types';
import { SectionEditButton } from '../../context/PreviewEditContext';
import { ProtectedContactItem } from '../common/ProtectedContactItem';
import { CVAvatar } from './CVAvatar';
import { 
  SkeletonContactBar, 
  SkeletonSummaryBox, 
  SkeletonExperiencesSection, 
  SkeletonEducationSection, 
  SkeletonSkillsSection, 
  SkeletonLanguagesSection
} from './TemplateSkeletonPlaceholders';

interface TemplateProps {
  data: CVData;
}

export const AcademicClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme: Partial<ThemeConfig> = data?.theme || {};
  const personalInfo: Partial<PersonalInfo> = data?.personalInfo || {};
  const experiences = data?.experiences || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const languages = data?.languages || [];
  const projects = data?.projects || [];
  const certifications = data?.certifications || [];
  const interests = data?.interests || [];
  const primaryColor = theme.primaryColor || '#1e293b';

  const hasAnyContact = Boolean(
    personalInfo.email || personalInfo.phone || personalInfo.location || 
    personalInfo.linkedin || personalInfo.website
  );

  return (
    <div 
      className="w-full bg-white text-slate-900 p-8 sm:p-12 shadow-sm leading-relaxed relative"
      style={{ fontFamily: theme.fontBody || 'Georgia, serif' }}
    >
      {/* Centered Header */}
      <div className="relative text-center pb-6 mb-6 border-b-2 border-slate-900">
        <div className="absolute right-0 top-0">
          <SectionEditButton section="info" label="Profil" />
        </div>
        <div className="flex justify-center mb-3">
          <CVAvatar
            avatarUrl={personalInfo.avatarUrl}
            objectPosition={personalInfo.avatarPosition}
            zoom={personalInfo.avatarZoom}
            fullName={personalInfo.fullName}
            primaryColor={primaryColor}
            shape={theme.photoShape || 'round'}
            showPhoto={theme.showPhoto !== false}
            sizeClassName="w-24 h-24"
          />
        </div>
        <h1 
          className={`text-3xl sm:text-4xl font-bold tracking-tight mb-1 ${
            !personalInfo.fullName ? 'text-slate-400 italic font-normal' : 'text-slate-900'
          }`}
          style={{ fontFamily: theme.fontHeading || 'Times New Roman, serif' }}
        >
          {personalInfo.fullName || 'Votre Prénom & Nom'}
        </h1>
        <p 
          className={`text-base font-semibold tracking-wide uppercase mb-3 ${
            !personalInfo.jobTitle ? 'text-slate-400 italic' : 'text-slate-700'
          }`}
        >
          {personalInfo.jobTitle || 'Titre Professionnel / Chercheur / Enseignant'}
        </p>

        {hasAnyContact ? (
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-700">
            {personalInfo.email && (
              <ProtectedContactItem type="email" value={personalInfo.email} iconColor={primaryColor} />
            )}
            {personalInfo.phone && (
              <ProtectedContactItem type="phone" value={personalInfo.phone} iconColor={primaryColor} />
            )}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
            {personalInfo.linkedin && <span className="break-all">• {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>}
            {personalInfo.website && <span className="break-all">• {personalInfo.website.replace(/^https?:\/\//, '')}</span>}
          </div>
        ) : (
          <div className="flex justify-center">
            <SkeletonContactBar primaryColor={primaryColor} />
          </div>
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary ? (
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Profil Professionnel
            </h2>
            <SectionEditButton section="info" label="Bio" />
          </div>
          <p className="text-xs sm:text-sm text-slate-800 text-justify leading-relaxed">
            {personalInfo.summary}
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <SkeletonSummaryBox primaryColor={primaryColor} variant="academic" />
        </div>
      )}

      {/* Experiences */}
      {experiences && experiences.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Expérience Professionnelle
            </h2>
            <SectionEditButton section="experiences" label="Expériences" />
          </div>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{exp.role}</span>
                  <span className="font-normal text-slate-600">{exp.startDate} - {exp.isCurrent ? 'Présent' : exp.endDate}</span>
                </div>
                <div className="italic text-slate-700 mb-1">{exp.company}, {exp.location}</div>
                {exp.description && <p className="text-slate-700 mb-1">{exp.description}</p>}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-slate-800">
                    {exp.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Expérience Professionnelle
            </h2>
            <SectionEditButton section="experiences" label="Expériences" />
          </div>
          <SkeletonExperiencesSection primaryColor={primaryColor} variant="academic" />
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Formation & Diplômes
            </h2>
            <SectionEditButton section="education" label="Formation" />
          </div>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{edu.degree} - {edu.field}</span>
                  <span className="font-normal text-slate-600">{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className="italic text-slate-700">{edu.institution}, {edu.location} {edu.grade && `(${edu.grade})`}</div>
                {edu.description && <p className="text-slate-600 mt-0.5">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Formation & Diplômes
            </h2>
            <SectionEditButton section="education" label="Formation" />
          </div>
          <SkeletonEducationSection primaryColor={primaryColor} />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Compétences Techniques & Outils
            </h2>
            <SectionEditButton section="skills" label="Compétences" />
          </div>
          <p className="text-xs text-slate-800 leading-relaxed">
            {skills.map(s => s.name).join(' • ')}
          </p>
        </div>
      ) : (
        <div className="mb-6 cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Compétences Techniques & Outils
            </h2>
            <SectionEditButton section="skills" label="Compétences" />
          </div>
          <SkeletonSkillsSection primaryColor={primaryColor} variant="academic" />
        </div>
      )}

      {/* Languages & Certifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {languages && languages.length > 0 ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                Langues
              </h2>
              <SectionEditButton section="languages" label="Langues" />
            </div>
            <div className="text-xs space-y-1">
              {languages.map(l => (
                <div key={l.id} className="flex justify-between text-slate-800">
                  <span>{l.name}</span>
                  <span className="text-slate-600">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                Langues
              </h2>
              <SectionEditButton section="languages" label="Langues" />
            </div>
            <SkeletonLanguagesSection primaryColor={primaryColor} />
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                Certifications
              </h2>
              <SectionEditButton section="languages" label="Certifs" />
            </div>
            <div className="text-xs space-y-1">
              {certifications.map(c => (
                <div key={c.id} className="text-slate-800">
                  <span className="font-semibold">{c.title}</span> ({c.issuer}, {c.issueDate})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
