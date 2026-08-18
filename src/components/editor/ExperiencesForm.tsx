import React from 'react';
import { ExperienceItem } from '../../types';
import { Plus, Trash2, ChevronUp, ChevronDown, Briefcase, Calendar } from 'lucide-react';

interface ExperiencesFormProps {
  experiences: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
}

export const ExperiencesForm: React.FC<ExperiencesFormProps> = ({
  experiences,
  onChange,
}) => {
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      bullets: [''],
    };
    onChange([newExp, ...experiences]);
  };

  const handleUpdate = (index: number, field: keyof ExperienceItem, value: any) => {
    const updated = [...experiences];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;
    const updated = [...experiences];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  const handleBulletChange = (expIndex: number, bulletIndex: number, text: string) => {
    const updated = [...experiences];
    const bullets = [...(updated[expIndex].bullets || [])];
    bullets[bulletIndex] = text;
    updated[expIndex].bullets = bullets;
    onChange(updated);
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = [...experiences];
    const bullets = [...(updated[expIndex].bullets || [])];
    bullets.push('');
    updated[expIndex].bullets = bullets;
    onChange(updated);
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...experiences];
    const bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    updated[expIndex].bullets = bullets;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-sky-600" />
          <span>Expériences Professionnelles ({experiences.length})</span>
        </h3>
        <button
          type="button"
          onClick={handleAddExperience}
          className="flex items-center gap-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter une expérience</span>
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500 mb-2">Aucune expérience renseignée pour le moment.</p>
          <button
            type="button"
            onClick={handleAddExperience}
            className="text-xs font-bold text-sky-600 hover:underline"
          >
            + Ajouter votre première expérience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, expIdx) => (
            <div
              key={exp.id || expIdx}
              className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 relative group"
            >
              {/* Header card actions */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  #{expIdx + 1} {exp.role ? `— ${exp.role}` : 'Nouvelle Expérience'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={expIdx === 0}
                    onClick={() => handleMove(expIdx, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                    title="Monter"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={expIdx === experiences.length - 1}
                    onClick={() => handleMove(expIdx, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                    title="Descendre"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(expIdx)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors ml-1"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Role & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Intitulé du Poste *
                  </label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => handleUpdate(expIdx, 'role', e.target.value)}
                    placeholder="Ex: Senior Fullstack Engineer"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Entreprise / Client *
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleUpdate(expIdx, 'company', e.target.value)}
                    placeholder="Ex: TechScale Solutions"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Dates & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date Début
                  </label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => handleUpdate(expIdx, 'startDate', e.target.value)}
                    placeholder="Ex: 2022-03 ou Mars 2022"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date Fin
                  </label>
                  <input
                    type="text"
                    disabled={exp.isCurrent}
                    value={exp.isCurrent ? 'Présent' : exp.endDate}
                    onChange={(e) => handleUpdate(expIdx, 'endDate', e.target.value)}
                    placeholder="Ex: 2024-05"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => handleUpdate(expIdx, 'location', e.target.value)}
                    placeholder="Ex: Paris, France"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`isCurrent-${expIdx}`}
                  checked={exp.isCurrent}
                  onChange={(e) => handleUpdate(expIdx, 'isCurrent', e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor={`isCurrent-${expIdx}`} className="text-xs text-slate-700 cursor-pointer">
                  Poste actuel (en cours)
                </label>
              </div>

              {/* Description & Bullet points */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Description succincte / Contexte
                </label>
                <input
                  type="text"
                  value={exp.description}
                  onChange={(e) => handleUpdate(expIdx, 'description', e.target.value)}
                  placeholder="Ex: Direction technique sur la refonte de la plateforme de facturation..."
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white mb-2"
                />
              </div>

              {/* Bullets List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Réalisations clés & Chiffres d'impact (Puces)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddBullet(expIdx)}
                    className="text-[11px] text-sky-600 font-bold hover:underline"
                  >
                    + Ajouter une puce
                  </button>
                </div>
                <div className="space-y-2">
                  {(exp.bullets || []).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-bold">•</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(expIdx, bIdx, e.target.value)}
                        placeholder="Ex: Migration vers microservices Spring Boot / React réduisant la latence de 40%."
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(expIdx, bIdx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Supprimer la puce"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
