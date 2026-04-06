import React from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { InvoiceItemFormData } from '../../hooks/useInvoices';
import { formatCurrency } from '../../utils/invoice';

interface ItemsTableProps {
  items: InvoiceItemFormData[];
  onChange: (items: InvoiceItemFormData[]) => void;
  currency: string;
}

/** Tableau dynamique des articles de la facture */
export default function ItemsTable({ items, onChange, currency }: ItemsTableProps) {
  const handleAddItem = () => {
    if (items.length >= 20) return;
    const newItem: InvoiceItemFormData = {
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemFormData, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'description') {
      item.description = value as string;
    } else {
      const numValue = isNaN(Number(value)) ? 0 : Number(value);
      if (field === 'quantity') item.quantity = numValue;
      if (field === 'unit_price') item.unit_price = numValue;
      
      const q = isNaN(item.quantity) ? 0 : item.quantity;
      const p = isNaN(item.unit_price) ? 0 : item.unit_price;
      item.total = q * p;
    }

    newItems[index] = item;
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {/* Table View (Tablet/Desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-tl-xl">Description</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Qté</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Prix unit.</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 text-right">Total</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12 rounded-tr-xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                <td className="p-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Description du produit ou service..."
                    className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1.5 outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1.5 outline-none text-center"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1.5 outline-none text-right"
                  />
                </td>
                <td className="p-4 text-right font-medium text-slate-700 bg-slate-50/30">
                  {formatCurrency(item.total, currency)}
                </td>
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card View (Mobile) */}
      <div className="md:hidden space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              disabled={items.length <= 1}
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
            >
              <Trash2 size={16} />
            </button>
            
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Prestation..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Qté</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Prix unit.</label>
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total</span>
                <span className="text-sm font-bold text-indigo-600">{formatCurrency(item.total, currency)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        disabled={items.length >= 20}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
      >
        <Plus size={18} />
        Ajouter une ligne
      </button>
    </div>
  );
}
