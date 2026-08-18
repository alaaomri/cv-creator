import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Home, FileText, Layers, Palette, Save, Download, 
  Mail, Globe, Shield, ShieldCheck, ShieldAlert, LogIn, 
  LogOut, Check, Loader2, Lock, Sparkles, ChevronRight, User
} from 'lucide-react';
import { CVData, AuthUser } from '../../types';
import { TEMPLATES_META } from '../../data/sampleCVs';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'home' | 'editor' | 'dashboard' | 'devops';
  onNavigate: (view: 'home' | 'editor' | 'dashboard' | 'devops') => void;
  cvCount: number;
  currentCv: CVData;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onOpenTheme: () => void;
  onOpenShareEmail: () => void;
  onOpenPublish: () => void;
  onExportPDF: () => void;
  isExportingPDF: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  cvCount,
  currentCv,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onOpenTheme,
  onOpenShareEmail,
  onOpenPublish,
  onExportPDF,
  isExportingPDF,
  user,
  isAuthenticated,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTemplateName = TEMPLATES_META.find(t => t.id === currentCv.templateId)?.name || 'Modèle';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-xs md:hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="w-[85%] max-w-sm h-full bg-slate-900 text-slate-100 shadow-2xl flex flex-col border-l border-slate-800 relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Top Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">CV Studio</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Cloud
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* User Session Profile Card */}
            {isAuthenticated && user ? (
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    user.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">{user.fullName}</div>
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    user.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    Rôle : {user.role}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer py-1 px-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Mode Invité • Non connecté</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connectez-vous pour conserver vos CVs sur votre compte et activer la publication en ligne.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('login');
                    }}
                    className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold text-center transition-all cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Se connecter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('register');
                    }}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer min-h-[40px] flex items-center justify-center"
                  >
                    Créer un compte
                  </button>
                </div>
              </div>
            )}

            {/* Primary Section Links */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Navigation Principale
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('home');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  currentView === 'home'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4" />
                  <span>Accueil</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('editor');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  currentView === 'editor'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Éditeur de CV (Studio)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('dashboard');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  currentView === 'dashboard'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Mes CVs & Versions</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                  {cvCount}
                </span>
              </button>

              {user?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 transition-all cursor-pointer min-h-[44px] mt-1"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-rose-400" />
                    <span>Console Administrateur</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              )}
            </div>

            {/* Quick Actions for Current CV */}
            {currentView === 'editor' && (
              <div className="space-y-1 pt-3 border-t border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                  <span>Actions Rapides sur ce CV</span>
                  {hasUnsavedChanges && (
                    <span className="text-amber-400 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Modifié
                    </span>
                  )}
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={() => {
                    onSave();
                    onClose();
                  }}
                  disabled={isSaving}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    hasUnsavedChanges
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                    ) : hasUnsavedChanges ? (
                      <Save className="w-4 h-4 text-white" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{isSaving ? 'Enregistrement...' : hasUnsavedChanges ? 'Enregistrer les modifications' : 'Document à jour'}</span>
                  </div>
                </button>

                {/* Theme & Modèle */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenTheme();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span>Modèle & Design</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate max-w-[120px]">
                    {currentTemplateName}
                  </span>
                </button>

                {/* Download PDF */}
                <button
                  type="button"
                  onClick={() => {
                    onExportPDF();
                    onClose();
                  }}
                  disabled={isExportingPDF}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4" />
                    <span>{isExportingPDF ? 'Export PDF en cours...' : 'Télécharger le PDF A4'}</span>
                  </div>
                </button>

                {/* Publish */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenPublish();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    currentCv.isPublished
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {!isAuthenticated ? <Lock className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
                    <span>{currentCv.isPublished ? 'Page Web Déployée' : 'Déployer sur le Web'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold">
                    {currentCv.isPublished ? 'En ligne' : 'Privé'}
                  </span>
                </button>

                {/* Email Share */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenShareEmail();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-sky-400" />
                    <span>Partager par Email</span>
                  </div>
                </button>
              </div>
            )}

          </div>

          {/* Drawer Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-400">
            <span>CV Studio Cloud • v2.4</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
