import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface StatusChartProps {
  data: {
    draft: number;
    sent: number;
    paid: number;
    cancelled: number;
  };
}

const COLORS = {
  draft: '#94a3b8',     // slate-400
  sent: '#60a5fa',      // blue-400
  paid: '#4ade80',      // green-400
  cancelled: '#f87171',  // red-400
};

const LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  cancelled: 'Annulée',
};

/** Graphe Donut pour la répartition des statuts */
export default function StatusChart({ data }: StatusChartProps) {
  const chartData = [
    { name: LABELS.draft, value: data.draft, color: COLORS.draft },
    { name: LABELS.sent, value: data.sent, color: COLORS.sent },
    { name: LABELS.paid, value: data.paid, color: COLORS.paid },
    { name: LABELS.cancelled, value: data.cancelled, color: COLORS.cancelled },
  ].filter(d => d.value > 0);

  const total = Object.values(data).reduce((acc, val) => acc + val, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col h-[400px]">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Répartition des statuts</h3>
      
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
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
          <span className="text-2xl font-bold text-slate-800">{total}</span>
          <span className="text-xs text-slate-400">Factures</span>
        </div>
      </div>

      {/* Légende personnalisée */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }} 
            />
            <span className="text-xs text-slate-500 truncate">{label}</span>
            <span className="text-xs font-semibold text-slate-700 ml-auto">{data[key as keyof typeof data]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
