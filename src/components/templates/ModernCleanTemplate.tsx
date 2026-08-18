import React from 'react';
import { CVData, ThemeConfig, PersonalInfo } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink, Calendar, Award } from 'lucide-react';
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

export const ModernCleanTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme: Partial<ThemeConfig> = data?.theme || {};
  const personalInfo: Partial<PersonalInfo> = data?.personalInfo || {};
  const experiences = data?.experiences || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const languages = data?.languages || [];
  const projects = data?.projects || [];
  const certifications = data?.certifications || [];
  const interests = data?.interests || [];
  const primaryColor = theme.primaryColor || '#0284c7';
  const secondaryColor = theme.secondaryColor || '#0f172a';

  const hasAnyContact = Boolean(
    personalInfo.email || personalInfo.phone || personalInfo.location || 
    personalInfo.website || personalInfo.linkedin || personalInfo.github
  );

  return (
    <div 
      className="w-full bg-white text-slate-800 p-8 sm:p-10 shadow-sm leading-relaxed relative"
      style={{ fontFamily: theme.fontBody || 'Inter, sans-serif' }}
    >
      {/* Header Banner */}
      <div className="border-b pb-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative group" style={{ borderColor: `${primaryColor}25` }}>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h1 
              className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                !personalInfo.fullName ? 'text-slate-400 italic' : ''
              }`}
              style={{ 
                color: personalInfo.fullName ? secondaryColor : undefined, 
                fontFamily: theme.fontHeading || 'Inter, sans-serif' 
              }}
            >
              {personalInfo.fullName || 'Votre Prénom & Nom'}
            </h1>
            <SectionEditButton section="info" label="Profil" />
          </div>
          <p 
            className={`text-lg sm:text-xl font-medium mb-3 ${
              !personalInfo.jobTitle ? 'opacity-60 italic' : ''
            }`}
            style={{ color: primaryColor }}
          >
            {personalInfo.jobTitle || 'Votre Intitulé de Poste'}
          </p>

          {/* Contact Bar */}
          {hasAnyContact ? (
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-slate-600">
              {personalInfo.email && (
                <ProtectedContactItem type="email" value={personalInfo.email} iconColor={primaryColor} />
              )}
              {personalInfo.phone && (
                <ProtectedContactItem type="phone" value={personalInfo.phone} iconColor={primaryColor} />
              )}
              {personalInfo.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                  <span>{personalInfo.location}</span>
                </span>
              )}
              {personalInfo.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                  <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                  <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                </span>
              )}
              {personalInfo.github && (
                <span className="flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                  <span className="break-all">{personalInfo.github.replace(/^https?:\/\//, '')}</span>
                </span>
              )}
            </div>
          ) : (
            <SkeletonContactBar primaryColor={primaryColor} />
          )}
        </div>

        <CVAvatar
          avatarUrl={personalInfo.avatarUrl}
          fullName={personalInfo.fullName}
          primaryColor={primaryColor}
          shape={theme.photoShape || 'round'}
          showPhoto={theme.showPhoto !== false}
        />
      </div>

      {/* Summary */}
      {personalInfo.summary ? (
        <div className="mb-6 relative group">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">À Propos</span>
            <SectionEditButton section="info" label="Bio" />
          </div>
          <p className="text-slate-700 text-sm leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </div>
      ) : (
        <SkeletonSummaryBox primaryColor={primaryColor} variant="modern" />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Experiences & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Experiences */}
          {experiences && experiences.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Expérience Professionnelle
                </h2>
                <SectionEditButton section="experiences" label="Expériences" />
              </div>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-3 border-l-2" style={{ borderColor: `${primaryColor}30` }}>
                    <div className="flex flex-wrap items-baseline justify-between gap-1 mb-0.5">
                      <h3 className="text-sm font-semibold text-slate-900">{exp.role}</h3>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {exp.startDate} - {exp.isCurrent ? 'Présent' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-medium mb-1.5" style={{ color: primaryColor }}>
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 mb-2">{exp.description}</p>
                    )}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-3 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Expérience Professionnelle
                </h2>
                <SectionEditButton section="experiences" label="Expériences" />
              </div>
              <SkeletonExperiencesSection primaryColor={primaryColor} variant="modern" />
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Projets Marquants & Réalisations
                </h2>
                <SectionEditButton section="projects" label="Projets" />
              </div>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-xs font-semibold text-slate-900">{proj.title}</h3>
                      {proj.link && (
                        <a 
                          href={proj.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs flex items-center gap-0.5 hover:underline"
                          style={{ color: primaryColor }}
                        >
                          Lien <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    {proj.role && <div className="text-[11px] text-slate-500 mb-1">{proj.role}</div>}
                    <p className="text-xs text-slate-600 mb-2">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((t, idx) => (
                          <span 
                            key={idx} 
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-white border border-slate-200 text-slate-700"
                          >
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

        {/* Right 1 Col: Skills, Education, Certs, Languages */}
        <div className="space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Compétences
                </h2>
                <SectionEditButton section="skills" label="Compétences" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((sk) => (
                  <span 
                    key={sk.id}
                    className="text-xs px-2.5 py-1 rounded-md font-medium text-slate-800 border"
                    style={{ backgroundColor: `${primaryColor}0d`, borderColor: `${primaryColor}25` }}
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-2 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Compétences
                </h2>
                <SectionEditButton section="skills" label="Compétences" />
              </div>
              <SkeletonSkillsSection primaryColor={primaryColor} variant="modern" />
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Formation
                </h2>
                <SectionEditButton section="education" label="Formation" />
              </div>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-semibold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600 font-medium">{edu.institution} {edu.location && `• ${edu.location}`}</div>
                    <div className="text-[11px] text-slate-500">{edu.startDate} - {edu.endDate} {edu.grade && `(${edu.grade})`}</div>
                    {edu.description && <p className="text-[11px] text-slate-600 mt-1">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-2 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Formation
                </h2>
                <SectionEditButton section="education" label="Formation" />
              </div>
              <SkeletonEducationSection primaryColor={primaryColor} />
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Certifications
                </h2>
                <SectionEditButton section="languages" label="Certifs" />
              </div>
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div key={cert.id} className="text-xs">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{cert.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{cert.issuer} • {cert.issueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Langues
                </h2>
                <SectionEditButton section="languages" label="Langues" />
              </div>
              <div className="space-y-1.5">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{lang.name}</span>
                    <span className="text-slate-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-2 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Langues
                </h2>
                <SectionEditButton section="languages" label="Langues" />
              </div>
              <SkeletonLanguagesSection primaryColor={primaryColor} />
            </div>
          )}

          {/* Interests */}
          {interests && interests.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b" style={{ borderColor: `${primaryColor}40` }}>
                <h2 
                  className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Centres d'intérêt
                </h2>
                <SectionEditButton section="languages" label="Loisirs" />
              </div>
              <p className="text-xs text-slate-600">
                {interests.map(i => i.name).join(' • ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
