import React, { useState, useEffect } from 'react';
import { 
  Globe, Check, Copy, ExternalLink, QrCode, X, Eye, Sparkles, 
  Shield, ShieldAlert, ShieldCheck, ToggleLeft, ToggleRight, 
  Lock, KeyRound, Clock, EyeOff, UserPlus, LogIn, FileDown, Mail, AlertTriangle, ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CVSecurityConfig } from '../../types';

interface WebPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvId: string;
  slug: string;
  isPublished: boolean;
  viewCount: number;
  publishedAt?: string;
  securityConfig?: CVSecurityConfig;
  isAuthenticated?: boolean;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onTogglePublish: (isPublished: boolean, newSlug?: string, securityConfig?: CVSecurityConfig, pinCode?: string) => Promise<void>;
}

export const WebPublishModal: React.FC<WebPublishModalProps> = ({
  isOpen,
  onClose,
  cvId,
  slug,
  isPublished,
  viewCount,
  publishedAt,
  securityConfig,
  isAuthenticated = false,
  onOpenAuth,
  onTogglePublish,
}) => {
  const [customSlug, setCustomSlug] = useState(slug || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Security controls state
  const [isProtected, setIsProtected] = useState<boolean>(securityConfig?.isProtected || false);
  const [pinCode, setPinCode] = useState<string>('');
  const [pinHint, setPinHint] = useState<string>(securityConfig?.pinHint || '');
  const [maskContactInfo, setMaskContactInfo] = useState<boolean>(securityConfig?.maskContactInfo ?? true);
  const [expirationOption, setExpirationOption] = useState<string>('unlimited');
  const [showSecuritySection, setShowSecuritySection] = useState<boolean>(true);

  useEffect(() => {
    setCustomSlug(slug || '');
    setIsProtected(securityConfig?.isProtected || false);
    setPinHint(securityConfig?.pinHint || '');
    setMaskContactInfo(securityConfig?.maskContactInfo ?? true);
    if (securityConfig?.expiresAt) {
      const expDate = new Date(securityConfig.expiresAt).getTime();
      const now = Date.now();
      const diffDays = Math.round((expDate - now) / (1000 * 3600 * 24));
      if (diffDays <= 8) setExpirationOption('7d');
      else if (diffDays <= 32) setExpirationOption('30d');
      else setExpirationOption('90d');
    } else {
      setExpirationOption('unlimited');
    }
  }, [slug, securityConfig, isOpen]);

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/?p=${customSlug || slug}`;

  const calculateExpiresAt = (): string | undefined => {
    if (expirationOption === 'unlimited') return undefined;
    const now = new Date();
    if (expirationOption === '7d') now.setDate(now.getDate() + 7);
    if (expirationOption === '30d') now.setDate(now.getDate() + 30);
    if (expirationOption === '90d') now.setDate(now.getDate() + 90);
    return now.toISOString();
  };

  const handleToggle = async (targetState: boolean) => {
    if (!isAuthenticated) {
      if (onOpenAuth) {
        onClose();
        onOpenAuth('login');
      }
      return;
    }

    if (targetState && isProtected && !pinCode && !securityConfig?.hasPassword) {
      alert('Veuillez définir un code PIN ou mot de passe secret pour activer la protection.');
      return;
    }

    setIsUpdating(true);
    try {
      const secPayload: CVSecurityConfig = {
        isProtected,
        hasPassword: Boolean(isProtected && (pinCode || securityConfig?.hasPassword)),
        maskContactInfo,
        pinHint: isProtected ? pinHint : undefined,
        expiresAt: calculateExpiresAt(),
      };

      await onTogglePublish(targetState, customSlug, secPayload, isProtected && pinCode ? pinCode : undefined);
      if (targetState) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    if (!isPublished) return;
    if (isProtected && !pinCode && !securityConfig?.hasPassword) {
      alert('Veuillez définir un code PIN ou mot de passe secret.');
      return;
    }

    setIsUpdating(true);
    try {
      const secPayload: CVSecurityConfig = {
        isProtected,
        hasPassword: Boolean(isProtected && (pinCode || securityConfig?.hasPassword)),
        maskContactInfo,
        pinHint: isProtected ? pinHint : undefined,
        expiresAt: calculateExpiresAt(),
      };
      await onTogglePublish(true, customSlug, secPayload, isProtected && pinCode ? pinCode : undefined);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between transition-colors ${
          !isAuthenticated 
            ? 'bg-linear-to-r from-amber-600 via-amber-700 to-orange-700' 
            : isProtected 
              ? 'bg-linear-to-r from-indigo-700 via-purple-700 to-slate-900'
              : 'bg-linear-to-r from-emerald-600 to-teal-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl">
              {!isAuthenticated ? (
                <Lock className="w-5 h-5" />
              ) : isProtected ? (
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              ) : (
                <Globe className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">
                  {!isAuthenticated 
                    ? 'Déploiement Web • Mode Anonyme' 
                    : isProtected
                      ? 'Déploiement Sécurisé & Anti-Scraping'
                      : 'Déploiement de Page Web Dédiée'}
                </h2>
                {isAuthenticated && isProtected && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-400/20 text-amber-200 border border-amber-300/40 px-2 py-0.5 rounded-full">
                    Bouclier Actif
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80">
                {!isAuthenticated 
                  ? 'Connexion requise pour réserver une URL publique et protéger vos données' 
                  : 'Publication en ligne avec contrôles de confidentialité et protection anti-moissonnage'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* ANONYMOUS GUEST STATE */}
          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Le déploiement web public nécessite un compte</span>
                </div>
                
                <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                  En mode invité, vous ne pouvez pas déployer votre CV sur le Web. Seuls le <strong>partage par email</strong> et les <strong>exports (PDF & JSON)</strong> sont disponibles sans compte.
                </p>

                <div className="p-3 rounded-lg bg-white/80 border border-amber-200 text-amber-950 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Vos données actuelles sont conservées localement</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Toutes vos saisies sont stockées dans votre navigateur (<code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">localStorage</code>). Dès votre connexion, votre CV sera synchronisé sur le Cloud sans perte de données.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-200/80 border border-amber-300 text-amber-950 font-bold text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Se connecter pour garder le CV et déployer avec protection anti-scraping</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth('login');
                  }}
                  className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter & Déployer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth('register');
                  }}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Créer un Compte Gratuit</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Actions disponibles sans compte :
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-slate-200 text-[11px] font-medium">
                    <FileDown className="w-3 h-3 text-sky-600" /> Export PDF / JSON
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-slate-200 text-[11px] font-medium">
                    <Mail className="w-3 h-3 text-indigo-600" /> Partage par Email
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED USER STATE */
            <div className="space-y-4">
              
              {/* Publication Status & Action Bar */}
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                isPublished 
                  ? isProtected 
                    ? 'bg-indigo-50/70 border-indigo-200' 
                    : 'bg-emerald-50 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    isPublished 
                      ? isProtected 
                        ? 'bg-indigo-500 animate-pulse' 
                        : 'bg-emerald-500 animate-pulse' 
                      : 'bg-slate-400'
                  }`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{isPublished ? 'CV Déployé en Ligne' : 'CV Privé (Brouillon)'}</span>
                      {isPublished && isProtected && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded border border-indigo-200">
                          Code PIN Actif
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isPublished 
                        ? `${viewCount} consultation${viewCount > 1 ? 's' : ''} recruteur enregistrée${viewCount > 1 ? 's' : ''}`
                        : 'Non accessible au public tant que vous ne cliquez pas sur déployer'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(!isPublished)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isPublished 
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  {isPublished ? 'Retirer du Web' : 'Déployer sur le Web'}
                </button>
              </div>

              {/* URL Customization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Identifiant URL unique (Slug de partage)
                </label>
                <div className="flex items-center">
                  <span className="text-xs font-mono px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-slate-500 select-none">
                    .../?p=
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="nom-prenom-poste"
                    className="flex-1 text-xs font-mono px-3 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              {/* ===================================================================== */}
              {/* ADVANCED ANTI-SCRAPING & PRIVACY SHIELD SECTION                      */}
              {/* ===================================================================== */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Bouclier Anti-Scraping & Confidentialité RGPD
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Protection Maximale
                  </span>
                </div>

                <div className="p-3.5 space-y-3.5">
                  {/* 1. PIN Code / Passcode Protection */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            Protection par Code PIN / Mot de Passe Recruteur
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Bloque 100% des scripts et robots : le CV complet n'est envoyé qu'après déverrouillage.
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsProtected(!isProtected)}
                        className={`cursor-pointer transition-colors ${isProtected ? 'text-indigo-600' : 'text-slate-400'}`}
                      >
                        {isProtected ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </div>

                    {isProtected && (
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Code PIN ou Mot de passe secret *
                          </label>
                          <input
                            type="text"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            placeholder={securityConfig?.hasPassword ? "•••• (Déjà configuré)" : "ex: 4488 ou secret123"}
                            className="w-full text-xs font-mono px-3 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden bg-indigo-50/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Indice pour le recruteur (facultatif)
                          </label>
                          <input
                            type="text"
                            value={pinHint}
                            onChange={(e) => setPinHint(e.target.value)}
                            placeholder="ex: Fourni par message LinkedIn"
                            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Contact Info Obfuscation (Click to Reveal) */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Masquage Anti-Moissonnage des Coordonnées (Click-to-Reveal)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Votre email et téléphone sont masqués des scripts regex de scraping automatique.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMaskContactInfo(!maskContactInfo)}
                      className={`cursor-pointer transition-colors ${maskContactInfo ? 'text-purple-600' : 'text-slate-400'}`}
                    >
                      {maskContactInfo ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                    </button>
                  </div>

                  {/* 3. Link Expiration */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Durée de validité du lien public
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Le lien se désactivera automatiquement à l'échéance choisie.
                        </div>
                      </div>
                    </div>

                    <select
                      value={expirationOption}
                      onChange={(e) => setExpirationOption(e.target.value)}
                      className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden cursor-pointer"
                    >
                      <option value="unlimited">Illimité (Permanent)</option>
                      <option value="7d">7 jours</option>
                      <option value="30d">30 jours</option>
                      <option value="90d">90 jours</option>
                    </select>
                  </div>

                  {/* Anti-Scraping Active Features Summary */}
                  <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[11px] space-y-1.5">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Mécanismes de protection actifs sur le serveur :</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[10px]">
                      <li><strong>Anti-Indexation Google & IA :</strong> En-têtes HTTP <code>X-Robots-Tag: noindex, nosnippet</code> injectés.</li>
                      <li><strong>Rate Limiting Anti-Bruteforce :</strong> Blocage automatique des requêtes excessives et des scripts par IP.</li>
                      <li><strong>Zero PII Leak :</strong> Aucune coordonnée ou expérience n'est transmise si le code PIN est actif.</li>
                    </ul>
                  </div>

                  {isPublished && (
                    <button
                      type="button"
                      onClick={handleSaveSecuritySettings}
                      disabled={isUpdating}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Appliquer les modifications de sécurité</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Public Link Box if Published */}
              {isPublished && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Lien Dédié à transmettre au Recruteur :
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-emerald-400 truncate">
                        {publicUrl}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={handleCopy}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copié !' : 'Copier'}</span>
                        </button>
                        <a
                          href={`/?p=${customSlug || slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-xs text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ouvrir</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* QR Code toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-semibold text-slate-800">QR Code sécurisé</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQR(!showQR)}
                      className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      {showQR ? 'Masquer' : 'Afficher le QR Code'}
                    </button>
                  </div>

                  {showQR && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
                      <img src={qrImageUrl} alt="QR Code du CV" className="w-36 h-36 rounded-lg border border-slate-200 shadow-2xs" />
                      <p className="text-[11px] text-slate-500 text-center">
                        Scannez pour ouvrir le CV sur mobile. Si un code PIN est configuré, il sera demandé à l'ouverture.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
