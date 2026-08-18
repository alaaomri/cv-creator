import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Save, LogOut, ArrowLeft, Loader2, X } from 'lucide-react';

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onCancel]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs"
        onClick={() => {
          if (!isSaving) onCancel();
        }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with warning icon */}
          <div className="p-5 sm:p-6 pb-4 flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 pr-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                Modifications non enregistrées
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Vous avez des modifications en cours sur votre CV. Si vous quittez sans enregistrer, vos derniers changements seront perdus.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons (Stacked on mobile with >=44px height for great touch ergonomics) */}
          <div className="p-4 sm:p-6 pt-2 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5">
            {/* Save & Proceed */}
            <button
              type="button"
              onClick={onSaveAndProceed}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer et continuer</span>
                </>
              )}
            </button>

            {/* Discard & Proceed */}
            <button
              type="button"
              onClick={onDiscardAndProceed}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Ignorer et quitter sans enregistrer</span>
            </button>

            {/* Cancel / Stay on editor */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2 px-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Rester sur l'éditeur</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
