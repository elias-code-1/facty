import React from 'react';
import { motion } from 'framer-motion';
import { FunnelData } from '../../hooks/useAdminStats';

interface FunnelChartProps {
  data: FunnelData;
}

/** Composant pour afficher le funnel d'activation */
export default function FunnelChart({ data }: FunnelChartProps) {
  const steps = [
    { label: 'Inscrits', count: data.registered, key: 'registered' },
    { label: 'Profil complété', count: data.hasProfile, key: 'hasProfile' },
    { label: '1ère facture', count: data.firstInvoice, key: 'firstInvoice' },
    { label: '5+ factures', count: data.fiveInvoices, key: 'fiveInvoices' },
    { label: '10+ factures', count: data.tenInvoices, key: 'tenInvoices' }
  ];

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const prevStep = index > 0 ? steps[index - 1] : null;
        const percentageOfTotal = Math.round((step.count / data.registered) * 100) || 0;
        const dropOff = prevStep ? Math.round(((prevStep.count - step.count) / prevStep.count) * 100) : 0;

        return (
          <div key={step.key} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700 w-32">{step.label}</span>
                <span className="text-xs font-medium text-slate-400">{step.count} users</span>
              </div>
              <div className="flex items-center gap-2">
                {prevStep && dropOff > 0 && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded">
                    -{dropOff}%
                  </span>
                )}
                <span className="text-sm font-bold text-slate-900">{percentageOfTotal}%</span>
              </div>
            </div>
            
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentageOfTotal}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                className="h-full bg-indigo-600 rounded-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
