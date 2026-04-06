import React from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/invoice';

interface RevenueChartProps {
  data: { month: string; revenue: number; invoices: number }[];
  currency: string;
}

/** Graphe des revenus et factures sur 6 mois */
export default function RevenueChart({ data, currency }: RevenueChartProps) {
  // Si pas assez de données
  const hasData = data.some(d => d.revenue > 0 || d.invoices > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col h-[400px]">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Revenus des 6 derniers mois</h3>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
          Pas encore assez de données pour afficher le graphique
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col h-[400px]">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Revenus des 6 derniers mois</h3>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '13px'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Revenus') return [formatCurrency(value, currency), name];
                return [value, name];
              }}
            />
            
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#64748b' }}
            />
            
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Revenus"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
            
            <Bar
              yAxisId="right"
              dataKey="invoices"
              name="Factures"
              fill="#e2e8f0"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
