import { CVData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Client-side validation for CV data before saving to server or local storage.
 * Eliminates redundant server requests for invalid data and provides instant UX feedback.
 */
export function validateCVData(cv: CVData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Titre du document
  if (!cv.title || cv.title.trim().length === 0) {
    errors.push('Le titre du CV est requis (ex: "CV Développeur Full Stack").');
  }

  // 2. Nom et prénom
  const fullName = cv.personalInfo?.fullName?.trim() || '';
  if (fullName.length < 2) {
    errors.push('Le nom complet du candidat est requis (au moins 2 caractères).');
  }

  // 3. Intitulé du poste cible
  const jobTitle = cv.personalInfo?.jobTitle?.trim() || '';
  if (jobTitle.length === 0) {
    errors.push("L'intitulé du poste cible est requis (ex: 'Architecte Cloud').");
  }

  // 4. Validation de l'email si renseigné
  const email = cv.personalInfo?.email?.trim() || '';
  if (email.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push(`L'adresse email "${email}" n'est pas au format valide (nom@domaine.com).`);
    }
  } else {
    warnings.push("Aucune adresse email n'est renseignée dans vos coordonnées.");
  }

  // 5. Validation du téléphone si renseigné
  const phone = cv.personalInfo?.phone?.trim() || '';
  if (phone.length > 0) {
    const cleanedDigits = phone.replace(/[^0-9+]/g, '');
    if (cleanedDigits.length < 6) {
      warnings.push('Le numéro de téléphone semble trop court.');
    }
  }

  // 6. Expériences
  if (Array.isArray(cv.experiences) && cv.experiences.length > 0) {
    cv.experiences.forEach((exp, idx) => {
      if (!exp.role || exp.role.trim().length === 0) {
        errors.push(`Expérience #${idx + 1} : L'intitulé du poste est manquant.`);
      }
      if (!exp.company || exp.company.trim().length === 0) {
        errors.push(`Expérience #${idx + 1} : Le nom de l'entreprise est manquant.`);
      }
    });
  }

  // 7. Formations
  if (Array.isArray(cv.education) && cv.education.length > 0) {
    cv.education.forEach((edu, idx) => {
      if (!edu.degree || edu.degree.trim().length === 0) {
        errors.push(`Formation #${idx + 1} : L'intitulé du diplôme est manquant.`);
      }
      if (!edu.institution || edu.institution.trim().length === 0) {
        errors.push(`Formation #${idx + 1} : Le nom de l'établissement est manquant.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
