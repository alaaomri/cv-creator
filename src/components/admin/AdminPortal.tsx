import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, BarChart3, Database, Server, RefreshCw, 
  Download, Eye, Globe, FileText, Mail, Sparkles, CheckCircle2, 
  XCircle, Clock, Search, Filter, ArrowLeft, ChevronRight, Copy,
  Layers, HardDrive, Cpu, Terminal, ExternalLink, AlertTriangle,
  FileCode, Check, Trash2, ArrowUpRight, Radio, Info, Users,
  Lock, KeyRound, UserCheck, ShieldAlert, Loader2, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthUser, UserRole } from '../../types';
import { authFetch, getAuthToken } from '../../utils/api';

interface AdminStats {
  overview: {
    totalCvs: number;
    publishedCvs: number;
    draftCvs: number;
    deploymentRatePercent: number;
    totalViews: number;
    totalExports: number;
    pdfExports: number;
    jsonExports: number;
    emailShares: number;
    exportToCreationRatio: number;
    aiGenerationsCount: number;
    cacheHitRatioPercent: number;
    totalRequests: number;
    uptimeSeconds: number;
  };
  templateDistribution: Record<string, number>;
  recentActivity: Array<{
    id: string;
    timestamp: string;
    type: string;
    title: string;
    details: string;
    cvId?: string;
    candidateName?: string;
  }>;
  systemHealth: {
    status: string;
    environment: string;
    database?: string;
    authEngine?: string;
    memoryUsageMb: string;
    totalMemoryMb: string;
    cachedEntries: number;
    dbRecordsCount: number;
  };
}

interface AdminCVItem {
  id: string;
  userId?: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  lastViewedAt?: string;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  version?: number;
  updatedAt: string;
  createdAt: string;
  templateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateRole: string;
  experiencesCount: number;
  skillsCount: number;
  rawData: any;
}

