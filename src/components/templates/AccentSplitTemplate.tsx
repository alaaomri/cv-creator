import React from 'react';
import { CVData, ThemeConfig, PersonalInfo } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, Sparkles, BookOpen, Layers } from 'lucide-react';
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

export const AccentSplitTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme: Partial<ThemeConfig> = data?.theme || {};
  const personalInfo: Partial<PersonalInfo> = data?.personalInfo || {};
  const experiences = data?.experiences || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const languages = data?.languages || [];
  const projects = data?.projects || [];
  const certifications = data?.certifications || [];
  const interests = data?.interests || [];
  const primaryColor = theme.primaryColor || '#f97316';
  const secondaryColor = theme.secondaryColor || '#1e293b';

  const hasAnyContact = Boolean(
    personalInfo.email || personalInfo.phone || personalInfo.location || 
    personalInfo.linkedin || personalInfo.website
  );

  return (
    <div 
      className="w-full bg-white text-slate-800 shadow-sm flex flex-col md:flex-row min-h-[950px] relative"
      style={{ fontFamily: theme.fontBody || 'Inter, sans-serif' }}
    >
      {/* Tinted Sidebar (Left) */}
      <div 
        className="w-full md:w-[35%] p-6 sm:p-8 flex flex-col justify-between"
        style={{ backgroundColor: `${primaryColor}0d`, borderRight: `2px solid ${primaryColor}25` }}
      >
        <div className="space-y-6">
          {/* Avatar & Basic Info */}
          <div className="text-center relative">
            <div className="flex justify-end mb-2">
              <SectionEditButton section="info" label="Profil" />
            </div>
            <div className="flex justify-center mb-3">
              <CVAvatar
                avatarUrl={personalInfo.avatarUrl}
                fullName={personalInfo.fullName}
                primaryColor={primaryColor}
                shape={theme.photoShape || 'round'}
                showPhoto={theme.showPhoto !== false}
                sizeClassName="w-24 h-24 sm:w-28 sm:h-28"
                borderClassName="border-4"
              />
            </div>
            <h1 
              className={`text-2xl font-bold tracking-tight ${
                !personalInfo.fullName ? 'text-slate-400 italic' : 'text-slate-900'
              }`}
              style={{ fontFamily: theme.fontHeading || 'Inter, sans-serif' }}
            >
              {personalInfo.fullName || 'Votre Prénom & Nom'}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: primaryColor }}>
              {personalInfo.jobTitle || 'Titre du poste / Spécialité'}
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs text-slate-700 pt-2 border-t" style={{ borderColor: `${primaryColor}25` }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>Contact</span>
              </h3>
              <SectionEditButton section="info" label="Contact" />
            </div>
            {hasAnyContact ? (
              <>
                {personalInfo.email && (
                  <div className="flex items-start gap-2">
                    <ProtectedContactItem type="email" value={personalInfo.email} iconColor={primaryColor} />
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <ProtectedContactItem type="phone" value={personalInfo.phone} iconColor={primaryColor} />
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-start gap-2">
                    <Linkedin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                    <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                    <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </>
            ) : (
              <SkeletonContactBar primaryColor={primaryColor} />
            )}
          </div>

          {/* Education */}
          {education && education.length > 0 ? (
            <div className="pt-2 border-t" style={{ borderColor: `${primaryColor}25` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Formation</span>
                </h3>
                <SectionEditButton section="education" label="Formation" />
              </div>
              <div className="space-y-3">
                {education.map(edu => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600 font-medium">{edu.institution}</div>
                    <div className="text-[11px] text-slate-500">{edu.startDate} - {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t cv-edit-only no-print" data-no-print="true" data-export-ignore="true" style={{ borderColor: `${primaryColor}25` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Formation</span>
                </h3>
                <SectionEditButton section="education" label="Formation" />
              </div>
              <SkeletonEducationSection primaryColor={primaryColor} />
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 ? (
            <div className="pt-2 border-t" style={{ borderColor: `${primaryColor}25` }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Compétences</span>
                </h3>
                <SectionEditButton section="skills" label="Compétences" />
              </div>
              <div className="flex flex-wrap gap-1">
                {skills.map(sk => (
                  <span 
                    key={sk.id}
                    className="text-xs px-2 py-0.5 rounded font-medium bg-white border text-slate-800 shadow-2xs"
                    style={{ borderColor: `${primaryColor}35` }}
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t cv-edit-only no-print" data-no-print="true" data-export-ignore="true" style={{ borderColor: `${primaryColor}25` }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Compétences</span>
                </h3>
                <SectionEditButton section="skills" label="Compétences" />
              </div>
              <SkeletonSkillsSection primaryColor={primaryColor} />
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 ? (
            <div className="pt-2 border-t" style={{ borderColor: `${primaryColor}25` }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Langues</h3>
                <SectionEditButton section="languages" label="Langues" />
              </div>
              <div className="space-y-1 text-xs">
                {languages.map(l => (
                  <div key={l.id} className="flex justify-between text-slate-700">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-slate-500">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t cv-edit-only no-print" data-no-print="true" data-export-ignore="true" style={{ borderColor: `${primaryColor}25` }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Langues</h3>
                <SectionEditButton section="languages" label="Langues" />
              </div>
              <SkeletonLanguagesSection primaryColor={primaryColor} />
            </div>
          )}
        </div>
      </div>

      {/* Main Experience Body (Right) */}
      <div className="w-full md:w-[65%] p-6 sm:p-8 space-y-6">
        {/* Summary */}
        {personalInfo.summary ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>À Propos</span>
              </h2>
              <SectionEditButton section="info" label="Bio" />
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        ) : (
          <SkeletonSummaryBox primaryColor={primaryColor} variant="modern" />
        )}

        {/* Experiences */}
        {experiences && experiences.length > 0 ? (
          <div>
            <div 
              className="flex items-center justify-between pb-2 border-b mb-4 text-slate-900"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: primaryColor }} />
                Expérience Professionnelle
              </h2>
              <SectionEditButton section="experiences" label="Expériences" />
            </div>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-3.5 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
                  <div className="flex flex-wrap justify-between items-baseline gap-1 mb-0.5">
                    <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-white" style={{ backgroundColor: primaryColor }}>
                      {exp.startDate} - {exp.isCurrent ? 'Présent' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 mb-1.5">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-600 mb-2">{exp.description}</p>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
            <div 
              className="flex items-center justify-between pb-2 border-b mb-4 text-slate-900"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: primaryColor }} />
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
            <div 
              className="flex items-center justify-between pb-2 border-b mb-3 text-slate-900"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: primaryColor }} />
                Projets Récents
              </h2>
              <SectionEditButton section="projects" label="Projets" />
            </div>
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="font-bold text-xs text-slate-900">{p.title}</div>
                  <p className="text-xs text-slate-600 mt-1">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <div 
              className="flex items-center justify-between pb-2 border-b mb-2 text-slate-900"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: primaryColor }} />
                Certifications & Titres
              </h2>
              <SectionEditButton section="languages" label="Certifs" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {certifications.map(c => (
                <div key={c.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="font-bold text-slate-900">{c.title}</div>
                  <div className="text-[11px] text-slate-500">{c.issuer} • {c.issueDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
