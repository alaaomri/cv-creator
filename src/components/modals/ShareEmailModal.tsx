import React, { useState } from 'react';
import { Mail, Send, Check, Copy, ExternalLink, X, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { authFetch } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface ShareEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvTitle: string;
  candidateName: string;
  candidateJob: string;
  publicUrl: string;
}

export const ShareEmailModal: React.FC<ShareEmailModalProps> = ({
  isOpen,
  onClose,
  cvTitle,
  candidateName,
  candidateJob,
  publicUrl,
}) => {
  const { isAuthenticated } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState(`Candidature ${candidateJob || 'Poste'} - ${candidateName || 'Mon CV'}`);
  const [message, setMessage] = useState(
    `Bonjour,\n\nVeuillez trouver ci-joint mon CV actualisé pour le poste de ${candidateJob}.\nVous pouvez également consulter ma page CV interactive dédiée à l'adresse suivante :\n${publicUrl}\n\nRestant à votre entière disposition pour tout échange,\n\nBien cordialement,\n${candidateName}`
  );
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleOpenMailClient = () => {
    const mailto = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setErrorMessage('Veuillez renseigner une adresse email valide.');
      return;
    }

    // In GUEST MODE: Zero backend calls, trigger client email directly
    if (!isAuthenticated) {
      handleOpenMailClient();
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2000);
      return;
    }

    setIsSending(true);
    setErrorMessage('');

    try {
      const res = await authFetch('/api/share/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          senderName: candidateName,
          cvTitle,
          publicUrl,
          message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSentSuccess(true);
        setTimeout(() => {
          setSentSuccess(false);
          onClose();
        }, 2500);
      } else {
        setErrorMessage(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (err: any) {
      // Fallback client mailto
      handleOpenMailClient();
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-sky-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Partager le CV par Email</h2>
              <p className="text-xs text-sky-100">Envoi direct ou via votre logiciel de messagerie</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSend} className="p-5 space-y-3.5 overflow-y-auto">
          {sentSuccess ? (
            <div className="p-6 text-center space-y-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm">Email envoyé avec succès !</h3>
              <p className="text-xs text-emerald-700">Le recruteur a reçu votre candidature avec le lien dédié.</p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email du Destinataire / Recruteur *
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recruteur@entreprise.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objet du Message
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message d'accompagnement
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-sans leading-relaxed"
                />
              </div>

              {/* Public Link reminder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="truncate text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Lien public : </span>
                  <span className="font-mono text-[11px] text-sky-700">{publicUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copié' : 'Copier'}</span>
                </button>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleOpenMailClient}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir dans Outlook / Gmail</span>
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <span>Envoi en cours...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer l'Email</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
