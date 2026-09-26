import { join } from 'path';

/** Racine des fichiers uploadés (toujours `backend/uploads`). */
export function uploadsRoot() {
  return join(__dirname, '..', '..', 'uploads');
}

export function resolveUploadAbsolute(photoUrl: string) {
  return join(uploadsRoot(), photoUrl.replace(/^\/uploads\/?/, ''));
}
