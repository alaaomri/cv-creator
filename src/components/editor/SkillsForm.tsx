import React, { useState } from 'react';
import { SkillItem } from '../../types';
import { Plus, Trash2, Cpu, Star } from 'lucide-react';

interface SkillsFormProps {
  skills: SkillItem[];
  onChange: (updated: SkillItem[]) => void;
}

const QUICK_SUGGESTIONS = [
  { name: 'React 19 / TypeScript', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Java 21 / Spring Boot 3', category: 'Backend' },
  { name: 'Microservices & REST API', category: 'Backend' },
  { name: 'PostgreSQL & JPA', category: 'Bases de données' },
  { name: 'Redis Cache', category: 'Bases de données' },
  { name: 'Docker & Podman', category: 'DevOps & Cloud' },
  { name: 'Kubernetes (K8s) & Helm', category: 'DevOps & Cloud' },
  { name: 'CI/CD GitHub Actions', category: 'DevOps & Cloud' },
  { name: 'OAuth2 / JWT Security', category: 'Sécurité' },
  { name: 'Prometheus & Grafana', category: 'Observabilité' },
];

export const SkillsForm: React.FC<SkillsFormProps> = ({
  skills,
  onChange,
}) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Backend');
  const [newSkillLevel, setNewSkillLevel] = useState(5);

  const handleAdd = () => {
    if (!newSkillName.trim()) return;
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      level: newSkillLevel,
      category: newSkillCat,
    };
    onChange([...skills, newSkill]);
    setNewSkillName('');
  };

  const handleQuickAdd = (sug: { name: string; category: string }) => {
    if (skills.some(s => s.name.toLowerCase() === sug.name.toLowerCase())) return;
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}-${Math.random()}`,
      name: sug.name,
      level: 5,
      category: sug.category,
    };
    onChange([...skills, newSkill]);
  };

  const handleUpdate = (index: number, field: keyof SkillItem, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-sky-600" />
          <span>Compétences & Technologies ({skills.length})</span>
        </h3>
      </div>

      {/* Quick Add Bar */}
      <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl space-y-2">
        <span className="text-[11px] font-bold text-sky-900 block">Ajout Rapide de Compétence :</span>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Ex: Spring Security, Kafka, GraphQL"
            className="sm:col-span-6 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
          />
          <select
            value={newSkillCat}
            onChange={(e) => setNewSkillCat(e.target.value)}
            className="sm:col-span-4 text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Bases de données">Bases de données</option>
            <option value="DevOps & Cloud">DevOps & Cloud</option>
            <option value="Sécurité">Sécurité</option>
            <option value="Observabilité">Observabilité</option>
            <option value="Méthodologies">Méthodologies</option>
            <option value="Autres">Autres</option>
          </select>
          <button
            type="button"
            onClick={handleAdd}
            className="sm:col-span-2 flex items-center justify-center gap-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg py-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>

        {/* Quick Suggestions Chips */}
        <div className="pt-1">
          <span className="text-[10px] text-slate-500 block mb-1">Suggestions technologiques :</span>
          <div className="flex flex-wrap gap-1">
            {QUICK_SUGGESTIONS.map((sug, i) => {
              const alreadyAdded = skills.some(s => s.name.toLowerCase() === sug.name.toLowerCase());
              return (
                <button
                  key={i}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => handleQuickAdd(sug)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                    alreadyAdded
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 cursor-pointer shadow-2xs'
                  }`}
                >
                  + {sug.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skills Table List */}
      <div className="space-y-2">
        {skills.map((sk, idx) => (
          <div
            key={sk.id || idx}
            className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 gap-3 text-xs"
          >
            <input
              type="text"
              value={sk.name}
              onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
              className="flex-1 font-semibold text-slate-900 bg-transparent outline-hidden border-b border-transparent focus:border-sky-500"
            />
            <input
              type="text"
              value={sk.category}
              onChange={(e) => handleUpdate(idx, 'category', e.target.value)}
              placeholder="Catégorie"
              className="w-28 text-slate-500 text-[11px] bg-transparent outline-hidden border-b border-transparent focus:border-sky-500"
            />
            {/* Level Selector (1-5) */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleUpdate(idx, 'level', lvl)}
                  className="p-0.5"
                  title={`Niveau ${lvl}/5`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      lvl <= sk.level ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
