import React from 'react';
import { EducationItem } from '../../types';
import { Plus, Trash2, GraduationCap, ChevronUp, ChevronDown } from 'lucide-react';

interface EducationFormProps {
  education: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  education,
  onChange,
}) => {
  const handleAdd = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: '',
      field: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: '',
    };
    onChange([newEdu, ...education]);
  };

  const handleUpdate = (index: number, field: keyof EducationItem, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= education.length) return;
    const updated = [...education];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-sky-600" />
          <span>Formations & Diplômes ({education.length})</span>
        </h3>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter une formation</span>
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500 mb-2">Aucune formation ajoutée.</p>
          <button
            type="button"
            onClick={handleAdd}
            className="text-xs font-bold text-sky-600 hover:underline"
          >
            + Ajouter un diplôme ou cursus
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu, idx) => (
            <div
              key={edu.id || idx}
              className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  #{idx + 1} {edu.degree ? `— ${edu.degree}` : 'Nouveau Diplôme'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === education.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Diplôme / Titre *
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdate(idx, 'degree', e.target.value)}
                    placeholder="Ex: Master en Génie Logiciel"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Établissement / Université *
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleUpdate(idx, 'institution', e.target.value)}
                    placeholder="Ex: INSA Lyon"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Dates (Début - Fin)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => handleUpdate(idx, 'startDate', e.target.value)}
                      placeholder="2014"
                      className="w-1/2 text-xs px-2 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    />
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => handleUpdate(idx, 'endDate', e.target.value)}
                      placeholder="2017"
                      className="w-1/2 text-xs px-2 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => handleUpdate(idx, 'location', e.target.value)}
                    placeholder="Lyon, France"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mention / Résultat
                  </label>
                  <input
                    type="text"
                    value={edu.grade || ''}
                    onChange={(e) => handleUpdate(idx, 'grade', e.target.value)}
                    placeholder="Mention Très Bien"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
