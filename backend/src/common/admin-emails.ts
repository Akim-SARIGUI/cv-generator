import { ConfigService } from '@nestjs/config';

export function adminEmails(config: ConfigService): Set<string> {
  const raw = config.get<string>('ADMIN_EMAILS') ?? '';
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}
