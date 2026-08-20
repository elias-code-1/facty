import { Profile } from '../types/database';

/**
 * Vérifie si le profil dispose d'un abonnement premium actif.
 * - vrai si is_premium est true et (premium_expires_at est null ou dans le futur).
 * - faux sinon.
 */
export function isPremiumActive(profile: Partial<Profile> | null | undefined): boolean {
  if (!profile) return false;
  if (!profile.is_premium) return false;

  // Si l'utilisateur est premium mais n'a pas de date d'expiration (ex: 'lifetime' plan), il est premium à vie.
  if (!profile.premium_expires_at) return true;

  // Sinon, on vérifie que la date d'expiration est dans le futur
  const expiresAt = new Date(profile.premium_expires_at);
  return expiresAt.getTime() > Date.now();
}
