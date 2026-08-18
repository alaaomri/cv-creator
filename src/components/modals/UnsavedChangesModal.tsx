import React from 'react';
import { AlertTriangle, Save, LogOut, ArrowLeft } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSaveAndProceed: () => void;
  onDiscardAndProceed: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSaveAndProceed,
  onDiscardAndProceed,
  onCancel,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Modifications non enregistrées
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Vous avez des modifications en cours sur votre CV. Si vous quittez sans enregistrer, vos derniers changements seront perdus.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-6 pt-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5">
          {/* Save & Proceed */}
          <button
            type="button"
            onClick={onSaveAndProceed}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer et continuer'}</span>
          </button>

          {/* Discard & Proceed */}
          <button
            type="button"
            onClick={onDiscardAndProceed}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Ignorer et quitter sans enregistrer</span>
          </button>

          {/* Cancel / Stay on editor */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Rester sur l'éditeur</span>
          </button>
        </div>
      </div>
    </div>
  );
};
