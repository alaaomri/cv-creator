import React from 'react';
import { LanguageItem, CertificationItem, InterestItem } from '../../types';
import { Plus, Trash2, Globe2, Award, Heart } from 'lucide-react';

interface LanguagesAndCertsFormProps {
  languages: LanguageItem[];
  certifications: CertificationItem[];
  interests: InterestItem[];
  onLanguagesChange: (updated: LanguageItem[]) => void;
  onCertificationsChange: (updated: CertificationItem[]) => void;
  onInterestsChange: (updated: InterestItem[]) => void;
}

export const LanguagesAndCertsForm: React.FC<LanguagesAndCertsFormProps> = ({
  languages,
  certifications,
  interests,
  onLanguagesChange,
  onCertificationsChange,
  onInterestsChange,
}) => {
  // Languages Handlers
  const handleAddLanguage = () => {
    onLanguagesChange([...languages, { id: `lang-${Date.now()}`, name: '', proficiency: 'Courant' }]);
  };

  const handleUpdateLanguage = (index: number, field: keyof LanguageItem, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    onLanguagesChange(updated);
  };

  const handleRemoveLanguage = (index: number) => {
    onLanguagesChange(languages.filter((_, i) => i !== index));
  };

  // Certifications Handlers
  const handleAddCert = () => {
    onCertificationsChange([
      ...certifications,
      { id: `cert-${Date.now()}`, title: '', issuer: '', issueDate: '' },
    ]);
  };

  const handleUpdateCert = (index: number, field: keyof CertificationItem, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    onCertificationsChange(updated);
  };

  const handleRemoveCert = (index: number) => {
    onCertificationsChange(certifications.filter((_, i) => i !== index));
  };

  // Interests Handlers
  const handleAddInterest = () => {
    onInterestsChange([...interests, { id: `int-${Date.now()}`, name: '' }]);
  };

  const handleUpdateInterest = (index: number, value: string) => {
    const updated = [...interests];
    updated[index] = { ...updated[index], name: value };
    onInterestsChange(updated);
  };

  const handleRemoveInterest = (index: number) => {
    onInterestsChange(interests.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Languages Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-sky-600" />
            <span>Langues ({languages.length})</span>
          </h3>
          <button
            type="button"
            onClick={handleAddLanguage}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une langue</span>
          </button>
        </div>

        <div className="space-y-2">
          {languages.map((lang, idx) => (
            <div key={lang.id || idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="text"
                value={lang.name}
                onChange={(e) => handleUpdateLanguage(idx, 'name', e.target.value)}
                placeholder="Ex: Français, Anglais, Espagnol"
                className="flex-1 text-xs px-2.5 py-1 rounded border border-slate-300 bg-white"
              />
              <select
                value={lang.proficiency}
                onChange={(e) => handleUpdateLanguage(idx, 'proficiency', e.target.value)}
                className="text-xs px-2 py-1 rounded border border-slate-300 bg-white"
              >
                <option value="Langue maternelle">Langue maternelle</option>
                <option value="Bilingue">Bilingue</option>
                <option value="Courant (C1/C2)">Courant (C1/C2)</option>
                <option value="Professionnel (B2)">Professionnel (B2)</option>
                <option value="Intermédiaire (B1)">Intermédiaire (B1)</option>
                <option value="Notions élémentaires">Notions élémentaires</option>
              </select>
              <button
                type="button"
                onClick={() => handleRemoveLanguage(idx)}
                className="p-1 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-sky-600" />
            <span>Certifications & Accréditations ({certifications.length})</span>
          </h3>
          <button
            type="button"
            onClick={handleAddCert}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une certif</span>
          </button>
        </div>

        <div className="space-y-2">
          {certifications.map((cert, idx) => (
            <div key={cert.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="text"
                value={cert.title}
                onChange={(e) => handleUpdateCert(idx, 'title', e.target.value)}
                placeholder="Titre certif (ex: AWS Solutions Architect)"
                className="sm:col-span-5 text-xs px-2 py-1 rounded border border-slate-300 bg-white"
              />
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) => handleUpdateCert(idx, 'issuer', e.target.value)}
                placeholder="Organisme (ex: Amazon, CNCF)"
                className="sm:col-span-4 text-xs px-2 py-1 rounded border border-slate-300 bg-white"
              />
              <input
                type="text"
                value={cert.issueDate}
                onChange={(e) => handleUpdateCert(idx, 'issueDate', e.target.value)}
                placeholder="Date (2023)"
                className="sm:col-span-2 text-xs px-2 py-1 rounded border border-slate-300 bg-white"
              />
              <div className="sm:col-span-1 flex justify-end items-center">
                <button
                  type="button"
                  onClick={() => handleRemoveCert(idx)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interests Section */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Centres d'intérêt ({interests.length})</span>
          </h3>
          <button
            type="button"
            onClick={handleAddInterest}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {interests.map((int, idx) => (
            <div key={int.id || idx} className="flex items-center gap-1 bg-slate-100 pl-2.5 pr-1 py-1 rounded-lg border border-slate-200">
              <input
                type="text"
                value={int.name}
                onChange={(e) => handleUpdateInterest(idx, e.target.value)}
                placeholder="Ex: Open Source, Trail, Piano"
                className="text-xs bg-transparent outline-hidden w-28 text-slate-800"
              />
              <button
                type="button"
                onClick={() => handleRemoveInterest(idx)}
                className="p-1 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
