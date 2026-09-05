import React from 'react';
import { CVData, SkillItem, ThemeConfig, PersonalInfo } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Code, Terminal, GitBranch, Server, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { SectionEditButton } from '../../context/PreviewEditContext';
import { ProtectedContactItem } from '../common/ProtectedContactItem';
import { CVAvatar } from './CVAvatar';
import { 
  SkeletonContactBar, 
  SkeletonSummaryBox, 
  SkeletonExperiencesSection, 
  SkeletonEducationSection, 
  SkeletonSkillsSection, 
  SkeletonProjectsSection,
  SkeletonLanguagesSection
} from './TemplateSkeletonPlaceholders';

interface TemplateProps {
  data: CVData;
}

export const TechDeveloperTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme: Partial<ThemeConfig> = data?.theme || {};
  const personalInfo: Partial<PersonalInfo> = data?.personalInfo || {};
  const experiences = data?.experiences || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const languages = data?.languages || [];
  const projects = data?.projects || [];
  const certifications = data?.certifications || [];
  const interests = data?.interests || [];
  const primaryColor = theme.primaryColor || '#10b981';
  const secondaryColor = theme.secondaryColor || '#0f172a';

  // Group skills by category
  const skillsByCategory: Record<string, SkillItem[]> = {};
  (skills || []).forEach((curr) => {
    const cat = curr.category || 'Stack Technique';
    if (!skillsByCategory[cat]) {
      skillsByCategory[cat] = [];
    }
    skillsByCategory[cat].push(curr);
  });

  const hasAnyContact = Boolean(
    personalInfo.email || personalInfo.phone || personalInfo.location || 
    personalInfo.website || personalInfo.linkedin || personalInfo.github
  );

  return (
    <div 
      className="w-full bg-white text-slate-800 p-8 sm:p-10 shadow-sm leading-relaxed relative"
      style={{ fontFamily: theme.fontBody || 'Inter, sans-serif' }}
    >
      {/* Tech Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2" style={{ borderColor: `${primaryColor}30` }}>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide uppercase" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
              <Terminal className="w-3 h-3" />
              <span>Developer Profile // v2.4</span>
            </div>
            <SectionEditButton section="info" label="Profil" />
          </div>
          <h1 
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-1 ${
              !personalInfo.fullName ? 'text-slate-400 italic' : 'text-slate-950'
            }`} 
            style={{ fontFamily: theme.fontHeading || 'Inter, sans-serif' }}
          >
            {personalInfo.fullName || 'Développeur Fullstack'}
          </h1>
          <p 
            className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
              !personalInfo.jobTitle ? 'opacity-70 italic' : ''
            }`} 
            style={{ color: primaryColor }}
          >
            <Code className="w-4 h-4 shrink-0" />
            {personalInfo.jobTitle || 'Lead Software Engineer / Architecte'}
          </p>

          {/* Links & Contacts */}
          {hasAnyContact ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 font-mono">
              {personalInfo.email && (
                <ProtectedContactItem type="email" value={personalInfo.email} iconColor={primaryColor} />
              )}
              {personalInfo.phone && (
                <ProtectedContactItem type="phone" value={personalInfo.phone} iconColor={primaryColor} />
              )}
              {personalInfo.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{personalInfo.location}</span>
                </span>
              )}
              {personalInfo.github && (
                <span className="flex items-center gap-1 text-slate-900 font-bold">
                  <Github className="w-3.5 h-3.5 shrink-0" />
                  <span className="break-all">{personalInfo.github.replace(/^https?:\/\//, '')}</span>
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="flex items-center gap-1 text-sky-700">
                  <Linkedin className="w-3.5 h-3.5 shrink-0" />
                  <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                </span>
              )}
              {personalInfo.website && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
                </span>
              )}
            </div>
          ) : (
            <SkeletonContactBar primaryColor={primaryColor} />
          )}
        </div>

        <CVAvatar
          avatarUrl={personalInfo.avatarUrl}
          objectPosition={personalInfo.avatarPosition}
          zoom={personalInfo.avatarZoom}
          fullName={personalInfo.fullName}
          primaryColor={primaryColor}
          shape={theme.photoShape || 'round'}
          showPhoto={theme.showPhoto !== false}
          withStatusBadge={true}
        />
      </div>

      {/* Tech Statement / Summary */}
      {personalInfo.summary ? (
        <div className="my-5 p-3.5 bg-slate-900 text-slate-200 rounded-lg text-xs sm:text-sm font-mono leading-relaxed border-l-4" style={{ borderColor: primaryColor }}>
          <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400">$</span> cat summary.txt
            </div>
            <SectionEditButton section="info" label="Bio" className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white" />
          </div>
          {personalInfo.summary}
        </div>
      ) : (
        <SkeletonSummaryBox primaryColor={primaryColor} variant="tech" />
      )}

      {/* Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Left Column (7 cols): Experiences & Projects */}
        <div className="lg:col-span-8 space-y-6">
          {/* Experiences */}
          {experiences && experiences.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Parcours Technique & Réalisations
                  </h2>
                </div>
                <SectionEditButton section="experiences" label="Expériences" />
              </div>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-3.5 border-l-2 border-slate-200 hover:border-slate-400 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-0.5">
                      <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {exp.startDate} → {exp.isCurrent ? 'Présent' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-semibold mb-1" style={{ color: primaryColor }}>
                      {exp.company} {exp.location && `// ${exp.location}`}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 mb-2">{exp.description}</p>
                    )}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="space-y-1 text-xs text-slate-700">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[11px] font-mono mt-0.5" style={{ color: primaryColor }}>›</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Parcours Technique & Réalisations
                  </h2>
                </div>
                <SectionEditButton section="experiences" label="Expériences" />
              </div>
              <SkeletonExperiencesSection primaryColor={primaryColor} variant="tech" />
            </div>
          )}

          {/* Projects / Repos */}
          {projects && projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Projets & Architecture Open-Source
                  </h2>
                </div>
                <SectionEditButton section="projects" label="Projets" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                        {proj.github && (
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5">
                            <Github className="w-2.5 h-2.5" /> code
                          </span>
                        )}
                      </div>
                      {proj.role && <div className="text-[10px] text-slate-500 font-mono mb-1">{proj.role}</div>}
                      <p className="text-xs text-slate-600 mb-2 line-clamp-3">{proj.description}</p>
                    </div>
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-200/70 text-slate-800">
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

        {/* Right Column (5 cols): Tech Stack, Education, Certs, Languages */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tech Stack Grouped */}
          {skills && skills.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Stack Technique
                  </h2>
                </div>
                <SectionEditButton section="skills" label="Compétences" />
              </div>
              <div className="space-y-3">
                {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                  <div key={category}>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                      {category}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {catSkills.map(sk => (
                        <span 
                          key={sk.id}
                          className="text-xs px-2 py-0.5 rounded font-mono font-medium border bg-white text-slate-800"
                          style={{ borderColor: `${primaryColor}40` }}
                        >
                          {sk.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Stack Technique
                  </h2>
                </div>
                <SectionEditButton section="skills" label="Compétences" />
              </div>
              <SkeletonSkillsSection primaryColor={primaryColor} variant="tech" />
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Formation & Diplômes
                  </h2>
                </div>
                <SectionEditButton section="education" label="Formation" />
              </div>
              <div className="space-y-3">
                {education.map(edu => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600 font-medium">{edu.institution}</div>
                    <div className="text-[11px] font-mono text-slate-500">{edu.startDate} - {edu.endDate} {edu.grade && `// ${edu.grade}`}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Formation & Diplômes
                  </h2>
                </div>
                <SectionEditButton section="education" label="Formation" />
              </div>
              <SkeletonEducationSection primaryColor={primaryColor} />
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Certifications Cloud & IT
                  </h2>
                </div>
                <SectionEditButton section="languages" label="Certifs" />
              </div>
              <div className="space-y-2">
                {certifications.map(cert => (
                  <div key={cert.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{cert.title}</div>
                    <div className="text-[11px] font-mono text-slate-500">{cert.issuer} • {cert.issueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                  Langues
                </h2>
                <SectionEditButton section="languages" label="Langues" />
              </div>
              <div className="space-y-1">
                {languages.map(lang => (
                  <div key={lang.id} className="flex justify-between text-xs font-mono">
                    <span className="font-medium text-slate-800">{lang.name}</span>
                    <span className="text-slate-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="cv-edit-only no-print" data-no-print="true" data-export-ignore="true">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
                  Langues
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
