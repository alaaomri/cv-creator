import React, { useState } from 'react';
import { Mail, Phone, Eye, EyeOff, Lock, Check } from 'lucide-react';
import { usePreviewEdit } from '../../context/PreviewEditContext';

interface ProtectedContactItemProps {
  type: 'email' | 'phone';
  value: string;
  iconColor?: string;
  className?: string;
}

/**
 * Obfuscates sensitive contact information (Email / Phone)
 * against automated regex scrapers and web crawlers.
 * When maskContactInfo is enabled on the CV:
 * - Shows an obfuscated preview (e.g., "a***@***.com" or "+33 6 ** ** ** 12")
 * - Clicking "Afficher" or clicking the item reveals the full information in-place.
 */
export const ProtectedContactItem: React.FC<ProtectedContactItemProps> = ({
  type,
  value,
  iconColor = '#0284c7',
  className = '',
}) => {
  const { maskContactInfo } = usePreviewEdit();
  const [revealed, setRevealed] = useState(false);

  if (!value) return null;

  // If masking is not activated for this CV, display normally
  if (!maskContactInfo) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        {type === 'email' ? (
          <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: iconColor }} />
        ) : (
          <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: iconColor }} />
        )}
        <span className="break-all">{value}</span>
      </span>
    );
  }

  // Obfuscate value for automated scrapers
  const getMaskedValue = () => {
    if (type === 'email') {
      const [user, domain] = value.split('@');
      if (!domain) return '••••••@••••.com';
      const maskedUser = user.length > 2 ? `${user[0]}•••${user[user.length - 1]}` : '••••';
      const domainParts = domain.split('.');
      const tld = domainParts.pop() || 'com';
      return `${maskedUser}@••••.${tld}`;
    } else {
      // Phone masking
      const digits = value.replace(/\s+/g, '');
      if (digits.length <= 4) return '••••••••';
      const start = digits.slice(0, 3);
      const end = digits.slice(-2);
      return `${start} •• •• •• ${end}`;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {type === 'email' ? (
        <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: iconColor }} />
      ) : (
        <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: iconColor }} />
      )}
      
      {revealed ? (
        <span className="break-all font-medium text-slate-800 animate-fadeIn flex items-center gap-1">
          <span>{value}</span>
          <span 
            onClick={(e) => { e.stopPropagation(); setRevealed(false); }}
            title="Masquer à nouveau"
            className="cursor-pointer text-slate-400 hover:text-slate-600 no-print ml-1"
          >
            <EyeOff className="w-3 h-3" />
          </span>
        </span>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setRevealed(true);
          }}
          title="Cliquez pour afficher les coordonnées complètes (Protection anti-robot)"
          className="inline-flex items-center gap-1 font-mono text-xs text-slate-600 hover:text-indigo-700 bg-slate-100/90 hover:bg-indigo-50/80 px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer group select-none"
        >
          <span>{getMaskedValue()}</span>
          <span className="text-[10px] font-sans font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5 ml-0.5">
            <Eye className="w-2.5 h-2.5" />
            <span>Afficher</span>
          </span>
        </button>
      )}
    </span>
  );
};