interface AdminPortalProps {
  onBackToStudio: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStudio }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'data' | 'users' | 'observability' | 'logs'>('analytics');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cvList, setCvList] = useState<AdminCVItem[]>([]);
  const [userList, setUserList] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedCvForInspect, setSelectedCvForInspect] = useState<AdminCVItem | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [inspectTab, setInspectTab] = useState<'summary' | 'json'>('summary');
  const [liveMetricsRaw, setLiveMetricsRaw] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);

  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      const [statsRes, cvsRes, usersRes, metricsRes] = await Promise.all([
        authFetch('/api/admin/stats'),
        authFetch('/api/admin/cvs'),
        authFetch('/api/admin/users'),
        authFetch('/api/metrics')
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        setAccessDenied(true);
        setIsLoading(false);
        return;
      }

      setAccessDenied(false);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (cvsRes.ok) {
        const cvsData = await cvsRes.json();
        setCvList(cvsData.items || []);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUserList(usersData.items || []);
      }
      if (metricsRes.ok) {
        const metData = await metricsRes.json();
        setLiveMetricsRaw(metData);
      }
    } catch (err) {
      console.error('Erreur chargement console admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user?.role === 'ADMIN') {
      fetchAdminData();
      let interval: NodeJS.Timeout | null = null;
      if (autoRefresh) {
        interval = setInterval(fetchAdminData, 8000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [autoRefresh, user, isAuthLoading]);

  // Toggle user role
  const handleToggleUserRole = async (userId: string, currentRole: UserRole) => {
    const nextRole: UserRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await authFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error('Erreur changement de rôle:', e);
    }
  };

  // Toggle user account active status (Enable / Disable)
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, fullName: string) => {
    const newStatus = !currentStatus;
    const actionLabel = newStatus ? "réactiver" : "suspendre / désactiver";
    if (!window.confirm(`Confirmez-vous vouloir ${actionLabel} le compte de ${fullName} ?`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive: newStatus,
          reason: newStatus ? undefined : "Désactivé depuis la console administrateur",
        }),
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la modification du statut du compte.");
      }
    } catch (e) {
      console.error('Erreur activation/désactivation utilisateur:', e);
    }
  };

  // Quick toggle CV publish from admin
  const handleTogglePublish = async (cv: AdminCVItem) => {
    try {
      const newStatus = !cv.isPublished;
      const res = await authFetch(`/api/cvs/${cv.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Erreur changement statut', err);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/?p=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDownloadFullBackup = () => {
    const token = getAuthToken();
    const url = token ? `/api/admin/export/all?token=${encodeURIComponent(token)}` : '/api/admin/export/all';
    window.open(url, '_blank');
  };

  // Loading state during auth check
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Vérification des accréditations de sécurité...</p>
      </div>
    );
  }

  // IF NOT AUTHENTICATED AS ADMIN: Render High-Security Access Gate
  if (!user || user.role !== 'ADMIN' || accessDenied) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans selection:bg-rose-500 selection:text-white">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top subtle glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-lg">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase tracking-wide">
                  HTTP 403 Forbidden
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  RBAC Guard
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Espace Réservé aux Administrateurs
              </h2>
              <p className="text-xs text-slate-400">
                La console et les routes <code className="text-rose-300 font-mono">/api/admin/*</code> exigent un jeton JWT avec le rôle <strong className="text-white">ADMIN</strong>.
              </p>
            </div>
          </div>

          {/* Current Session Info */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Session Utilisateur Actuelle :</span>
              <strong className="text-slate-200">
                {user ? `${user.fullName} (${user.email})` : 'Visiteur Anonyme'}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Rôle Détecté :</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${user?.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                {user ? user.role : 'AUCUN'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Protection Cookie & JWT :</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                HttpOnly, Bearer Header, JWT 256-bit
              </span>
            </div>
          </div>

          {/* Secure Admin Credentials Login Form */}
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setAdminLoginError(null);
              setIsAdminLoggingIn(true);
              try {
                const res = await login(adminEmail.trim(), adminPassword);
                if (res.success) {
                  setAccessDenied(false);
                  await fetchAdminData();
                } else {
                  setAdminLoginError(res.error || "Identifiants administrateur invalides.");
                }
              } catch (err: any) {
                setAdminLoginError(err.message || "Erreur de connexion.");
              } finally {
                setIsAdminLoggingIn(false);
              }
            }}
            className="space-y-3.5 pt-2"
          >
            {adminLoginError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/70 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Administrateur
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@cvstudio.cloud"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mot de Passe Sécurisé
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAdminLoggingIn}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer mt-2"
            >
              {isAdminLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authentification en cours...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Se Connecter à la Console Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToStudio}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retourner au Studio Candidat</span>
            </button>
          </form>
        </div>
      </div>
    );
  }


  const filteredCvs = cvList.filter(cv => {
    const matchesSearch = 
      cv.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cv.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'published' ? cv.isPublished :
      !cv.isPublished;

    return matchesSearch && matchesStatus;
  });

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* TOP ADMIN BAR */}
      <header className="px-4 lg:px-8 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md ring-1 ring-white/10">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                Console d'Administration & Données
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Espace Privé
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Surveillance des taux d'activité, consultation de la base de données & télémétrie
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              autoRefresh 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Actualisation automatique toutes les 8 secondes"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span className="hidden sm:inline">Live Sync</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Rafraîchir maintenant"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDownloadFullBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Télécharger un export JSON complet de la base de données"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Export Global DB</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour Studio Candidat</span>
          </button>
        </div>
      </header>

      {/* ADMIN NAVIGATION TABS */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Taux & Statistiques Clés</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'data'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Explorateur de Données ({cvList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs & Rôles ({userList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('observability')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'observability'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Architecture & Prometheus/Grafana</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Journal d'Audit & Activités</span>
          </button>
        </div>
      </div>

      {/* MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

        {/* TAB 1: ANALYTICS & TAUX */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* 4 PRIMARY KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Taux de Déploiement Web */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Taux de Déploiement Web
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats.overview.deploymentRatePercent}%
                  </span>
                  <span className="text-xs font-medium text-emerald-400">
                    ({stats.overview.publishedCvs} / {stats.overview.totalCvs} publiés)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, stats.overview.deploymentRatePercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Vues recruteurs cumulées :</span>
                  <span className="font-bold text-slate-200">{stats.overview.totalViews} vues</span>
                </div>
              </div>

              {/* 2. Taux d'Exportation & Partage */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Taux d'Exportation
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats.overview.exportToCreationRatio}x
                  </span>
                  <span className="text-xs font-medium text-sky-400">
                    exports / profil
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: '85%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Total : {stats.overview.totalExports} exports</span>
                  <span className="text-slate-300 font-mono text-[10px]">
                    PDF ({stats.overview.pdfExports}) • Mail ({stats.overview.emailShares})
                  </span>
                </div>
              </div>

              {/* 3. Consultations & Vues Recruteurs */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Vues & Consultations
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats.overview.totalViews}
                  </span>
                  <span className="text-xs font-medium text-indigo-400">
                    visites recruteurs
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: '75%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Pages publiques actives :</span>
                  <span className="text-indigo-300 font-bold">{stats.overview.publishedCvs} / {stats.overview.totalCvs}</span>
                </div>
              </div>

              {/* 4. Hit Ratio Cache & Latence */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Efficacité Cache L2
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {stats.overview.cacheHitRatioPercent}%
                  </span>
                  <span className="text-xs font-medium text-emerald-400">
                    hit ratio
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, stats.overview.cacheHitRatioPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Requêtes API traitées :</span>
                  <span className="font-bold text-slate-200">{stats.overview.totalRequests}</span>
                </div>
              </div>

            </div>

            {/* CHARTS & DISTRIBUTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Modèles de CV Utilisés (7 cols) */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">
                      Répartition des Modèles de Mise en Page (Templates)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {stats.overview.totalCvs} CV(s) au total
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    { id: 'tech-developer', label: 'Tech & DevOps Developer', color: '#0284c7' },
                    { id: 'modern-clean', label: 'Modern Clean Polyvalent', color: '#6366f1' },
                    { id: 'executive', label: 'Executive & Cadres', color: '#0f172a' },
                    { id: 'creative-minimal', label: 'Creative & Minimalist', color: '#ec4899' },
                    { id: 'academic-classic', label: 'Academic & ATS Classic', color: '#475569' },
                    { id: 'accent-split', label: 'Accent Split High Contrast', color: '#059669' },
                  ].map((tmpl) => {
                    const count = stats.templateDistribution[tmpl.id] || 0;
                    const pct = stats.overview.totalCvs > 0 
                      ? Math.round((count / stats.overview.totalCvs) * 100) 
                      : 0;

                    return (
                      <div key={tmpl.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tmpl.color }} />
                            {tmpl.label}
                          </span>
                          <span className="font-mono text-slate-400">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.max(4, pct)}%`, 
                              backgroundColor: tmpl.color 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Ventilation des Canaux d'Export & Infrastructure (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-sm text-white">
                    Canaux d'Exportation & Télémétrie
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
                    <FileText className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <span className="text-lg font-extrabold text-white block">
                      {stats.overview.pdfExports}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                      PDF Vectorisés
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
                    <Mail className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-lg font-extrabold text-white block">
                      {stats.overview.emailShares}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                      Partages Mail
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
                    <FileCode className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                    <span className="text-lg font-extrabold text-white block">
                      {stats.overview.jsonExports}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                      Exports JSON
                    </span>
                  </div>
                </div>

                {/* System Runtime Health Status */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>État du Système :</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {stats.systemHealth.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Uptime Serveur :</span>
                    <span className="font-mono text-slate-200">{formatUptime(stats.overview.uptimeSeconds)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Mémoire RAM Node.js :</span>
                    <span className="font-mono text-slate-200">{stats.systemHealth.memoryUsageMb} MB / {stats.systemHealth.totalMemoryMb} MB</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: DATA EXPLORER & MANAGEMENT */}
        {activeTab === 'data' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Search & Filter Toolbar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom de candidat, poste, slug ou email..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tous ({cvList.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('published')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'published' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    En Ligne
                  </button>
                  <button
                    onClick={() => setStatusFilter('draft')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'draft' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Brouillons
                  </button>
                </div>
              </div>
            </div>

            {/* CV Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Candidat & Profil</th>
                      <th className="px-4 py-3.5">Titre & Slug Public</th>
                      <th className="px-4 py-3.5">Modèle</th>
                      <th className="px-4 py-3.5">Statut Déploiement</th>
                      <th className="px-4 py-3.5 text-center">Vues</th>
                      <th className="px-4 py-3.5">Dernière MàJ</th>
                      <th className="px-4 py-3.5 text-right">Actions Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCvs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          Aucun CV correspondant trouvé.
                        </td>
                      </tr>
                    ) : (
                      filteredCvs.map((cv) => (
                        <tr key={cv.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Candidat */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white text-xs">{cv.candidateName}</div>
                            <div className="text-slate-400 text-[11px]">{cv.candidateRole}</div>
                            <div className="text-slate-500 text-[10px]">{cv.candidateEmail}</div>
                          </td>

                          {/* Titre & Slug */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-slate-200 max-w-[180px] truncate">{cv.title}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                v{cv.version || 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-500/30">
                                {cv.slug}
                              </span>
                              <button
                                onClick={() => handleCopyLink(cv.slug)}
                                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                                title="Copier le lien public"
                              >
                                {copiedSlug === cv.slug ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          {/* Template */}
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                              {cv.templateId}
                            </span>
                          </td>

                          {/* Statut */}
                          <td className="px-4 py-3.5">
                            {cv.isPublished ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                En Ligne (Publié)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                Brouillon Privé
                              </span>
                            )}
                          </td>

                          {/* Vues */}
                          <td className="px-4 py-3.5 text-center font-bold text-white font-mono">
                            {cv.viewCount || 0}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3.5 text-[11px] text-slate-400">
                            {new Date(cv.updatedAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Inspect raw data */}
                              <button
                                onClick={() => setSelectedCvForInspect(cv)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Inspecter les données brutes JSON"
                              >
                                <Database className="w-3.5 h-3.5" />
                              </button>

                              {/* Open live public page */}
                              {cv.isPublished && (
                                <a
                                  href={`/?p=${cv.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                  title="Ouvrir la page publique recruteur"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Toggle publish */}
                              <button
                                onClick={() => handleTogglePublish(cv)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                  cv.isPublished
                                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/60'
                                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60'
                                }`}
                                title={cv.isPublished ? 'Dépublier ce CV' : 'Publier ce CV'}
                              >
                                {cv.isPublished ? 'Dépublier' : 'Publier'}
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: USERS & RBAC ROLES MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header / Description Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Gestion des Comptes Utilisateurs & Contrôle d'Accès (RBAC)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Table des identités gérée par <strong className="text-slate-200">Prisma ORM</strong> sur PostgreSQL. Les sessions sont sécurisées par jeton <strong className="text-slate-200">JWT (HttpOnly cookie)</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  {userList.length} Utilisateur(s) Enregistré(s)
                </span>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                      <th className="px-4 py-3">Utilisateur</th>
                      <th className="px-4 py-3">Identifiant Unique</th>
                      <th className="px-4 py-3">Adresse Email</th>
                      <th className="px-4 py-3 text-center">Rôle RBAC</th>
                      <th className="px-4 py-3 text-center">Statut Compte</th>
                      <th className="px-4 py-3 text-center">Date Création</th>
                      <th className="px-4 py-3 text-right">Actions Administration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {userList.map((u) => {
                      const isAdmin = u.role === 'ADMIN';
                      const isCurrentUser = user?.id === u.id;
                      const isActive = u.isActive !== false;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Name */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isAdmin ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'}`}>
                                {u.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.fullName}</span>
                                  {isCurrentUser && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      Vous
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">ID: {u.id.slice(0, 12)}...</div>
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-[11px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                              @{u.username || 'sans-username'}
                            </span>
                          </td>

                          {/* Email */}
                          <td className="px-4 py-3.5 font-mono text-slate-300">
                            {u.email}
                          </td>

                          {/* Role Badge */}
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                              isAdmin 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              <span>{u.role}</span>
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5 text-center">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Actif
                              </span>
                            ) : (
                              <span 
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                title={u.disabledReason || "Compte suspendu"}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                Suspendu
                              </span>
                            )}
                          </td>

                          {/* Created date */}
                          <td className="px-4 py-3.5 text-center text-slate-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }) : 'N/A'}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle Role */}
                              <button
                                onClick={() => handleToggleUserRole(u.id, u.role)}
                                disabled={isCurrentUser}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isAdmin
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                    : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                                }`}
                                title={isCurrentUser ? "Vous ne pouvez pas modifier vos propres privilèges d'administrateur" : `Basculer vers ${isAdmin ? 'USER' : 'ADMIN'}`}
                              >
                                {isAdmin ? 'Rétrograder USER' : 'Promouvoir ADMIN'}
                              </button>

                              {/* Toggle Status (Enable / Disable) */}
                              <button
                                onClick={() => handleToggleUserStatus(u.id, isActive, u.fullName)}
                                disabled={isCurrentUser}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isActive
                                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                                }`}
                                title={isCurrentUser ? "Vous ne pouvez pas désactiver votre propre compte" : isActive ? "Suspendre ce compte" : "Réactiver ce compte"}
                              >
                                {isActive ? 'Désactiver' : 'Réactiver'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: OBSERVABILITY & PROMETHEUS / GRAFANA EXPLANATION */}
        {activeTab === 'observability' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Core Architectural Answer Box */}
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3 shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-indigo-200">
                    Pourquoi Prometheus & Grafana sont-ils hébergés sur des serveurs / clusters externes en production ?
                  </h3>
                  <p className="text-xs text-indigo-300/90 mt-1 leading-relaxed">
                    Dans une architecture logicielle professionnelle, <strong>l'observabilité (Prometheus, Grafana, Datadog)</strong> est toujours isolée sur des serveurs ou services managés dédiés, pour 4 raisons capitales :
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    1. Isolation de panne (Fault Isolation)
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Si l'application métier tombe en panne, sature sa RAM ou subit un pic de trafic, le serveur Prometheus/Grafana externe reste 100% opérationnel pour déclencher des alertes PagerDuty / Slack.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-sky-400" />
                    2. Modèle de Scraping HTTP PULL
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    L'application expose simplement un endpoint léger (<code className="text-sky-300 font-mono">/api/metrics</code>). Le serveur Prometheus externe vient l'interroger (scrape) toutes les 15 secondes sans consommer de mémoire d'historique dans l'application.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    3. Rétention Time-Series (TSDB)
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Conserver des mois de métriques nécessite un moteur de base de données chronologique (TSDB) avec compression disque dédiée, impossible à embarquer dans un conteneur stateless Cloud Run.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    4. Centralisation Multi-Services
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Un cluster Grafana unique consolide les métriques de dizaines de microservices, de la base de données PostgreSQL, du cache Redis et du cluster Kubernetes en un seul écran de contrôle.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Prometheus Metrics Endpoint Preview */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">
                    Flux Télémétrique en Direct (Endpoint Prometheus Scraper)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  GET /api/metrics (HTTP 200)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72">
                <pre>{JSON.stringify(liveMetricsRaw || stats, null, 2)}</pre>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: AUDIT LOGS & LIVE ACTIVITY */}
        {activeTab === 'logs' && stats && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">
                  Journal d'Audit des Événements Récents
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {stats.recentActivity.length} événements enregistrés
              </span>
            </div>

            <div className="space-y-2">
              {stats.recentActivity.map((log) => {
                let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
                if (log.type === 'cv_created') badgeBg = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
                if (log.type === 'cv_published') badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                if (log.type === 'cv_exported_pdf') badgeBg = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
                if (log.type === 'ai_generated') badgeBg = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                if (log.type === 'cv_shared_email') badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';

                return (
                  <div 
                    key={log.id} 
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeBg}`}>
                        {log.type}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-white">{log.title}</div>
                        <div className="text-[11px] text-slate-400">{log.details}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: JSON RAW DATA INSPECTOR */}
      {selectedCvForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">
                  Inspection Données Brutes : {selectedCvForInspect.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCvForInspect(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Candidat : <strong className="text-white">{selectedCvForInspect.candidateName}</strong></span>
                <span>•</span>
                <span>Slug : <code className="text-indigo-300 font-mono">{selectedCvForInspect.slug}</code></span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedCvForInspect.rawData, null, 2));
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copier JSON</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-slate-950 text-indigo-200">
              <pre>{JSON.stringify(selectedCvForInspect.rawData || selectedCvForInspect, null, 2)}</pre>
            </div>

            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCvForInspect(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Fermer l'inspecteur
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
