import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, AlertCircle, Trash2, CheckCircle2, Info, X, Loader2 } from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  isLoading = false,
  icon,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          defaultIcon: <Trash2 className="w-5 h-5" />,
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20 focus:ring-rose-500',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          defaultIcon: <AlertTriangle className="w-5 h-5" />,
          confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20 focus:ring-amber-500',
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          defaultIcon: <CheckCircle2 className="w-5 h-5" />,
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 focus:ring-emerald-500',
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          defaultIcon: <Info className="w-5 h-5" />,
          confirmBtn: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20 focus:ring-sky-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-slate-900 dark:text-slate-100 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header & Body */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${styles.iconBg}`}>
                  {icon || styles.defaultIcon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-0 sm:pl-1">
              {description}
            </div>
          </div>

          {/* Action Buttons (Mobile-first stacked on small screens or row on tablets) */}
          <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer text-center min-h-[44px] sm:min-h-0 flex items-center justify-center"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer text-center min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 ${styles.confirmBtn} disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Traitement...</span>
                </>
              ) : (
                <span>{confirmLabel}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
