import React, { useState } from 'react';
import { CVListItem, TemplateId } from '../../types';
import { TEMPLATES_META } from '../../data/sampleCVs';
import { 
  FileText, Plus, Copy, Trash2, Globe, Edit3, Eye, Search, 
  CheckCircle2, Clock, Sparkles, Layers, ArrowUpRight, Lock, LogIn, ShieldAlert 
} from 'lucide-react';
import { ConfirmationModal } from '../modals/ConfirmationModal';

interface VersionManagerDashboardProps {
  cvList: CVListItem[];
  currentCvId: string;
  isAuthenticated?: boolean;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onSelectCV: (id: string) => void;
  onCreateNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenStudio: () => void;
}

export const VersionManagerDashboard: React.FC<VersionManagerDashboardProps> = ({
  cvList,
  currentCvId,
  isAuthenticated = false,
  onOpenAuth,
  onSelectCV,
  onCreateNew,
  onDuplicate,
  onDelete,
  onOpenStudio,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'published' | 'draft'>('all');
  const [cvToDelete, setCvToDelete] = useState<CVListItem | null>(null);

  const filteredList = cvList.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.candidateRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.candidateName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'published') return matchesSearch && item.isPublished;
    if (filterType === 'draft') return matchesSearch && !item.isPublished;
    return matchesSearch;
  });

  const getTemplateMeta = (templateId: TemplateId) => {
    return TEMPLATES_META.find(t => t.id === templateId) || TEMPLATES_META[0];
  };

  const handleConfirmDelete = () => {
    if (cvToDelete) {
      onDelete(cvToDelete.id);
      setCvToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
            <Layers className="w-4 h-4" />
            <span>Tableau de Bord Personnel • Multi-Versions</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestionnaire de Documents & Candidatures
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Créez, dupliquez et gérez différentes versions ciblées de vos CV (Fullstack, DevOps, Management, International).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau CV</span>
          </button>
        </div>
      </div>

      {/* Anonymous Guest Banner */}
      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <span>Mode Invité / Anonyme Actif</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/60 text-amber-800 font-semibold">
                  Partage Email & Export PDF autorisés
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed font-medium">
                En mode anonyme, vous ne pouvez pas déployer votre CV sur le Web. <strong className="text-amber-950 font-bold underline decoration-amber-400 decoration-2">Se connecter pour garder le CV et déployer le CV.</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAuth && onOpenAuth('login')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter pour sauvegarder</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre, poste, profil..."
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto">
          {(['all', 'published', 'draft'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterType(mode)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === mode
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode === 'all' && `Tous (${cvList.length})`}
              {mode === 'published' && `Publiés (${cvList.filter(c => c.isPublished).length})`}
              {mode === 'draft' && `Brouillons (${cvList.filter(c => !c.isPublished).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of CV Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((cv) => {
          const tmpl = getTemplateMeta(cv.templateId);
          const isSelected = cv.id === currentCvId;

          return (
            <div
              key={cv.id}
              className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative ${
                isSelected
                  ? 'border-sky-600 ring-2 ring-sky-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Card top banner color */}
              <div 
                className="h-2 w-full" 
                style={{ backgroundColor: tmpl.previewColor || '#0284c7' }} 
              />

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {tmpl.name}
                    </span>
                    {cv.isPublished ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Publié sur le Web
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                        Brouillon privé
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-0.5">
                    {cv.title}
                  </h3>
                  <p className="text-xs text-sky-700 font-medium line-clamp-1">
                    {cv.candidateRole}
                  </p>

                  <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Modifié le {new Date(cv.updatedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {cv.isPublished && (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <Eye className="w-3 h-3" />
                        <span>{cv.viewCount || 0} consultations du lien dédié</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onSelectCV(cv.id);
                      onOpenStudio();
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Éditer</span>
                  </button>

                  <button
                    onClick={() => onDuplicate(cv.id)}
                    title="Dupliquer / Cloner cette version"
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {cv.isPublished && (
                    <a
                      href={`/?p=${cv.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Ouvrir la page web publique"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {cvList.length > 1 && (
                    <button
                      onClick={() => setCvToDelete(cv)}
                      title="Supprimer cette version"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for deleting CV version */}
      <ConfirmationModal
        isOpen={Boolean(cvToDelete)}
        onClose={() => setCvToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer cette version du CV ?"
        description={
          cvToDelete ? (
            <div className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir supprimer définitivement le document <strong className="text-slate-900 dark:text-white font-bold">« {cvToDelete.title} »</strong> ({cvToDelete.candidateRole}) ?
              </p>
              {cvToDelete.isPublished && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs">
                  ⚠️ Ce CV est actuellement déployé en ligne. Sa page web publique deviendra inaccessible.
                </div>
              )}
            </div>
          ) : ''
        }
        confirmLabel="Supprimer définitivement"
        cancelLabel="Conserver le CV"
        variant="danger"
      />
    </div>
  );
};
