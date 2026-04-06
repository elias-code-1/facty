import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';

interface StatusDistributionChartProps {
  data: {
    draft: number;
    sent: number;
    paid: number;
    cancelled: number;
  };
}

const COLORS = {
  draft: '#94a3b8',     // slate-400
  sent: '#6366f1',      // indigo-500
  paid: '#10b981',      // emerald-500
  cancelled: '#ef4444',  // red-500
};

const LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  cancelled: 'Annulée',
};

/** Graphe Donut pour la répartition globale des statuts */
export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = [
    { name: LABELS.draft, value: data.draft, color: COLORS.draft },
    { name: LABELS.sent, value: data.sent, color: COLORS.sent },
    { name: LABELS.paid, value: data.paid, color: COLORS.paid },
    { name: LABELS.cancelled, value: data.cancelled, color: COLORS.cancelled },
  ].filter(d => d.value > 0);

  const total = Object.values(data).reduce((acc, val) => acc + val, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col h-full min-h-[400px]"
    >
      <h3 className="text-lg font-bold text-slate-800 mb-6">Répartition globale des statuts</h3>
      
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Label au centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-slate-800">{total}</span>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
        </div>
      </div>

      {/* Légende personnalisée */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/50">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }} 
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{label}</span>
              <span className="text-sm font-bold text-slate-700">{data[key as keyof typeof data]}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
