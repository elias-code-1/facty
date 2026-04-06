import React from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface InvoiceFiltersProps {
  activeStatus: string | null;
  onStatusChange: (status: string | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalCount: number;
  filteredCount: number;
}

/** Barre de filtres pour les factures */
export default function InvoiceFilters({
  activeStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount
}: InvoiceFiltersProps) {
  const tabs = [
    { id: null, label: 'Toutes' },
    { id: 'draft', label: 'Brouillons' },
    { id: 'sent', label: 'Envoyées' },
    { id: 'paid', label: 'Payées' },
    { id: 'cancelled', label: 'Annulées' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par N° ou client..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results Count */}
        {filteredCount !== totalCount && (
          <p className="text-slate-400 text-sm font-medium">
            {filteredCount} résultat{filteredCount > 1 ? 's' : ''} sur {totalCount}
          </p>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id || 'all'}
            onClick={() => onStatusChange(tab.id)}
            className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeStatus === tab.id
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {activeStatus === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-indigo-600 rounded-xl"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
