import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, Mail, User, ShieldCheck, ShieldAlert, 
  CheckCircle2, ArrowRight, KeyRound, AtSign, Loader2, 
  AlertCircle, Eye, EyeOff, LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  requiredRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  requiredRole,
}) => {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState<boolean>(initialMode === 'login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    error?: string;
  }>({ checking: false });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoginMode(initialMode === 'login');
      setError(null);
      setSuccessMessage(null);
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialMode]);

  // Real-time debounced username validation effect
  useEffect(() => {
    if (isLoginMode || !username.trim()) {
      setUsernameStatus({ checking: false });
      return;
    }

    const clean = username.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,30}$/.test(clean)) {
      setUsernameStatus({
        checking: false,
        available: false,
        error: '3 à 30 caractères (lettres minuscules, chiffres, tirets)',
      });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({ checking: false, available: true });
        } else {
          setUsernameStatus({ 
            checking: false, 
            available: false, 
            error: data.error || 'Cet identifiant est déjà utilisé' 
          });
        }
      } catch (err) {
        setUsernameStatus({ checking: false, available: false, error: 'Erreur lors de la vérification' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, isLoginMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isLoginMode) {
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (usernameStatus.available === false) {
        setError(usernameStatus.error || 'Veuillez choisir un nom d\'utilisateur valide et disponible.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        const res = await login(email.trim(), password);
        if (res.success) {
          setSuccessMessage('Connexion réussie ! Redirection en cours...');
          setTimeout(() => {
            onClose();
          }, 500);
        } else {
          setError(res.error || 'Identifiants invalides');
        }
      } else {
        const res = await register(
          email.trim(), 
          password, 
          fullName.trim(), 
          username.trim().toLowerCase()
        );
        if (res.success) {
          setSuccessMessage('Compte créé avec succès ! Bienvenue sur CV Studio Cloud.');
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setError(res.error || 'Erreur lors de la création de votre compte');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur réseau est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="auth-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
      >
        <motion.div
          id="auth-modal-container"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-100 relative"
        >
          {/* Subtle Top Accent Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${
                requiredRole === 'ADMIN' 
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              }`}>
                {requiredRole === 'ADMIN' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : isLoginMode ? (
                  <LogIn className="w-5 h-5" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {requiredRole === 'ADMIN' 
                    ? 'Accès Administrateur' 
                    : isLoginMode ? 'Espace Candidat & Éditeur' : 'Créer un Compte'}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Session sécurisée JWT & Protection des données</span>
                </p>
              </div>
            </div>
            <button
              id="auth-modal-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                id="auth-tab-login"
                onClick={() => {
                  setIsLoginMode(true);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isLoginMode 
                    ? 'bg-sky-600 text-white shadow-sm font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Se Connecter</span>
              </button>
              <button
                type="button"
                id="auth-tab-register"
                onClick={() => {
                  setIsLoginMode(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !isLoginMode 
                    ? 'bg-sky-600 text-white shadow-sm font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Créer un Compte</span>
              </button>
            </div>

            {/* Error or Success Alerts */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="leading-tight">{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-tight">{successMessage}</span>
              </motion.div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nom complet & Prénom
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        id="auth-register-fullname"
                        required
                        placeholder="Ex. Jean Dupont"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Public Username */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Identifiant unique (Username)
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        URL: /?p={username.trim().toLowerCase() || 'identifiant'}
                      </span>
                    </div>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        id="auth-register-username"
                        required
                        placeholder="ex. alexandre-dubois"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                          usernameStatus.available === true
                            ? 'border-emerald-600 focus:border-emerald-500 focus:ring-emerald-500'
                            : usernameStatus.available === false
                            ? 'border-rose-600 focus:border-rose-500 focus:ring-rose-500'
                            : 'border-slate-800 focus:border-sky-500 focus:ring-sky-500'
                        }`}
                      />
                      <div className="absolute right-3.5 top-3">
                        {usernameStatus.checking && (
                          <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                        )}
                        {!usernameStatus.checking && usernameStatus.available === true && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        {!usernameStatus.checking && usernameStatus.available === false && (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    </div>
                    {usernameStatus.error && (
                      <p className="text-[11px] text-rose-400 mt-1">{usernameStatus.error}</p>
                    )}
                    {!usernameStatus.error && usernameStatus.available === true && (
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Identifiant disponible pour votre page web CV</span>
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    id="auth-input-email"
                    required
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Mot de Passe
                  </label>
                  {!isLoginMode && (
                    <span className="text-[10px] text-slate-400">Min. 6 caractères</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-input-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Register mode only) */}
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirmer le Mot de Passe
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="auth-input-confirm-password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-rose-600 focus:border-rose-500 focus:ring-rose-500'
                          : confirmPassword && confirmPassword === password
                          ? 'border-emerald-600 focus:border-emerald-500 focus:ring-emerald-500'
                          : 'border-slate-800 focus:border-sky-500 focus:ring-sky-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[11px] text-rose-400 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="auth-submit-btn"
                disabled={isSubmitting || (!isLoginMode && usernameStatus.available === false)}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>{isLoginMode ? 'Se Connecter' : 'Créer mon compte'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Admin Demo Autofill Helper */}
              {isLoginMode && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@cvstudio.cloud');
                      setPassword('AdminSecret2026!');
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-amber-400 font-medium transition-colors bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg px-2.5 py-1 cursor-pointer"
                    title="Remplir automatiquement avec les identifiants administrateur de test"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Remplir avec le compte Administrateur</span>
                  </button>
                </div>
              )}
            </form>

            {/* Mode Switcher Footer */}
            <div className="pt-3 text-center text-xs text-slate-400 border-t border-slate-800 flex items-center justify-between">
              <span>
                {isLoginMode ? 'Pas encore de compte ?' : 'Vous possédez déjà un compte ?'}
              </span>
              <button
                type="button"
                id="auth-switch-mode-btn"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer"
              >
                {isLoginMode ? 'Créer un compte' : 'Se connecter'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
