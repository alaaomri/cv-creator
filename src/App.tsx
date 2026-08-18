import React, { useState, useEffect, useRef } from 'react';
import { CVData, CVListItem, TemplateId, ThemeConfig, CVSecurityConfig } from './types';
import { TEMPLATES_META, COLOR_PALETTES, DEFAULT_CV_DATA } from './data/sampleCVs';
import { ensureValidCVData, createBlankCV } from './utils/cvDefaults';
import { CVPreviewRenderer } from './components/templates/CVPreviewRenderer';
import { PersonalInfoForm } from './components/editor/PersonalInfoForm';
import { ExperiencesForm } from './components/editor/ExperiencesForm';
import { EducationForm } from './components/editor/EducationForm';
import { SkillsForm } from './components/editor/SkillsForm';
import { ProjectsForm } from './components/editor/ProjectsForm';
import { LanguagesAndCertsForm } from './components/editor/LanguagesAndCertsForm';
import { ThemeCustomizer } from './components/editor/ThemeCustomizer';
import { ShareEmailModal } from './components/modals/ShareEmailModal';
import { WebPublishModal } from './components/modals/WebPublishModal';
import { VersionManagerDashboard } from './components/dashboard/VersionManagerDashboard';
import { PublicCVPage } from './components/public/PublicCVPage';
import { DevOpsArchitectureHub } from './components/devops/DevOpsArchitectureHub';
import { AdminPortal } from './components/admin/AdminPortal';
import { LandingHomePage } from './components/home/LandingHomePage';
import { AuthModal } from './components/modals/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { exportCVToPDF } from './utils/pdfExport';
import { authFetch } from './utils/api';
import { validateCVData } from './utils/cvValidator';
import { UnsavedChangesModal } from './components/modals/UnsavedChangesModal';
import { MobileNavDrawer } from './components/navigation/MobileNavDrawer';
import { 
  FileText, Download, Share2, Mail, Globe, Sparkles, Layers, 
  Server, User, Briefcase, GraduationCap, Cpu, FolderGit2, 
  Award, Palette, ZoomIn, ZoomOut, Check, ArrowLeft, RefreshCw,
  Plus, Eye, Smartphone, Monitor, ChevronRight, Layout,
  ShieldCheck, ShieldAlert, LogIn, LogOut, UserCheck, Shield, Home, Cloud, Lock, Edit3,
  Save, AlertCircle, AlertTriangle, Loader2, Menu, X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // 1. URL Router Check (Public page check ?p=slug, or Admin portal ?admin=true / ?view=admin)
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get('p');
    const admin = urlParams.get('admin') === 'true' || urlParams.get('view') === 'admin';
    
    if (p) {
      setPublicSlug(p);
    } else if (admin) {
      setIsAdminMode(true);
    }

    // Keyboard shortcut for admin: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Main App State
  const [currentView, setCurrentView] = useState<'home' | 'editor' | 'dashboard' | 'devops'>('home');
  const [activeEditorTab, setActiveEditorTab] = useState<'info' | 'experiences' | 'education' | 'skills' | 'projects' | 'languages' | 'theme'>('info');

  // Multi-version data state
  const [cvList, setCvList] = useState<CVListItem[]>([]);
  const [currentCv, setCurrentCv] = useState<CVData>(ensureValidCVData(DEFAULT_CV_DATA));
  const [previewScale, setPreviewScale] = useState(1);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Save & Dirty state management (Opt-in Save button & Client Validation)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false);

  // Modals state
  const [isShareEmailOpen, setIsShareEmailOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Responsive mobile preview toggle
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  // Native beforeunload protection when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non enregistrées sur votre CV.';
        return 'Vous avez des modifications non enregistrées sur votre CV.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCv, isAuthenticated, hasUnsavedChanges]);

  // 3. Load CVs from API or LocalStorage on mount & auth state changes
  useEffect(() => {
    async function loadData() {
      // If user is not authenticated (GUEST MODE), use strictly LocalStorage (100% client-side, GDPR compliant)
      if (!isAuthenticated) {
        try {
          const storedGuest = localStorage.getItem('cv_studio_guest_draft');
          if (storedGuest) {
            const parsed = JSON.parse(storedGuest);
            const safe = ensureValidCVData(parsed);
            setCurrentCv(safe);
            setCvList([{
              id: safe.id || 'guest-draft',
              title: safe.title || 'Mon CV (Local)',
              templateId: safe.templateId,
              isPublished: false,
              slug: safe.slug || 'mon-cv',
              updatedAt: safe.updatedAt || new Date().toISOString(),
              candidateName: safe.personalInfo?.fullName || 'Nouveau Candidat',
              candidateRole: safe.personalInfo?.jobTitle || '',
              viewCount: 0,
            }]);
            return;
          }
        } catch (e) {
          console.warn('Could not read guest draft from localStorage:', e);
        }

        // Clean blank starter CV for guest
        const blankGuest = createBlankCV('Mon CV');
        setCurrentCv(blankGuest);
        setCvList([{
          id: blankGuest.id || 'guest-draft',
          title: blankGuest.title || 'Mon CV (Local)',
          templateId: blankGuest.templateId,
          isPublished: false,
          slug: blankGuest.slug || 'mon-cv',
          updatedAt: new Date().toISOString(),
          candidateName: blankGuest.personalInfo?.fullName || 'Nouveau Candidat',
          candidateRole: blankGuest.personalInfo?.jobTitle || '',
          viewCount: 0,
        }]);
        return;
      }

      // If user is AUTHENTICATED: Sync cloud CVs
      try {
        // If there was a guest draft in localStorage from before logging in, import/sync it to Cloud
        const storedGuest = localStorage.getItem('cv_studio_guest_draft');
        if (storedGuest) {
          try {
            const guestData = ensureValidCVData(JSON.parse(storedGuest));
            await authFetch('/api/cvs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(guestData),
            });
            localStorage.removeItem('cv_studio_guest_draft');
          } catch (syncErr) {
            console.warn('Failed to sync guest draft to cloud on login:', syncErr);
          }
        }

        const res = await authFetch('/api/cvs');
        const json = await res.json();
        const items = json.items || json.data;
        if (json.success && Array.isArray(items) && items.length > 0) {
          setCvList(items);
          // Load full first CV
          const firstCvRes = await authFetch(`/api/cvs/${items[0].id}`);
          const firstCvJson = await firstCvRes.json();
          if (firstCvJson.success && firstCvJson.data) {
            setCurrentCv(ensureValidCVData(firstCvJson.data));
          } else {
            setCurrentCv(createBlankCV('Mon CV', user?.fullName || '', user?.email || ''));
          }
        } else {
          // Cloud has no CVs yet for this user: create clean blank starter CV
          const blankUserCV = createBlankCV('Mon CV', user?.fullName || '', user?.email || '');
          try {
            await authFetch('/api/cvs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(blankUserCV),
            });
          } catch (e) {
            console.warn(e);
          }
          setCvList([{
            id: blankUserCV.id || 'cv-1',
            title: blankUserCV.title || 'Mon CV',
            templateId: blankUserCV.templateId,
            isPublished: false,
            slug: blankUserCV.slug || 'mon-cv',
            updatedAt: new Date().toISOString(),
            candidateName: blankUserCV.personalInfo?.fullName || user?.fullName || 'Nouveau Candidat',
            candidateRole: blankUserCV.personalInfo?.jobTitle || '',
            viewCount: 0,
          }]);
          setCurrentCv(blankUserCV);
        }
      } catch (err) {
        console.error('Failed to load from API:', err);
        const fallback = createBlankCV('Mon CV', user?.fullName || '', user?.email || '');
        setCvList([{
          id: fallback.id,
          title: fallback.title,
          templateId: fallback.templateId,
          isPublished: false,
          slug: fallback.slug,
          updatedAt: new Date().toISOString(),
          candidateName: fallback.personalInfo?.fullName || 'Nouveau Candidat',
          candidateRole: fallback.personalInfo?.jobTitle || '',
          viewCount: 0
        }]);
        setCurrentCv(fallback);
      }
    }
    loadData();
  }, [isAuthenticated, user?.id]);

  // 4. Save handler with client-side validation (GDPR-safe: Local-only for guest, Cloud DB for authenticated users)
  const handleSave = async (showToast = true): Promise<boolean> => {
    const safe = ensureValidCVData(currentCv);

    // 4.1 Frontend validation before making any storage/server call
    const validation = validateCVData(safe);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return false;
    }
    setValidationErrors([]);

    setIsSaving(true);

    // GUEST MODE: Save strictly in browser localStorage (Zero server/DB persistence, Zero network requests)
    if (!isAuthenticated) {
      try {
        localStorage.setItem('cv_studio_guest_draft', JSON.stringify(safe));
        setCvList(prev => prev.map(item => item.id === safe.id ? {
          ...item,
          title: safe.title || item.title,
          templateId: safe.templateId,
          isPublished: false,
          slug: safe.slug || item.slug,
          updatedAt: new Date().toISOString(),
          candidateName: safe.personalInfo?.fullName || item.candidateName,
          candidateRole: safe.personalInfo?.jobTitle || item.candidateRole,
        } : item));
        setHasUnsavedChanges(false);
        if (showToast) {
          setSaveSuccessMessage('CV enregistré localement dans votre navigateur');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
        return true;
      } catch (e) {
        console.warn('LocalStorage save error:', e);
        setValidationErrors(['Erreur lors de la sauvegarde locale dans le navigateur.']);
        return false;
      } finally {
        setIsSaving(false);
      }
    }

    // AUTHENTICATED MODE: Persist to secure Cloud Database (Single PUT request)
    try {
      const res = await authFetch(`/api/cvs/${safe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safe),
      });
      const json = await res.json();
      if (json.success) {
        // Also update list state
        setCvList(prev => prev.map(item => item.id === safe.id ? {
          ...item,
          title: safe.title || item.title,
          templateId: safe.templateId,
          isPublished: safe.isPublished,
          slug: safe.slug || item.slug,
          updatedAt: new Date().toISOString(),
          candidateName: safe.personalInfo?.fullName || item.candidateName,
          candidateRole: safe.personalInfo?.jobTitle || item.candidateRole,
        } : item));
        setHasUnsavedChanges(false);
        if (showToast) {
          setSaveSuccessMessage('CV enregistré avec succès sur le Cloud');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
        return true;
      } else {
        setValidationErrors([json.error || 'Erreur lors de l\'enregistrement sur le serveur.']);
        return false;
      }
    } catch (e) {
      console.warn('Save network warning:', e);
      setValidationErrors(['Erreur de connexion lors de la sauvegarde.']);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // State update wrapper: purely updates local React state without firing heavy background database requests
  const handleUpdateCv = (updater: (prev: CVData) => CVData) => {
    setCurrentCv(prev => {
      const next = ensureValidCVData(updater(prev));
      setHasUnsavedChanges(true);
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
      return next;
    });
  };

  // Navigation guard for unsaved changes
  const navigateWithUnsavedCheck = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => action);
      setIsUnsavedModalOpen(true);
    } else {
      action();
    }
  };

  const handleModalSaveAndProceed = async () => {
    const saved = await handleSave(false);
    if (saved) {
      setIsUnsavedModalOpen(false);
      if (pendingNavigation) {
        const action = pendingNavigation;
        setPendingNavigation(null);
        action();
      }
    }
  };

  const handleModalDiscardAndProceed = () => {
    setHasUnsavedChanges(false);
    setValidationErrors([]);
    setIsUnsavedModalOpen(false);
    if (pendingNavigation) {
      const action = pendingNavigation;
      setPendingNavigation(null);
      action();
    }
  };

  const handleModalCancel = () => {
    setIsUnsavedModalOpen(false);
    setPendingNavigation(null);
  };

  // 5. Select CV from dashboard
  const doSelectCV = async (id: string) => {
    if (!isAuthenticated) {
      // In Guest Mode: strictly local resolution, zero backend call
      const storedGuest = localStorage.getItem('cv_studio_guest_draft');
      if (storedGuest) {
        try {
          const parsed = JSON.parse(storedGuest);
          if (parsed.id === id || id === 'guest-draft') {
            setCurrentCv(ensureValidCVData(parsed));
            setHasUnsavedChanges(false);
            setValidationErrors([]);
            setCurrentView('editor');
            return;
          }
        } catch {}
      }
      return;
    }

    try {
      const res = await authFetch(`/api/cvs/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCurrentCv(ensureValidCVData(json.data));
        setHasUnsavedChanges(false);
        setValidationErrors([]);
        setCurrentView('editor');
      }
    } catch (e) {
      console.error('Failed to select CV:', e);
    }
  };

  const handleSelectCV = (id: string) => {
    navigateWithUnsavedCheck(() => doSelectCV(id));
  };

  // 6. Create New CV
  const doCreateNew = async () => {
    const newCv = createBlankCV(
      `Nouveau CV (${new Date().toLocaleDateString('fr-FR')})`,
      user?.fullName || '',
      user?.email || ''
    );

    if (isAuthenticated) {
      try {
        await authFetch('/api/cvs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCv),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // In Guest Mode: persist strictly in localStorage, zero backend call
      try {
        localStorage.setItem('cv_studio_guest_draft', JSON.stringify(newCv));
      } catch {}
    }

    setCvList(prev => [{
      id: newCv.id || `cv-${Date.now()}`,
      title: newCv.title || 'Nouveau CV',
      templateId: newCv.templateId,
      isPublished: false,
      slug: newCv.slug || `cv-${Date.now()}`,
      updatedAt: newCv.updatedAt || new Date().toISOString(),
      candidateName: newCv.personalInfo?.fullName || 'Nouveau Candidat',
      candidateRole: newCv.personalInfo?.jobTitle || '',
      viewCount: 0
    }, ...prev]);

    setCurrentCv(newCv);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
    setCurrentView('editor');
  };

  const handleCreateNew = () => {
    navigateWithUnsavedCheck(() => doCreateNew());
  };

  // 7. Duplicate CV
  const doDuplicate = async (id: string) => {
    if (!isAuthenticated) {
      // In Guest Mode: duplicate purely in local state and localStorage, zero backend call
      const dupId = `guest-cv-${Date.now()}`;
      const dupCv: CVData = {
        ...currentCv,
        id: dupId,
        title: `${currentCv.title || 'CV'} (Copie)`,
        slug: `cv-${Date.now()}`,
        isPublished: false,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('cv_studio_guest_draft', JSON.stringify(dupCv));
      } catch {}
      setCvList(prev => [{
        id: dupCv.id,
        title: dupCv.title,
        templateId: dupCv.templateId,
        isPublished: false,
        slug: dupCv.slug,
        updatedAt: dupCv.updatedAt,
        candidateName: dupCv.personalInfo?.fullName || 'Candidat',
        candidateRole: dupCv.personalInfo?.jobTitle || 'Métier Cible',
        viewCount: 0
      }, ...prev]);
      setCurrentCv(dupCv);
      setHasUnsavedChanges(false);
      setValidationErrors([]);
      setCurrentView('editor');
      return;
    }

    try {
      const res = await authFetch(`/api/cvs/${id}/duplicate`, { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        const dup = ensureValidCVData(json.data);
        setCvList(prev => [{
          id: dup.id || `cv-${Date.now()}`,
          title: dup.title || 'CV Copie',
          templateId: dup.templateId,
          isPublished: dup.isPublished || false,
          slug: dup.slug || `cv-${Date.now()}`,
          updatedAt: dup.updatedAt || new Date().toISOString(),
          candidateName: dup.personalInfo?.fullName || 'Candidat',
          candidateRole: dup.personalInfo?.jobTitle || 'Métier Cible',
          viewCount: 0
        }, ...prev]);
        setCurrentCv(dup);
        setHasUnsavedChanges(false);
        setValidationErrors([]);
        setCurrentView('editor');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = (id: string) => {
    navigateWithUnsavedCheck(() => doDuplicate(id));
  };

  // 8. Delete CV
  const handleDeleteCV = async (id: string) => {
    if (cvList.length <= 1) return;
    if (isAuthenticated) {
      try {
        await authFetch(`/api/cvs/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
    } else {
      // In Guest Mode: zero backend call
      try {
        localStorage.removeItem('cv_studio_guest_draft');
      } catch {}
    }
    setCvList(prev => prev.filter(c => c.id !== id));
    if (currentCv.id === id) {
      const next = cvList.find(c => c.id !== id);
      if (next) handleSelectCV(next.id);
    }
  };

  // 8.1 Change Template & Theme
  const handleSelectTemplate = (newTemplateId: TemplateId, customTheme?: Partial<ThemeConfig>) => {
    handleUpdateCv(prev => ({
      ...prev,
      templateId: newTemplateId,
      theme: {
        ...prev.theme,
        ...(customTheme || {}),
      }
    }));
  };

  // 9. Fast PDF Export & Telemetry tracking
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    const candidateName = currentCv.personalInfo?.fullName || 'Mon-CV';
    const filename = `CV-${candidateName.replace(/\s+/g, '-')}.pdf`;
    
    // Telemetry tracking (ONLY when authenticated, zero backend calls in guest mode)
    if (isAuthenticated) {
      try {
        authFetch('/api/track/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'pdf',
            cvId: currentCv.id,
            candidateName: currentCv.personalInfo?.fullName,
            title: currentCv.title,
          }),
        }).catch(() => {});
      } catch {}
    }

    await exportCVToPDF('cv-printable-document', filename);
    setIsExportingPDF(false);
  };

  // 10. Toggle Publish with Security & Anti-Scraping parameters
  const handleTogglePublish = async (
    targetState: boolean, 
    newSlug?: string, 
    securityConfig?: CVSecurityConfig, 
    pinCode?: string
  ) => {
    if (!isAuthenticated) {
      // In Guest Mode: zero backend call, open auth modal to invite user to register/login
      setIsPublishModalOpen(false);
      setAuthModalMode('register');
      setIsAuthModalOpen(true);
      return;
    }

    const slugToUse = newSlug || currentCv.slug;
    try {
      const res = await authFetch(`/api/cvs/${currentCv.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isPublished: targetState, 
          customSlug: slugToUse,
          securityConfig: securityConfig || currentCv.securityConfig,
          pinCode: pinCode,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCurrentCv(ensureValidCVData(json.data));
      }
    } catch (e) {
      handleUpdateCv(prev => ({
        ...prev,
        isPublished: targetState,
        slug: slugToUse,
        securityConfig: securityConfig || prev.securityConfig,
      }));
    }
  };

  // If public slug requested in URL, render dedicated public candidate page
  if (publicSlug) {
    return (
      <PublicCVPage
        slug={publicSlug}
        onBackToStudio={() => {
          setPublicSlug(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // If Admin Portal requested in URL (?admin=true or ?view=admin or shortcut), render dedicated Admin Console
  if (isAdminMode) {
    return (
      <AdminPortal
        onBackToStudio={() => {
          setIsAdminMode(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans">
      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-4 lg:gap-6 min-w-0">
            <button 
              onClick={() => navigateWithUnsavedCheck(() => setCurrentView('home'))} 
              className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer focus:outline-hidden shrink-0"
              title="Retour à l'accueil"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  CV Studio
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Cloud
                </span>
              </div>
            </button>

            {/* Desktop Primary Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => navigateWithUnsavedCheck(() => setCurrentView('home'))}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-slate-800 text-sky-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </button>

              <button
                onClick={() => setCurrentView('editor')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'editor'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Éditeur de CV</span>
              </button>

              <button
                onClick={() => navigateWithUnsavedCheck(() => setCurrentView('dashboard'))}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-slate-800 text-sky-400 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Mes CVs ({cvList.length})</span>
              </button>
            </nav>
          </div>

          {/* Right: Key Actions & Mobile Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {currentView === 'editor' && (
              <>
                {/* 1. Modèles & Design button (hidden on mobile, in drawer & form) */}
                <button
                  onClick={() => {
                    setActiveEditorTab('theme');
                    if (mobileTab === 'preview') setMobileTab('form');
                  }}
                  className={`hidden sm:flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ring-1 ring-white/20 ${
                    activeEditorTab === 'theme'
                      ? 'bg-indigo-600 text-white ring-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title="Changer de modèle, couleurs et polices"
                >
                  <Palette className="w-4 h-4 text-indigo-300" />
                  <span className="hidden md:inline">Modèle & Style</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/20 text-white truncate max-w-[90px] md:max-w-[110px]">
                    {TEMPLATES_META.find(t => t.id === currentCv.templateId)?.name || 'Modèle'}
                  </span>
                </button>

                {/* 2. Save / Enregistrer button with dirty indicator */}
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 min-h-[38px] ${
                    hasUnsavedChanges
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/60 shadow-md animate-pulse-subtle'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title="Enregistrer vos modifications sur le CV (Raccourci: Ctrl+S)"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                      <span className="hidden sm:inline">Sauvegarde...</span>
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <Save className="w-3.5 h-3.5 text-white" />
                      <span className="hidden sm:inline">Enregistrer</span>
                      <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping inline-block" />
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Enregistré</span>
                    </>
                  )}
                </button>

                {/* 3. Email Share button (Desktop only) */}
                <button
                  onClick={() => setIsShareEmailOpen(true)}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px]"
                  title="Partager votre CV directement par email"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Email</span>
                </button>

                {/* 4. Share / Publish button */}
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                    currentCv.isPublished
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title={!isAuthenticated ? "Mode anonyme : Se connecter pour garder le CV et déployer le CV" : "Partager et publier sur le web"}
                >
                  {!isAuthenticated ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="hidden md:inline">
                    {currentCv.isPublished ? 'En Ligne' : 'Publier'}
                  </span>
                </button>

                {/* 5. Main Action: Télécharger PDF */}
                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 min-h-[38px]"
                  title="Télécharger votre CV en PDF haute résolution"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden xs:inline">{isExportingPDF ? '...' : 'PDF'}</span>
                </button>
              </>
            )}

            {/* Desktop User Profile / Auth Button */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-200 transition-all cursor-pointer min-h-[38px]"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${user.role === 'ADMIN' ? 'bg-rose-500/30 text-rose-300' : 'bg-sky-500/30 text-sky-300'}`}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white truncate max-w-[100px]">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                    <div className="p-2.5 border-b border-slate-800">
                      <div className="font-bold text-white text-xs">{user.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${user.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}`}>
                          Rôle : {user.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setCurrentView('dashboard');
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span>Mes CVs ({cvList.length})</span>
                    </button>

                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAdminMode(true);
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-rose-950/40 text-rose-300 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-rose-400" />
                        <span>Console Administrateur</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-slate-800 text-rose-400 rounded-lg flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-800/80 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se Déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer min-h-[38px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>
            )}

            {/* Mobile Hamburger Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer"
              title="Menu de navigation"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-2 py-1.5 flex items-center justify-around text-xs font-bold gap-1">
        <button
          onClick={() => navigateWithUnsavedCheck(() => setCurrentView('home'))}
          className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[40px] ${
            currentView === 'home' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Accueil</span>
        </button>
        <button
          onClick={() => setCurrentView('editor')}
          className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[40px] ${
            currentView === 'editor' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Studio</span>
        </button>
        <button
          onClick={() => navigateWithUnsavedCheck(() => setCurrentView('dashboard'))}
          className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[40px] ${
            currentView === 'dashboard' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Mes CVs ({cvList.length})</span>
        </button>
      </div>

      {/* Main Workspace Body */}
      {currentView === 'home' && (
        <LandingHomePage
          onOpenStudio={() => navigateWithUnsavedCheck(() => setCurrentView('editor'))}
          onOpenDashboard={() => navigateWithUnsavedCheck(() => setCurrentView('dashboard'))}
          onOpenDevOps={() => navigateWithUnsavedCheck(() => setCurrentView('devops'))}
          onOpenAdmin={() => navigateWithUnsavedCheck(() => setIsAdminMode(true))}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onSelectTemplate={(templateId) => {
            handleSelectTemplate(templateId);
            setCurrentView('editor');
          }}
        />
      )}

      {currentView === 'dashboard' && (
        <VersionManagerDashboard
          cvList={cvList}
          currentCvId={currentCv.id}
          isAuthenticated={isAuthenticated}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || 'login');
            setIsAuthModalOpen(true);
          }}
          onSelectCV={handleSelectCV}
          onCreateNew={handleCreateNew}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteCV}
          onOpenStudio={() => setCurrentView('editor')}
        />
      )}

      {currentView === 'devops' && (
        <DevOpsArchitectureHub />
      )}

      {currentView === 'editor' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN: Clean 2-Tier Editor (Contenu vs Modèles) */}
          <div className="w-full lg:w-[48%] xl:w-[46%] flex flex-col space-y-4">
            
            {/* 1. Document Title & Save status bar */}
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Edit3 className={`w-4 h-4 shrink-0 transition-colors ${!currentCv.title?.trim() ? 'text-amber-500' : 'text-slate-400'}`} />
                <div className="relative flex-1 min-w-0 flex items-center">
                  <input
                    type="text"
                    value={currentCv.title ?? ''}
                    onChange={(e) => handleUpdateCv(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nom du CV (obligatoire, ex: CV Développeur Web)..."
                    className={`font-bold text-sm text-slate-900 bg-transparent border-b hover:border-slate-300 focus:outline-hidden truncate transition-colors py-0.5 w-full ${
                      !currentCv.title?.trim()
                        ? 'border-amber-300 placeholder:text-amber-400/80 focus:border-amber-500 pr-16'
                        : 'border-transparent focus:border-sky-500'
                    }`}
                    title="Nom de votre document CV (obligatoire pour enregistrer)"
                  />
                  {!currentCv.title?.trim() && (
                    <span className="text-[10px] font-semibold text-amber-700 absolute right-1 top-1/2 -translate-y-1/2 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 pointer-events-none select-none">
                      Requis
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasUnsavedChanges ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Modifié</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">À jour</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving || !hasUnsavedChanges}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    hasUnsavedChanges
                      ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-default opacity-60'
                  }`}
                  title="Sauvegarder les modifications (Raccourci : Ctrl+S)"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Sauvegarder</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Front-end Validation Errors Alert Banner */}
            {validationErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 shadow-xs animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-rose-950">Veuillez corriger les informations suivantes avant d'enregistrer :</h4>
                    <ul className="list-disc list-inside space-y-0.5 text-rose-800">
                      {validationErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValidationErrors([])}
                    className="text-rose-400 hover:text-rose-700 font-bold p-1 cursor-pointer"
                    title="Fermer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Save Success Toast Banner */}
            {saveSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveSuccessMessage(null)}
                  className="text-emerald-500 hover:text-emerald-800 cursor-pointer"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Anonymous Notice Banner (Compact) */}
            {!isAuthenticated && (
              <div className="bg-amber-50/90 border border-amber-200/90 px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2.5 text-amber-900 shadow-2xs text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">
                    Mode Invité • Pour sauvegarder en ligne et déployer :
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 transition-colors cursor-pointer"
                >
                  Se connecter
                </button>
              </div>
            )}

            {/* Mobile Switcher (Only on phone/small tablet) */}
            <div className="flex lg:hidden bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setMobileTab('form')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mobileTab === 'form' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📝 Modifier le CV
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mobileTab === 'preview' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👁️ Voir l'Aperçu
              </button>
            </div>

            {/* Dual Navigation: 1. Contenu du CV (Sections) & 2. Apparence & Modèle (Isolé & Mis en valeur) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {/* 1. Contenu & Rédaction (6 Sections) */}
              <div className="flex-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                  {[
                    { id: 'info', label: 'Profil', icon: User },
                    { id: 'experiences', label: 'Expériences', icon: Briefcase },
                    { id: 'education', label: 'Formation', icon: GraduationCap },
                    { id: 'skills', label: 'Compétences', icon: Cpu },
                    { id: 'projects', label: 'Projets', icon: FolderGit2 },
                    { id: 'languages', label: 'Langues', icon: Award },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeEditorTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveEditorTab(tab.id as any);
                          if (mobileTab === 'preview') setMobileTab('form');
                        }}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Apparence & Modèle (Totalement Isolé & Mis en valeur) */}
              <div className="shrink-0 bg-white p-1.5 rounded-2xl border border-indigo-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditorTab('theme');
                    if (mobileTab === 'preview') setMobileTab('form');
                  }}
                  className={`w-full md:w-auto flex items-center justify-between md:justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeEditorTab === 'theme'
                      ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-xs ring-2 ring-indigo-300'
                      : 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                  }`}
                  title="Modifier le modèle (6 formats ATS), les couleurs, polices et marges"
                >
                  <div className="flex items-center gap-1.5">
                    <Palette className={`w-4 h-4 shrink-0 ${activeEditorTab === 'theme' ? 'text-indigo-200' : 'text-indigo-600'}`} />
                    <span>Apparence & Design</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono truncate max-w-[100px] ${
                    activeEditorTab === 'theme'
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-600/10 text-indigo-700 border border-indigo-300/40'
                  }`}>
                    {TEMPLATES_META.find(t => t.id === currentCv.templateId)?.name || 'Modèle'}
                  </span>
                </button>
              </div>
            </div>

            {/* 4. Active Form Card */}
            <div className={`bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex-1 ${
              mobileTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}>
              {activeEditorTab === 'info' && (
                <PersonalInfoForm
                  personalInfo={currentCv.personalInfo}
                  onChange={(updated) => handleUpdateCv(prev => ({ 
                    ...prev, 
                    personalInfo: updated,
                    theme: {
                      ...prev.theme,
                      showPhoto: updated.avatarUrl ? true : prev.theme.showPhoto,
                    }
                  }))}
                />
              )}

              {activeEditorTab === 'experiences' && (
                <ExperiencesForm
                  experiences={currentCv.experiences}
                  onChange={(updated) => handleUpdateCv(prev => ({ ...prev, experiences: updated }))}
                />
              )}

              {activeEditorTab === 'education' && (
                <EducationForm
                  education={currentCv.education}
                  onChange={(updated) => handleUpdateCv(prev => ({ ...prev, education: updated }))}
                />
              )}

              {activeEditorTab === 'skills' && (
                <SkillsForm
                  skills={currentCv.skills}
                  onChange={(updated) => handleUpdateCv(prev => ({ ...prev, skills: updated }))}
                />
              )}

              {activeEditorTab === 'projects' && (
                <ProjectsForm
                  projects={currentCv.projects}
                  onChange={(updated) => handleUpdateCv(prev => ({ ...prev, projects: updated }))}
                />
              )}

              {activeEditorTab === 'languages' && (
                <LanguagesAndCertsForm
                  languages={currentCv.languages}
                  certifications={currentCv.certifications}
                  interests={currentCv.interests}
                  onLanguagesChange={(updated) => handleUpdateCv(prev => ({ ...prev, languages: updated }))}
                  onCertificationsChange={(updated) => handleUpdateCv(prev => ({ ...prev, certifications: updated }))}
                  onInterestsChange={(updated) => handleUpdateCv(prev => ({ ...prev, interests: updated }))}
                />
              )}

              {activeEditorTab === 'theme' && (
                <ThemeCustomizer
                  templateId={currentCv.templateId}
                  theme={currentCv.theme}
                  onTemplateChange={(tmplId) => handleUpdateCv(prev => ({ ...prev, templateId: tmplId }))}
                  onThemeChange={(updatedTheme) => handleUpdateCv(prev => ({ ...prev, theme: updatedTheme }))}
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Clean Live CV Preview */}
          <div className={`w-full lg:w-[52%] xl:w-[54%] flex flex-col items-center space-y-3 ${
            mobileTab === 'form' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Simple Preview Toolbar */}
            <div className="w-full max-w-[820px] bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
              
              {/* Left: Indicator */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span>Aperçu de votre CV (A4)</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">
                  • Modèle {TEMPLATES_META.find(t => t.id === currentCv.templateId)?.name}
                </span>
              </div>

              {/* Right: Zoom & Quick PDF Download */}
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewScale(Math.max(0.5, previewScale - 0.05))}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Dézoomer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-slate-700 text-xs w-10 text-center font-bold">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewScale(Math.min(1.2, previewScale + 0.05))}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Zoomer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Télécharger en PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>
            </div>

            {/* CV Canvas */}
            <div className="w-full flex justify-center overflow-x-auto pb-8">
              <CVPreviewRenderer
                data={currentCv}
                scale={previewScale}
                onEditSection={(section) => {
                  setActiveEditorTab(section);
                  setMobileTab('form');
                }}
              />
            </div>
          </div>

          {/* Floating Mobile Toggle Button (Only on mobile/small screens in editor) */}
          <div className="lg:hidden fixed bottom-5 right-5 z-30">
            <button
              type="button"
              onClick={() => setMobileTab(mobileTab === 'form' ? 'preview' : 'form')}
              className="px-4 py-2.5 rounded-full bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-xs flex items-center gap-2 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer ring-2 ring-sky-500/40"
            >
              {mobileTab === 'form' ? (
                <>
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Aperçu du CV</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-sky-400" />
                  <span>Modifier le formulaire</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Discreet Footer with Admin Console Access */}
      <footer className="mt-auto py-4 px-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">CV Studio Cloud</span>
            <span>•</span>
            <span>Générateur de CV Professionnel & Publication Web</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWithUnsavedCheck(() => setIsAdminMode(true))}
              className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-300 transition-colors cursor-pointer text-[11px]"
              title="Accéder à la console d'administration (ou utilisez le paramètre ?admin=true ou Ctrl+Shift+A)"
            >
              <Server className="w-3 h-3" />
              <span>Console Admin & Données</span>
              <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Ctrl+Shift+A
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* MOBILE NAVIGATION DRAWER */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentView={currentView}
        onNavigate={(view) => navigateWithUnsavedCheck(() => setCurrentView(view))}
        cvCount={cvList.length}
        currentCv={currentCv}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={() => handleSave()}
        onOpenTheme={() => {
          setActiveEditorTab('theme');
          setMobileTab('form');
        }}
        onOpenShareEmail={() => setIsShareEmailOpen(true)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onExportPDF={handleExportPDF}
        isExportingPDF={isExportingPDF}
        user={user}
        isAuthenticated={isAuthenticated}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onLogout={logout}
        onOpenAdmin={() => navigateWithUnsavedCheck(() => setIsAdminMode(true))}
      />

      {/* MODALS */}
      {/* 1. Direct Email Share Modal */}
      <ShareEmailModal
        isOpen={isShareEmailOpen}
        onClose={() => setIsShareEmailOpen(false)}
        cvTitle={currentCv.title || 'Mon CV'}
        candidateName={currentCv.personalInfo?.fullName || 'Candidat'}
        candidateJob={currentCv.personalInfo?.jobTitle || 'Professionnel'}
        publicUrl={`${window.location.origin}/?p=${currentCv.slug}`}
      />

      {/* 3. Dedicated Web Deploy Modal */}
      <WebPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        cvId={currentCv.id}
        slug={currentCv.slug}
        isPublished={currentCv.isPublished}
        viewCount={currentCv.viewCount || 0}
        publishedAt={currentCv.publishedAt}
        securityConfig={currentCv.securityConfig}
        isAuthenticated={isAuthenticated}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onTogglePublish={handleTogglePublish}
      />

      {/* 4. Secure Authentication & RBAC Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* 5. Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onSaveAndProceed={handleModalSaveAndProceed}
        onDiscardAndProceed={handleModalDiscardAndProceed}
        onCancel={handleModalCancel}
        isSaving={isSaving}
      />
    </div>
  );
}

export default App;
