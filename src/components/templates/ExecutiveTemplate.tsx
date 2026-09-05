import React from 'react';
import { CVData, ThemeConfig, PersonalInfo } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Award, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';
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

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme: Partial<ThemeConfig> = data?.theme || {};
  const personalInfo: Partial<PersonalInfo> = data?.personalInfo || {};
  const experiences = data?.experiences || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const languages = data?.languages || [];
  const projects = data?.projects || [];
  const certifications = data?.certifications || [];
  const interests = data?.interests || [];
  const primaryColor = theme.primaryColor || '#1e3a8a';
  const secondaryColor = theme.secondaryColor || '#0f172a';

  const hasAnyContact = Boolean(
    personalInfo.email || personalInfo.phone || personalInfo.location || 
    personalInfo.website || personalInfo.linkedin
  );

  return (
    <div 
      className="w-full bg-white text-slate-800 shadow-sm flex flex-col md:flex-row min-h-[950px] relative"
      style={{ fontFamily: theme.fontBody || 'Inter, sans-serif' }}
    >
      {/* Left Column Sidebar */}
      <div 
        className="w-full md:w-1/3 p-6 sm:p-8 text-white flex flex-col justify-between"
        style={{ backgroundColor: secondaryColor }}
      >
        <div className="space-y-6">
          {/* Avatar */}
        <div className="flex justify-center mb-4">
          <CVAvatar
            avatarUrl={personalInfo.avatarUrl}
            objectPosition={personalInfo.avatarPosition}
            zoom={personalInfo.avatarZoom}
            fullName={personalInfo.fullName}
            primaryColor={primaryColor}
            shape={theme.photoShape || 'round'}
            showPhoto={theme.showPhoto !== false}
            dark={true}
            sizeClassName="w-28 h-28"
          />
        </div>

          {/* Name & Title on Mobile if left column */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h1 
                className={`text-2xl font-bold tracking-tight ${
                  !personalInfo.fullName ? 'text-slate-400 italic' : 'text-white'
                }`} 
                style={{ fontFamily: theme.fontHeading || 'serif' }}
              >
                {personalInfo.fullName || 'Votre Prénom & Nom'}
              </h1>
              <SectionEditButton section="info" label="Profil" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white" />
            </div>
            <p 
              className={`text-xs font-semibold uppercase tracking-widest ${
                !personalInfo.jobTitle ? 'text-slate-400 italic' : 'text-slate-300'
              }`}
            >
              {personalInfo.jobTitle || 'Titre de Fonction / Direction'}
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5 text-xs text-slate-200 border-t border-slate-700/60 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Coordonnées</h3>
              <SectionEditButton section="info" label="Contact" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white" />
            </div>
            {hasAnyContact ? (
              <>
                {personalInfo.email && (
                  <div className="flex items-start gap-2">
                    <ProtectedContactItem type="email" value={personalInfo.email} iconColor="#94a3b8" />
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <ProtectedContactItem type="phone" value={personalInfo.phone} iconColor="#94a3b8" />
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-start gap-2">
                    <Linkedin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="cv-edit-only no-print space-y-2 opacity-60" data-no-print="true" data-export-ignore="true">
                <div className="h-3 w-4/5 bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-3/5 bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-slate-700 rounded animate-pulse" />
              </div>
            )}
          </div>

          {/* Skills */}
          {skills && skills.length > 0 ? (
            <div className="border-t border-slate-700/60 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Compétences Clés</h3>
                <SectionEditButton section="skills" label="Compétences" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white" />
              </div>
              <div className="space-y-2">
                {skills.map((sk) => (
                  <div key={sk.id} className="text-xs">
                    <div className="flex justify-between text-slate-200 mb-1">
                      <span>{sk.name}</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${(sk.level / 5) * 100}%`, backgroundColor: primaryColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print border-t border-slate-700/60 pt-4" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Compétences Clés</h3>
                <SectionEditButton section="skills" label="Compétences" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white" />
              </div>
              <div className="space-y-2 opacity-50">
                <div className="space-y-1">
                  <div className="h-2.5 w-3/4 bg-slate-700 rounded" />
                  <div className="h-1.5 w-full bg-slate-800 rounded-full" />
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 w-2/3 bg-slate-700 rounded" />
                  <div className="h-1.5 w-full bg-slate-800 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 ? (
            <div className="border-t border-slate-700/60 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Langues</h3>
                <SectionEditButton section="languages" label="Langues" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white" />
              </div>
              <div className="space-y-1.5 text-xs text-slate-200">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-slate-400">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print border-t border-slate-700/60 pt-4" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Langues</h3>
                <SectionEditButton section="languages" label="Langues" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white" />
              </div>
              <div className="space-y-1.5 opacity-50">
                <div className="h-2.5 w-4/5 bg-slate-700 rounded" />
                <div className="h-2.5 w-2/3 bg-slate-700 rounded" />
              </div>
            </div>
          )}

          {/* Interests */}
          {interests && interests.length > 0 && (
            <div className="border-t border-slate-700/60 pt-4">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Intérêts</h3>
                <SectionEditButton section="languages" label="Loisirs" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white" />
              </div>
              <p className="text-xs text-slate-300">
                {interests.map(i => i.name).join(' • ')}
              </p>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 pt-4 text-center md:text-left">
          Dossier Professionnel Certifié
        </div>
      </div>

      {/* Right Column Main Body */}
      <div className="w-full md:w-2/3 p-6 sm:p-8 space-y-6">
        {/* Executive Header / Summary */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Profil Exécutif & Vision</h2>
            <SectionEditButton section="info" label="Bio" />
          </div>
          {personalInfo.summary ? (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              {personalInfo.summary}
            </p>
          ) : (
            <SkeletonSummaryBox primaryColor={primaryColor} variant="executive" />
          )}
        </div>

        {/* Experience Section */}
        {experiences && experiences.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4 pb-1 border-b">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4" style={{ color: primaryColor }} />
                Expérience Professionnelle & Mandats
              </h2>
              <SectionEditButton section="experiences" label="Expériences" />
            </div>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                    <span className="text-xs font-medium text-slate-500">
                      {exp.startDate} - {exp.isCurrent ? 'En cours' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: primaryColor }}>
                    {exp.company} {exp.location && `| ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-600">{exp.description}</p>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700 pt-1">
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
            <div className="flex items-center justify-between mb-3 pb-1 border-b">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4" style={{ color: primaryColor }} />
                Expérience Professionnelle & Mandats
              </h2>
              <SectionEditButton section="experiences" label="Expériences" />
            </div>
            <SkeletonExperiencesSection primaryColor={primaryColor} variant="executive" />
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" style={{ color: primaryColor }} />
                Formation Supérieure
              </h2>
              <SectionEditButton section="education" label="Formation" />
            </div>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-500 text-[11px]">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="text-slate-600 font-medium">{edu.institution} {edu.location && `• ${edu.location}`}</div>
                  {edu.grade && <div className="text-[11px] text-slate-500 italic">{edu.grade}</div>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
            <div className="flex items-center justify-between mb-2 pb-1 border-b">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" style={{ color: primaryColor }} />
                Formation Supérieure
              </h2>
              <SectionEditButton section="education" label="Formation" />
            </div>
            <SkeletonEducationSection primaryColor={primaryColor} />
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 pb-1 border-b">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: primaryColor }} />
                Accréditations & Titres
              </h2>
              <SectionEditButton section="languages" label="Certifs" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-2 rounded border border-slate-200">
                  <div className="font-bold text-slate-900">{cert.title}</div>
                  <div className="text-[11px] text-slate-500">{cert.issuer} • {cert.issueDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
