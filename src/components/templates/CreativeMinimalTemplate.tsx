import React from 'react';
import { CVData, ThemeConfig, PersonalInfo } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Sparkles, ArrowUpRight } from 'lucide-react';
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

export const CreativeMinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme: Partial<ThemeConfig> = data?.theme || {};
  const personalInfo: Partial<PersonalInfo> = data?.personalInfo || {};
  const experiences = data?.experiences || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const languages = data?.languages || [];
  const projects = data?.projects || [];
  const certifications = data?.certifications || [];
  const interests = data?.interests || [];
  const primaryColor = theme.primaryColor || '#7c3aed';
  const secondaryColor = theme.secondaryColor || '#18181b';

  const hasAnyContact = Boolean(
    personalInfo.email || personalInfo.phone || personalInfo.location || 
    personalInfo.website || personalInfo.linkedin
  );

  return (
    <div 
      className="w-full bg-white text-zinc-800 p-8 sm:p-12 shadow-sm leading-relaxed relative"
      style={{ fontFamily: theme.fontBody || 'sans-serif' }}
    >
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b border-zinc-100">
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs font-semibold tracking-widest uppercase" style={{ color: primaryColor }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portfolio & Résumé</span>
            </div>
            <SectionEditButton section="info" label="Profil" />
          </div>
          <h1 
            className={`text-4xl sm:text-5xl font-light tracking-tight ${
              !personalInfo.fullName ? 'text-zinc-300 italic' : 'text-zinc-900'
            }`}
            style={{ fontFamily: theme.fontHeading || 'serif' }}
          >
            {personalInfo.fullName || 'Votre Prénom & Nom'}
          </h1>
          <p 
            className={`text-lg font-normal ${
              !personalInfo.jobTitle ? 'text-zinc-400 italic' : 'text-zinc-500'
            }`}
          >
            {personalInfo.jobTitle || 'Direction Artistique / Créatif / Designer'}
          </p>

          {hasAnyContact ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-500 pt-2">
              {personalInfo.email && (
                <ProtectedContactItem type="email" value={personalInfo.email} iconColor={primaryColor} />
              )}
              {personalInfo.phone && (
                <ProtectedContactItem type="phone" value={personalInfo.phone} iconColor={primaryColor} />
              )}
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.website && (
                <span className="font-medium break-all" style={{ color: primaryColor }}>
                  {personalInfo.website.replace(/^https?:\/\//, '')}
                </span>
              )}
            </div>
          ) : (
            <div className="pt-2">
              <SkeletonContactBar primaryColor={primaryColor} />
            </div>
          )}
        </div>

        <CVAvatar
          avatarUrl={personalInfo.avatarUrl}
          fullName={personalInfo.fullName}
          primaryColor={primaryColor}
          shape={theme.photoShape || 'round'}
          showPhoto={theme.showPhoto !== false}
          sizeClassName="w-28 h-28"
          extraImgClass="grayscale hover:grayscale-0 transition-all duration-300"
        />
      </div>

      {/* Summary */}
      {personalInfo.summary ? (
        <div className="mb-10 max-w-3xl relative">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm sm:text-base text-zinc-600 font-light leading-relaxed">
              "{personalInfo.summary}"
            </p>
            <SectionEditButton section="info" label="Bio" />
          </div>
        </div>
      ) : (
        <div className="mb-8 max-w-2xl">
          <SkeletonSummaryBox primaryColor={primaryColor} variant="creative" />
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Work & Projects */}
        <div className="md:col-span-8 space-y-8">
          {/* Experience */}
          {experiences && experiences.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  01. Expérience
                </h2>
                <SectionEditButton section="experiences" label="Expériences" />
              </div>
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1.5">
                    <div className="flex flex-wrap justify-between items-baseline gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900">{exp.role}</h3>
                      <span className="text-xs text-zinc-400 font-mono">
                        {exp.startDate} — {exp.isCurrent ? 'Présent' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-500">
                      {exp.company} {exp.location && `(${exp.location})`}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-zinc-600 font-light">{exp.description}</p>
                    )}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="space-y-1 text-xs text-zinc-600 font-light pt-1">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-zinc-300 mt-2 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  01. Expérience
                </h2>
                <SectionEditButton section="experiences" label="Expériences" />
              </div>
              <SkeletonExperiencesSection primaryColor={primaryColor} variant="creative" />
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  02. Réalisations & Projets
                </h2>
                <SectionEditButton section="projects" label="Projets" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-zinc-900">{proj.title}</h3>
                      {proj.link && <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />}
                    </div>
                    <p className="text-xs text-zinc-500 font-light">{proj.description}</p>
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 text-zinc-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Skills & Education */}
        <div className="md:col-span-4 space-y-8">
          {/* Skills */}
          {skills && skills.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  03. Expertise
                </h2>
                <SectionEditButton section="skills" label="Compétences" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((sk) => (
                  <span 
                    key={sk.id}
                    className="text-xs px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-700 bg-white font-normal"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  03. Expertise
                </h2>
                <SectionEditButton section="skills" label="Compétences" />
              </div>
              <SkeletonSkillsSection primaryColor={primaryColor} variant="creative" />
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  04. Formation
                </h2>
                <SectionEditButton section="education" label="Formation" />
              </div>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs space-y-0.5">
                    <div className="font-semibold text-zinc-900">{edu.degree}</div>
                    <div className="text-zinc-500">{edu.institution}</div>
                    <div className="text-[11px] text-zinc-400">{edu.startDate} — {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  04. Formation
                </h2>
                <SectionEditButton section="education" label="Formation" />
              </div>
              <SkeletonEducationSection primaryColor={primaryColor} />
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  05. Langues
                </h2>
                <SectionEditButton section="languages" label="Langues" />
              </div>
              <div className="space-y-1 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between text-zinc-600">
                    <span>{l.name}</span>
                    <span className="text-zinc-400">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2 cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                  05. Langues
                </h2>
                <SectionEditButton section="languages" label="Langues" />
              </div>
              <SkeletonLanguagesSection primaryColor={primaryColor} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
