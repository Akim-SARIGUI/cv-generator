import { BadRequestException, HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/** Messages français renvoyés par l’API. Le front les retraduit via `code`. */
export const API_MESSAGES_FR: Record<string, string> = {
  EMAIL_TAKEN: 'Email ou nom d’utilisateur déjà utilisé',
  INVALID_CREDENTIALS: 'Identifiants invalides',
  USER_NOT_FOUND: 'Utilisateur introuvable',
  RESUME_NOT_FOUND: 'CV introuvable',
  RESUME_FORBIDDEN: 'Accès non autorisé à ce CV',
  RESUME_NONE: 'Aucun CV trouvé',
  RESUME_LAST: 'Impossible de supprimer le dernier CV',
  RESUME_ID_REQUIRED: 'Identifiant de CV requis',
  EDUCATION_NOT_FOUND: 'Formation introuvable',
  EXPERIENCE_NOT_FOUND: 'Expérience introuvable',
  EXTRA_NOT_FOUND: 'Entrée introuvable',
  SKILL_NOT_FOUND: 'Compétence introuvable',
  PERSONAL_NOT_FOUND: 'Infos personnelles introuvables',
  FILE_MISSING: 'Aucun fichier envoyé',
  FILE_REQUIRED: 'Fichier requis',
  FILE_TOO_LARGE: 'Fichier trop volumineux (max 8 Mo)',
  PHOTO_FORMAT: 'Formats acceptés : JPG, PNG, WebP',
  PHOTO_TOO_LARGE: 'Image trop lourde (max 2 Mo)',
  DOC_UNSUPPORTED: 'Format .doc non supporté. Enregistrez en PDF ou DOCX.',
  FORMAT_UNSUPPORTED: 'Format non supporté. Utilisez un PDF, DOCX ou TXT.',
  ADMIN_SELF_DEMOTE: 'Vous ne pouvez pas retirer votre propre rôle administrateur',
  ADMIN_SELF_DELETE:
    'Vous ne pouvez pas supprimer votre propre compte depuis l’administration',
  ADMIN_LAST: 'Impossible de retirer le dernier administrateur',
  'email.isEmail': 'Adresse e-mail invalide',
  'username.minLength': 'Le nom d’utilisateur doit contenir au moins 3 caractères',
  'username.maxLength': 'Le nom d’utilisateur est trop long',
  'username.matches': 'Nom d’utilisateur : lettres, chiffres, . _ - uniquement',
  'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères',
  'password.maxLength': 'Le mot de passe est trop long',
  'title.minLength': 'Le titre est obligatoire',
  'title.maxLength': 'Le titre est trop long',
};

type ExceptionCtor = new (response: string | Record<string, unknown>) => HttpException;

export function coded(ExceptionType: ExceptionCtor, code: string): HttpException {
  return new ExceptionType({
    code,
    message: API_MESSAGES_FR[code] ?? 'Une erreur est survenue',
  });
}

export function validationException(errors: ValidationError[]) {
  const codes: string[] = [];
  const walk = (list: ValidationError[], prefix = '') => {
    for (const err of list) {
      const prop = prefix ? `${prefix}.${err.property}` : err.property;
      if (err.constraints) {
        for (const constraint of Object.keys(err.constraints)) {
          codes.push(`${prop}.${constraint}`);
        }
      }
      if (err.children?.length) walk(err.children, prop);
    }
  };
  walk(errors);
  const message = codes.map(
    (code) => API_MESSAGES_FR[code] ?? 'Information invalide',
  );
  return new BadRequestException({
    code: 'VALIDATION',
    codes,
    message,
  });
}
