import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Palette, Globe, Download, ShieldCheck, 
  ArrowRight, CheckCircle2, Layers, Cpu, Users, 
  QrCode, Zap, Lock, Eye, ExternalLink, BarChart3, 
  LogIn, UserPlus, Server, Award, ChevronRight, KeyRound
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TEMPLATES_META } from '../../data/sampleCVs';
import { TemplateId } from '../../types';

interface LandingHomePageProps {
  onOpenStudio: () => void;
  onOpenDashboard: () => void;
  onOpenDevOps: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectTemplate?: (templateId: TemplateId) => void;
}

export const LandingHomePage: React.FC<LandingHomePageProps> = ({
  onOpenStudio,
  onOpenDashboard,
  onOpenDevOps,
  onOpenAdmin,
  onOpenAuth,
  onSelectTemplate,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white flex flex-col">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-850">
        {/* Subtle decorative glowing background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-750 text-xs font-semibold text-sky-400 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Plateforme Cloud d'Ingénierie de CV & Publication Web</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none"
            >
              Votre CV professionnel,{' '}
              <span className="bg-linear-to-r from-sky-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
                conçu sur-mesure
              </span>{' '}
              et prêt pour le Web.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Concevez des curriculums vitae irréprochables avec 6 modèles haute-définition A4, personnalisez vos couleurs et polices, puis publiez votre page web candidat en 1 clic avec QR Code recruteur.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <button
                onClick={onOpenStudio}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileText className="w-4 h-4" />
                <span>Créer mon CV / Ouvrir le Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isAuthenticated ? (
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-750 font-semibold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-sky-400" />
                  <span>Se Connecter / S'inscrire</span>
                </button>
              ) : (
                <button
                  onClick={onOpenDashboard}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-750 font-semibold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Gérer mes versions ({user?.fullName})</span>
                </button>
              )}
            </motion.div>



            {/* Feature Pills */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Thèmes & Polices</div>
                  <div className="text-[11px] text-slate-400">Typographie & Couleurs</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">6 Modèles A4</div>
                  <div className="text-[11px] text-slate-400">Design Professionnel</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Publication Web</div>
                  <div className="text-[11px] text-slate-400">Slug & QR Code Recruteur</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Export PDF HD</div>
                  <div className="text-[11px] text-slate-400">Mise en page vectorielle</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION À PROPOS & NOTRE MISSION */}
      <section className="py-16 md:py-24 bg-slate-900/60 border-b border-slate-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-bold font-mono uppercase tracking-widest text-sky-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              À Propos & Vision de la Plateforme
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pourquoi réinventer l'expérience du CV ?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Dans un marché de l'emploi hautement compétitif, un CV classique au format Word ou PDF statique manque d'adaptabilité, échoue souvent les filtres automatisés (ATS) et reste difficilement consultable sur mobile par un recruteur pressé.
            </p>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              <strong>CV Studio Cloud</strong> a été développé pour combler ce fossé en unifiant trois univers : <strong className="text-white">l'artisanat du design typographique</strong>, <strong className="text-white">l'ergonomie d'édition en temps réel</strong>, et <strong className="text-white">une infrastructure cloud sécurisée</strong> garantissant une accessibilité web instantanée.
            </p>
          </div>

          {/* The 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Pillar 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Ingénierie & Design A4</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                6 mises en page professionnelles respectant strictement les grilles A4 (210mm × 297mm). Personnalisation intégrale des polices, hiérarchies typographiques, formes d'avatars et palettes de couleurs.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Modèles Modern, Tech, Executive, etc.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Exportation PDF vectorielle sans marge</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Sécurité & Données Maîtrisées</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Traitement optimisé de vos photos en local (Canvas 512x512) et stockage sécurisé côté serveur. Confidentialité garantie avec protection anti-scraping pour vos coordonnées.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Compression et cadrage photo local</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Protection par mot de passe & anti-robots</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Publication Web & Télémétrie</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Déployez votre CV sous forme de page web fluide avec un slug personnalisé. Partagez votre lien par QR Code, suivez le nombre de consultations recruteurs et mettez à jour votre contenu en direct.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QR Code recruteur généré à la volée</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Statistiques de vue et d'export en direct</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LES 6 MODÈLES DE CV PRÉSENTÉS */}
      <section className="py-16 md:py-24 border-b border-slate-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold font-mono uppercase tracking-widest text-sky-400">
              Galerie & Typographie
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              6 Mises en Page Conçues pour Recruteurs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Chaque modèle est optimisé pour un profil de carrière précis, avec respect des règles de lisibilité et de compatibilité ATS.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES_META.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-sky-500/50 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold border border-slate-700">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{t.tag}</span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {t.name}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (onSelectTemplate) onSelectTemplate(t.id as TemplateId);
                      onOpenStudio();
                    }}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Utiliser ce modèle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW EN 4 ÉTAPES */}
      <section className="py-16 md:py-24 bg-slate-900/40 border-b border-slate-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold font-mono uppercase tracking-widest text-sky-400">
              Processus Rapide
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Comment ça marche ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              De la saisie brute à la diffusion multicanale en moins de 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                1
              </div>
              <h4 className="font-bold text-white text-base">Renseignez vos Acquis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complétez votre profil, vos expériences, vos formations et vos compétences techniques via des formulaires modulaires et fluides.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                2
              </div>
              <h4 className="font-bold text-white text-base">Améliorez avec l'IA</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilisez l'assistant Gemini pour reformuler vos réalisations, quantifier vos résultats et optimiser la concordance avec les annonces.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                3
              </div>
              <h4 className="font-bold text-white text-base">Choisissez votre Style</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sélectionnez l'un des 6 templates A4, ajustez les couleurs principales et visualisez le résultat en temps réel avec zoom interactif.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                4
              </div>
              <h4 className="font-bold text-white text-base">Exportez & Partagez</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Téléchargez votre document en PDF vectoriel haute définition ou activez la publication web pour partager votre lien et QR Code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ESPACE ACCÈS COMPTE & AUTHENTIFICATION */}
      <section className="py-16 md:py-24 border-b border-slate-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Sécurité & Authentification JWT
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PostgreSQL / Supabase + Prisma
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {isAuthenticated && user
                  ? `Bonjour ${user.fullName}, prêt à éditer votre CV ?`
                  : 'Rejoignez CV Studio Cloud ou démarrez sans attendre'}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Vos données sont protégées par chiffrement bcrypt et cookies sécurisés <code className="text-sky-300 font-mono text-xs">HttpOnly</code>. En mode anonyme, vous pouvez exporter en PDF/JSON et partager par email. <strong className="text-amber-300 font-semibold">Se connecter pour garder le CV et déployer le CV.</strong>
              </p>

              {/* Status and Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                {isAuthenticated && user ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={onOpenStudio}
                      className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Accéder à mon Studio d'Édition</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onOpenDashboard}
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 cursor-pointer transition-colors"
                    >
                      <span>Gérer mes CVs sauvegardés</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Créer un Compte Gratuit</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenAuth('login')}
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-sky-400" />
                      <span>Se Connecter</span>
                    </button>
                    <button
                      onClick={onOpenStudio}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Édition locale sans création de compte : vos données restent sur votre machine"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Essayer en Mode Invité (100% Local • RGPD)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto bg-slate-950 py-12 border-t border-slate-900 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-300">CV Studio Cloud</span>
              <span className="text-slate-600 text-[11px] ml-2">Plateforme d'Ingénierie & Publication de CV</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
            <button onClick={onOpenStudio} className="hover:text-white transition-colors cursor-pointer">
              Studio & Éditeur
            </button>
            <button onClick={onOpenDashboard} className="hover:text-white transition-colors cursor-pointer">
              Mes CVs
            </button>
            <button onClick={onOpenDevOps} className="hover:text-white transition-colors cursor-pointer">
              Architecture Cloud & SRE
            </button>
            <button onClick={onOpenAdmin} className="hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Console Admin</span>
            </button>
          </div>

          <div className="text-slate-600 text-center md:text-right">
            <span>© 2026 CV Studio Cloud • Sécurisé par JWT & RBAC</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
