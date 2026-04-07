import { Invoice, Client, InvoiceItem } from '../types/database';

/** Génère un numéro de facture progressif */
export const generateInvoiceNumber = (count: number): string => {
  const paddedCount = String(count + 1).padStart(3, '0');
  return `INV-${paddedCount}`;
};

/** Calcule les totaux d'une facture */
export const calculateTotals = (items: { quantity: number; unit_price: number }[], taxRate: number) => {
  const safeTaxRate = isNaN(taxRate) ? 0 : taxRate;
  const subtotal = items.reduce((acc, item) => {
    const q = isNaN(item.quantity) ? 0 : item.quantity;
    const p = isNaN(item.unit_price) ? 0 : item.unit_price;
    return acc + (q * p);
  }, 0);
  
  const tax_amount = (subtotal * safeTaxRate) / 100;
  const total = subtotal + tax_amount;

  return {
    subtotal,
    tax_amount,
    total
  };
};

/** Liste des devises supportées */
export const CURRENCIES = [
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'USD', label: 'Dollar US ($)', symbol: '$' },
  { code: 'GBP', label: 'Livre Sterling (£)', symbol: '£' },
  { code: 'CAD', label: 'Dollar Canadien ($)', symbol: 'C$' },
  { code: 'CHF', label: 'Franc Suisse (CHF)', symbol: 'CHF' },
  { code: 'FCFA', label: 'Franc CFA (FCFA)', symbol: 'FCFA' },
];

/** Formate un montant en devise locale */
export const formatCurrency = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(amount);
  
  if (currency === 'FCFA') {
    return `${formatted} FCFA`;
  }
  
  const currencyConfig = CURRENCIES.find(c => c.code === currency);
  if (currencyConfig && currencyConfig.code !== 'FCFA') {
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (e) {
      return `${formatted} ${currencyConfig.symbol}`;
    }
  }

  return `${formatted} ${currency}`;
};

/** Formate une date au format DD/MM/YYYY */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR').format(date);
};

/** Génère et télécharge un fichier CSV à partir d'une liste de factures */
export const generateCSV = (
  invoices: (Invoice & { clients: Client | null })[]
): void => {

  const headers = [
    'N° Facture',
    'Client',
    'Email client',
    'Téléphone client',
    'Date émission',
    'Date échéance',
    'Sous-total',
    'TVA (%)',
    'Montant TVA',
    'Total',
    'Statut',
    'Devise'
  ]

  const statusLabel: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    cancelled: 'Annulée'
  }

  const rows = invoices.map((inv) => [
    inv.invoice_number,
    inv.clients?.name ?? 'Client inconnu',
    inv.clients?.email ?? '',
    inv.clients?.phone ?? '',
    formatDate(inv.issue_date),      // DD/MM/YYYY
    formatDate(inv.due_date),        // DD/MM/YYYY
    inv.subtotal.toLocaleString('fr-FR'),
    inv.tax_rate,
    inv.tax_amount.toLocaleString('fr-FR'),
    inv.total.toLocaleString('fr-FR'),
    statusLabel[inv.status] ?? inv.status,
    inv.currency ?? 'FCFA'
  ])

  // Construire le CSV avec BOM UTF-8
  // (pour éviter les problèmes d'accents dans Excel)
  const BOM = '\uFEFF'
  const csvContent = BOM + [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell =>
        `"${String(cell).replace(/"/g, '""')}"`
      ).join(',')
    )
  ].join('\n')

  // Téléchargement
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `facty-factures-${
    new Date().toISOString().split('T')[0]
  }.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
