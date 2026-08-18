import React from 'react';
import { ProjectItem } from '../../types';
import { Plus, Trash2, FolderGit2, Link as LinkIcon, Github } from 'lucide-react';

interface ProjectsFormProps {
  projects: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export const ProjectsForm: React.FC<ProjectsFormProps> = ({
  projects,
  onChange,
}) => {
  const handleAdd = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: '',
      role: '',
      link: '',
      github: '',
      description: '',
      technologies: ['React', 'Spring Boot'],
    };
    onChange([...projects, newProj]);
  };

  const handleUpdate = (index: number, field: keyof ProjectItem, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleTechChange = (index: number, rawString: string) => {
    const techs = rawString.split(',').map(s => s.trim()).filter(Boolean);
    handleUpdate(index, 'technologies', techs);
  };

  const handleRemove = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FolderGit2 className="w-4 h-4 text-sky-600" />
          <span>Projets & Réalisations ({projects.length})</span>
        </h3>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter un projet</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500 mb-2">Aucun projet ajouté.</p>
          <button
            type="button"
            onClick={handleAdd}
            className="text-xs font-bold text-sky-600 hover:underline"
          >
            + Ajouter un projet ou repository
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((proj, idx) => (
            <div
              key={proj.id || idx}
              className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  #{idx + 1} {proj.title ? `— ${proj.title}` : 'Nouveau Projet'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nom du Projet *
                  </label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                    placeholder="Ex: CloudPulse Monitoring"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Votre Rôle
                  </label>
                  <input
                    type="text"
                    value={proj.role}
                    onChange={(e) => handleUpdate(idx, 'role', e.target.value)}
                    placeholder="Ex: Lead Architect & Créateur"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lien Démo / Site Web
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                    <input
                      type="url"
                      value={proj.link}
                      onChange={(e) => handleUpdate(idx, 'link', e.target.value)}
                      placeholder="https://projet-demo.com"
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lien GitHub / Repo
                  </label>
                  <div className="relative">
                    <Github className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                    <input
                      type="url"
                      value={proj.github}
                      onChange={(e) => handleUpdate(idx, 'github', e.target.value)}
                      placeholder="https://github.com/pseudo/projet"
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Description & Impact
                </label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                  placeholder="Ex: Système d'observabilité temps réel ingérant les métriques Prometheus et les logs OpenTelemetry..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Technologies utilisées (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={(proj.technologies || []).join(', ')}
                  onChange={(e) => handleTechChange(idx, e.target.value)}
                  placeholder="React, Spring Boot, Redis, Docker, PostgreSQL"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
