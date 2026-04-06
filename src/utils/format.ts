/** Utilitaires de formatage */

/** Formate un montant en devise */
export const formatCurrency = (amount: number, currency: string = 'FCFA'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency === 'FCFA' ? 'XOF' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
};

/** Formate une date en français */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};
