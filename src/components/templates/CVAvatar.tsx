import React, { useState, useEffect } from 'react';
import { usePreviewEdit } from '../../context/PreviewEditContext';
import { SkeletonPhotoPlaceholder } from './TemplateSkeletonPlaceholders';
import { PhotoShape } from '../../types';

interface CVAvatarProps {
  avatarUrl?: string;
  fullName?: string;
  primaryColor?: string;
  shape?: PhotoShape;
  sizeClassName?: string;
  showPhoto?: boolean;
  className?: string;
  dark?: boolean;
  borderClassName?: string;
  withStatusBadge?: boolean;
  extraImgClass?: string;
  objectPosition?: string;
  zoom?: number;
}

export const CVAvatar: React.FC<CVAvatarProps> = ({
  avatarUrl,
  fullName = 'Photo de profil',
  primaryColor = '#0284c7',
  shape = 'round',
  sizeClassName = 'w-24 h-24 sm:w-28 sm:h-28',
  showPhoto = true,
  className = '',
  dark = false,
  borderClassName = 'border-2',
  withStatusBadge = false,
  extraImgClass = '',
  objectPosition = '50% 50%',
  zoom = 1,
}) => {
  const [imageError, setImageError] = useState(false);
  const { isInteractive } = usePreviewEdit();

  // Reset error state if avatarUrl changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  // If user explicitly disabled photos and has no avatar, hide
  if (showPhoto === false && !avatarUrl) {
    return null;
  }

  const shapeClass = 
    shape === 'round' ? 'rounded-full' :
    shape === 'rounded' ? 'rounded-2xl' :
    'rounded-none';

  // If avatarUrl exists and has not errored
  if (avatarUrl && !imageError) {
    // Translate-based framing: focal point (0-100) + zoom map to a pan offset
    // that is inherently clamped to the image edges. Must match the editor.
    const [fxRaw, fyRaw] = (objectPosition || '50% 50%').split(' ');
    const focalX = Number.isFinite(Number.parseInt(fxRaw, 10)) ? Number.parseInt(fxRaw, 10) : 50;
    const focalY = Number.isFinite(Number.parseInt(fyRaw, 10)) ? Number.parseInt(fyRaw, 10) : 50;
    const translateX = (50 - focalX) * (zoom - 1);
    const translateY = (50 - focalY) * (zoom - 1);
    return (
      <div className={`relative shrink-0 ${className}`}>
        <div
          className={`${sizeClassName} ${shapeClass} ${borderClassName} overflow-hidden shadow-sm`}
          style={{ borderColor: primaryColor }}
        >
          <img
            src={avatarUrl}
            alt={fullName || 'Photo de profil'}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover ${extraImgClass}`}
            style={{ transform: `translate(${translateX}%, ${translateY}%) scale(${zoom})` }}
          />
        </div>
        {withStatusBadge && (
          <div 
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" 
            title="Disponible" 
          />
        )}
      </div>
    );
  }

  // If no avatarUrl or image error:
  // In interactive edit mode: show the skeleton placeholder so the slot is preserved and clickable
  if (isInteractive) {
    return (
      <div className={`relative shrink-0 ${className}`}>
        <SkeletonPhotoPlaceholder
          primaryColor={primaryColor}
          shape={shape}
          sizeClassName={sizeClassName}
          dark={dark}
        />
        {withStatusBadge && (
          <div 
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" 
            title="Disponible" 
          />
        )}
      </div>
    );
  }

  // In non-interactive mode (export PDF or public view without photo): return null
  return null;
};
