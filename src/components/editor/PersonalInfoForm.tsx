import React, { useState, useRef, useEffect } from 'react';
import { PersonalInfo } from '../../types';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Link as LinkIcon, 
  Check, 
  AlertCircle,
  FileImage,
  RefreshCw,
  Camera,
  Move,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  personalInfo,
  onChange,
}) => {
  const [photoSourceMode, setPhotoSourceMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...personalInfo,
      [field]: value,
    });
  };

  const handleAvatarPreset = (url: string) => {
    setFileName(null);
    setUploadError(null);
    handleChange('avatarUrl', url);
  };

  const handleRemovePhoto = () => {
    setFileName(null);
    setUploadError(null);
    handleChange('avatarUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Photo framing: objectPosition stored as "x% y%" (defaults to centered).
  const [rawPosX, rawPosY] = (personalInfo.avatarPosition || '50% 50%').split(' ');
  const posX = Number.parseInt(rawPosX, 10) || 50;
  const posY = Number.parseInt(rawPosY, 10) || 50;
  const zoom = personalInfo.avatarZoom && personalInfo.avatarZoom >= 1 ? personalInfo.avatarZoom : 1;
  const setPhotoPosition = (x: number, y: number) => {
    handleChange('avatarPosition', `${x}% ${y}%`);
  };
  const setPhotoZoom = (z: number) => {
    const clamped = Math.max(1, Math.min(3, Number(z.toFixed(2))));
    onChange({ ...personalInfo, avatarZoom: clamped });
  };
  const recenterPhoto = () => {
    onChange({ ...personalInfo, avatarPosition: '50% 50%', avatarZoom: 1 });
  };

  // Drag-to-reposition (Facebook/Instagram style) using pointer events.
  const photoFrameRef = useRef<HTMLDivElement>(null);
  const photoDragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const clampPct = (v: number) => Math.max(0, Math.min(100, v));

  const handlePhotoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!personalInfo.avatarUrl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    photoDragRef.current = { x: e.clientX, y: e.clientY, px: posX, py: posY };
    setIsDraggingPhoto(true);
  };

  const handlePhotoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = photoDragRef.current;
    const frame = photoFrameRef.current;
    if (!drag || !frame) return;
    // Panning is only possible on the zoom-induced overflow; at 1x the cover
    // image is centered with no room to move.
    const range = zoom - 1;
    if (range <= 0) return;
    const rect = frame.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.x) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.y) / rect.height) * 100;
    const nextX = clampPct(drag.px - dxPct / range);
    const nextY = clampPct(drag.py - dyPct / range);
    setPhotoPosition(Math.round(nextX), Math.round(nextY));
  };

  const handlePhotoPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    photoDragRef.current = null;
    setIsDraggingPhoto(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Mouse-wheel zoom over the staging area (non-passive so it can prevent scroll).
  useEffect(() => {
    const el = photoFrameRef.current;
    if (!el || !personalInfo.avatarUrl) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setPhotoZoom((personalInfo.avatarZoom || 1) + (e.deltaY < 0 ? 0.1 : -0.1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalInfo.avatarUrl, personalInfo.avatarZoom]);

  // Helper to optimize and convert uploaded image file to a lightweight data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Le fichier sélectionné doit être une image (JPG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('L\'image est trop volumineuse (maximum 15 Mo).');
      return;
    }

    setUploadError(null);
    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to scale down image to optimal size (max 512x512)
        const maxDim = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as optimized JPEG data URL
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          handleChange('avatarUrl', optimizedDataUrl);
        } else {
          // Fallback to raw data url if canvas context not supported
          handleChange('avatarUrl', event.target?.result as string);
        }
        setIsProcessing(false);
      };

      img.onerror = () => {
        setUploadError('Impossible de lire cette image. Essayez un autre format.');
        setIsProcessing(false);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setUploadError('Erreur lors du chargement du fichier.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const AVATAR_PRESETS = [
    { label: 'Homme 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { label: 'Homme 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { label: 'Femme 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
    { label: 'Femme 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nom et Prénom *
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={personalInfo.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Titre Professionnel / Métier *
          </label>
          <input
            type="text"
            value={personalInfo.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            placeholder="Ex: Lead Développeur Fullstack React / Spring Boot"
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Adresse Email *
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="email"
              value={personalInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="alexandre@tech.io"
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Téléphone
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Localisation / Ville
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={personalInfo.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Paris, France (Télétravail)"
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Site Web / Portfolio
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="url"
              value={personalInfo.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://monsite.dev"
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Profil LinkedIn
          </label>
          <div className="relative">
            <Linkedin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={personalInfo.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/monprofil"
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Profil GitHub / Code
          </label>
          <div className="relative">
            <Github className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={personalInfo.github}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="github.com/monpseudo"
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Modern Photo Upload & Management Section */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Camera className="w-3.5 h-3.5 text-sky-600" />
            <span>Photo de Profil</span>
          </label>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setPhotoSourceMode('upload')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                photoSourceMode === 'upload'
                  ? 'bg-white text-sky-700 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Fichier</span>
            </button>
            <button
              type="button"
              onClick={() => setPhotoSourceMode('url')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                photoSourceMode === 'url'
                  ? 'bg-white text-sky-700 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Lien URL</span>
            </button>
            <button
              type="button"
              onClick={() => setPhotoSourceMode('presets')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                photoSourceMode === 'presets'
                  ? 'bg-white text-sky-700 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Exemples</span>
            </button>
          </div>
        </div>

        {/* Hidden native file input for manual browse and drag-and-drop */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
          className="hidden"
        />

        {/* TAB 1: File Upload (Drag & Drop + Browse) */}
        {photoSourceMode === 'upload' && (
          <div className="space-y-2.5">
            {personalInfo.avatarUrl ? (
              <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="relative shrink-0">
                  <img
                    src={personalInfo.avatarUrl}
                    alt="Photo de profil"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-sky-500 shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {fileName || 'Photo de profil active'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Optimisée pour le CV et l'export PDF HD
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Remplacer</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  isDragging
                    ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
                    : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/60'
                }`}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center py-2">
                    <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mb-2" />
                    <p className="text-xs font-medium text-slate-700">Optimisation de la photo en cours...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mb-2 border border-sky-100">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Glissez-déposez votre photo ici, ou <span className="text-sky-600 underline">parcourez</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Formats supportés : PNG, JPG, WebP (recadrage et compression automatique)
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Web Image URL */}
        {photoSourceMode === 'url' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={personalInfo.avatarUrl}
                  onChange={(e) => {
                    setFileName(null);
                    handleChange('avatarUrl', e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/... ou lien LinkedIn"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden bg-white"
                />
              </div>
              {personalInfo.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                  title="Supprimer la photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {personalInfo.avatarUrl && (
              <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                <img
                  src={personalInfo.avatarUrl}
                  alt="Aperçu URL"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
                />
                <span className="truncate">Photo liée avec succès depuis l'URL externe</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Quick Presets */}
        {photoSourceMode === 'presets' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500">Sélectionnez un avatar professionnel pour tester le rendu de votre CV :</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVATAR_PRESETS.map((p, i) => {
                const isSelected = personalInfo.avatarUrl === p.url;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAvatarPreset(p.url)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 text-sky-800 font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <span className="text-[11px] truncate flex-1">{p.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-sky-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error message alert if any */}
        {uploadError && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Photo framing: drag to reposition, zoom, and recenter */}
        {personalInfo.avatarUrl && (
          <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <Move className="w-3.5 h-3.5 text-sky-600" />
                Cadrage de la photo
              </span>
              <button
                type="button"
                onClick={recenterPhoto}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Recentrer</span>
              </button>
            </div>

            {/* Rectangular staging area shows the full image; the circle overlay
                marks exactly what will appear as the round avatar. */}
            <div
              ref={photoFrameRef}
              onPointerDown={handlePhotoPointerDown}
              onPointerMove={handlePhotoPointerMove}
              onPointerUp={handlePhotoPointerUp}
              onPointerCancel={handlePhotoPointerUp}
              className={`relative mx-auto w-full max-w-55 aspect-square rounded-lg overflow-hidden bg-slate-900 select-none ${
                isDraggingPhoto ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ touchAction: 'none' }}
            >
              <img
                src={personalInfo.avatarUrl}
                alt="Repositionner la photo"
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
                style={{ transform: `translate(${(50 - posX) * (zoom - 1)}%, ${(50 - posY) * (zoom - 1)}%) scale(${zoom})` }}
              />
              {/* Dim everything outside the circular crop area */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)' }}
              />
              {/* Circle outline + rule-of-thirds guides */}
              <div className="absolute inset-0 rounded-full pointer-events-none ring-2 ring-white/90" />
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
              </div>
            </div>

            {/* Zoom control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPhotoZoom(zoom - 0.1)}
                className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                title="Dézoomer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setPhotoZoom(Number(e.target.value))}
                className="flex-1 h-1.5 accent-sky-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setPhotoZoom(zoom + 0.1)}
                className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                title="Zoomer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-semibold text-slate-500 w-9 text-right tabular-nums">
                {zoom.toFixed(1)}×
              </span>
            </div>

            <p className="inline-flex items-center gap-1 text-[10px] text-slate-500">
              <Move className="w-3 h-3" />
              Zoomez (molette ou curseur), puis glissez la photo pour la recadrer
            </p>
          </div>
        )}
      </div>

      {/* Summary / About Me */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Résumé Professionnel / Profil
        </label>
        <textarea
          rows={4}
          value={personalInfo.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          placeholder="Ex: Ingénieur logiciel passionné par les architectures distribuées et l'optimisation des performances applicatives..."
          className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden leading-relaxed"
        />
      </div>
    </div>
  );
};

