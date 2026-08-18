import React from 'react';
import { ThemeConfig, TemplateId, FontChoice, PhotoShape } from '../../types';
import { TEMPLATES_META, COLOR_PALETTES } from '../../data/sampleCVs';
import { Palette, Type, Layout, Image as ImageIcon, Check } from 'lucide-react';

interface ThemeCustomizerProps {
  templateId: TemplateId;
  theme: ThemeConfig;
  onTemplateChange: (id: TemplateId) => void;
  onThemeChange: (updated: ThemeConfig) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  templateId,
  theme,
  onTemplateChange,
  onThemeChange,
}) => {
  const handlePaletteSelect = (pal: { primary: string; secondary: string }) => {
    onThemeChange({
      ...theme,
      primaryColor: pal.primary,
      secondaryColor: pal.secondary,
    });
  };

  const FONTS: FontChoice[] = ['Inter', 'Plus Jakarta Sans', 'Merriweather', 'Poppins', 'Roboto Mono', 'Playfair Display'];

  return (
    <div className="space-y-6">
      {/* 1. Template Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-indigo-600" />
            <span>Modèle & Disposition (6 formats ATS & Design)</span>
          </h3>
          <span className="text-[11px] font-medium text-slate-400">
            Aperçu instantané en direct
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {TEMPLATES_META.map((tmpl) => {
            const isSelected = templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onTemplateChange(tmpl.id as TemplateId)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span 
                      className="w-3 h-3 rounded-full shadow-2xs" 
                      style={{ backgroundColor: tmpl.previewColor }}
                    />
                    {isSelected && (
                      <span className="p-0.5 bg-indigo-600 text-white rounded-full">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs text-slate-900">{tmpl.name}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{tmpl.category}</div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {tmpl.tag}
                  </span>
                  <span className="text-[9px] font-medium text-emerald-600 font-mono">
                    ATS Ready
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Palette */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-indigo-600" />
          <span>Palette de Couleurs & Accents</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COLOR_PALETTES.map((pal, idx) => {
            const isSelected = theme.primaryColor === pal.primary;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePaletteSelect(pal)}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left cursor-pointer ${
                  isSelected ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500 shadow-2xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex -space-x-1">
                  <span className="w-4 h-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: pal.primary }} />
                  <span className="w-4 h-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: pal.secondary }} />
                </div>
                <span className="text-xs font-medium text-slate-700 truncate">{pal.name}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Hex input */}
        <div className="flex items-center gap-3 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <label className="text-xs font-medium text-slate-700">Couleur d'accent personnalisée :</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => onThemeChange({ ...theme, primaryColor: e.target.value })}
              className="w-7 h-7 rounded border border-slate-300 cursor-pointer overflow-hidden"
            />
            <input
              type="text"
              value={theme.primaryColor}
              onChange={(e) => onThemeChange({ ...theme, primaryColor: e.target.value })}
              className="w-24 text-xs font-mono px-2 py-1 rounded border border-slate-300 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 3. Typography */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Type className="w-4 h-4 text-indigo-600" />
          <span>Typographie & Polices</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Police des Titres</label>
            <select
              value={theme.fontHeading}
              onChange={(e) => onThemeChange({ ...theme, fontHeading: e.target.value as FontChoice })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Police du Corps de texte</label>
            <select
              value={theme.fontBody}
              onChange={(e) => onThemeChange({ ...theme, fontBody: e.target.value as FontChoice })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Photo Shape & Options */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-indigo-600" />
          <span>Affichage & Forme de la Photo</span>
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showPhoto}
              onChange={(e) => onThemeChange({ ...theme, showPhoto: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Afficher la photo de profil</span>
          </label>

          {theme.showPhoto && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Forme :</span>
              {(['round', 'rounded', 'square'] as PhotoShape[]).map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => onThemeChange({ ...theme, photoShape: shape })}
                  className={`text-xs px-2.5 py-1 rounded-lg border capitalize cursor-pointer font-medium ${
                    theme.photoShape === shape
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {shape === 'round' ? 'Ronde' : shape === 'rounded' ? 'Arrondie' : 'Carrée'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
