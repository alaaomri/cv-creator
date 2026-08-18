import React, { useState, useEffect } from 'react';
import { CVData } from '../../types';
import { ensureValidCVData } from '../../utils/cvDefaults';
import { CVPreviewRenderer } from '../templates/CVPreviewRenderer';
import { exportCVToPDF } from '../../utils/pdfExport';
import { 
  Download, Mail, Copy, Check, ArrowLeft, ShieldCheck, 
  Globe, Eye, Calendar, Sparkles, Share2, ExternalLink,
  Lock, KeyRound, AlertCircle, Clock, EyeOff, ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublicCVPageProps {
  slug: string;
  onBackToStudio: () => void;
}

export const PublicCVPage: React.FC<PublicCVPageProps> = ({
  slug,
  onBackToStudio,
}) => {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Protection & PIN Unlock state
  const [isProtected, setIsProtected] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showRevealedContact, setShowRevealedContact] = useState(false);

  useEffect(() => {
    async function loadPublicCV() {
      setLoading(true);
      setError(null);
      setIsExpired(false);
      setIsProtected(false);

      try {
        const res = await fetch(`/api/public/cv/${encodeURIComponent(slug)}`);
        const json = await res.json();

        if (res.status === 410 || json.isExpired) {
          setIsExpired(true);
          setError(json.error || "Ce lien de CV a expiré.");
          return;
        }

        if (json.isProtected) {
          setIsProtected(true);
          setMeta(json.meta);
          return;
        }

        if (json.success && json.data) {
          const formatted = ensureValidCVData(json.data);
          if (json.meta) {
            formatted.securityConfig = {
              ...formatted.securityConfig,
              maskContactInfo: json.meta.maskContactInfo ?? formatted.securityConfig?.maskContactInfo ?? false,
              expiresAt: json.meta.expiresAt,
            };
          }
          setCvData(formatted);
          setMeta(json.meta);
        } else {
          setError(json.error || 'CV introuvable ou non publié.');
        }
      } catch (err: any) {
        setError('Erreur de connexion au serveur.');
      } finally {
        setLoading(false);
      }
    }
    loadPublicCV();
  }, [slug]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsUnlocking(true);
    setUnlockError(null);

    try {
      const res = await fetch(`/api/public/cv/${encodeURIComponent(slug)}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode: pinInput.trim() }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const formatted = ensureValidCVData(json.data);
        if (json.meta) {
          formatted.securityConfig = {
            ...formatted.securityConfig,
            maskContactInfo: json.meta.maskContactInfo ?? formatted.securityConfig?.maskContactInfo ?? false,
          };
        }
        setCvData(formatted);
        setMeta(json.meta);
        setIsProtected(false);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        setUnlockError(json.error || 'Code PIN ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setUnlockError('Erreur lors de la validation du code.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvData) return;
    setIsExporting(true);
    const candidateName = cvData.personalInfo?.fullName || 'Candidat';
    const filename = `CV-${candidateName.replace(/\s+/g, '-')}.pdf`;
    await exportCVToPDF('cv-printable-document', filename);
    setIsExporting(false);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContact = () => {
    if (!cvData?.personalInfo?.email) return;
    const subject = encodeURIComponent(`Prise de contact / Opportunité professionnelle - ${cvData.personalInfo?.jobTitle || 'Candidature'}`);
    window.location.href = `mailto:${cvData.personalInfo.email}?subject=${subject}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-mono">Chargement du CV déployé...</p>
      </div>
    );
  }

  // EXPIRED LINK SCREEN
  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white text-center">
        <div className="p-8 max-w-md bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Lien de CV Expiré</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || "La durée de validité configurée par le candidat pour ce lien est arrivée à son terme."}
          </p>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300">
            Protection de la vie privée RGPD : l'accès aux données du profil a été automatiquement révoqué.
          </div>
          <button
            onClick={onBackToStudio}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retourner au Studio</span>
          </button>
        </div>
      </div>
    );
  }

  // PIN PROTECTION SCREEN (ZERO DATA LEAK)
  if (isProtected) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-7 space-y-5 shadow-2xl">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bouclier de Confidentialité Actif</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {meta?.candidateNameHint || "Profil Candidat Protégé"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {meta?.jobTitle || "Document d'ingénierie & Expériences"}
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-1.5">
            <p className="text-[11px] text-slate-300 leading-snug">
              Ce candidat a activé la protection par code d'accès afin de préserver ses coordonnées et données professionnelles contre les robots et scrapers.
            </p>
            {meta?.pinHint && (
              <div className="pt-1.5 border-t border-slate-700/60 text-[11px] text-amber-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
                <span>Indice : <strong>{meta.pinHint}</strong></span>
              </div>
            )}
          </div>

          <form onSubmit={handleUnlock} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Entrez le Code PIN ou Mot de Passe Recruteur :
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Code secret..."
                  autoFocus
                  className="w-full text-sm font-mono tracking-widest text-center px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-hidden"
                />
              </div>
            </div>

            {unlockError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUnlocking || !pinInput.trim()}
              className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUnlocking ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>Déverrouiller le CV Complet</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onBackToStudio}
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Retourner à CV Studio Cloud</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white text-center">
        <div className="p-6 max-w-md bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">Page CV non disponible</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || "Ce document n'a pas encore été publié ou l'adresse URL est incorrecte."}
          </p>
          <button
            onClick={onBackToStudio}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retourner au Studio</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStudio}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Retour au Studio"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{cvData.personalInfo.fullName}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Profil Vérifié & Sécurisé
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {cvData.personalInfo.jobTitle}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Lien copié' : 'Partager'}</span>
            </button>

            {cvData.personalInfo.email && (
              <button
                onClick={handleContact}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contacter</span>
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Export...' : 'Télécharger PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with CV Document */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col items-center">
        {/* Anti-Scraping / Security Notice */}
        {meta && (
          <div className="w-full max-w-[820px] mb-4 flex flex-wrap items-center justify-between text-xs text-slate-600 px-2 gap-2 bg-white/80 backdrop-blur-xs py-2 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>Slug certifié : <code className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{meta.slug}</code></span>
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Anti-Scraping Actif
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                <Eye className="w-3.5 h-3.5" />
                <span>{meta.viewCount} vue{meta.viewCount > 1 ? 's' : ''}</span>
              </span>
            </div>
          </div>
        )}

        {/* The CV component itself */}
        <CVPreviewRenderer data={cvData} scale={1} />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CV protégé & hébergé sur <strong>CV Studio Cloud</strong></span>
          <button
            onClick={onBackToStudio}
            className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Créer mon propre CV sécurisé</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </footer>
    </div>
  );
};
