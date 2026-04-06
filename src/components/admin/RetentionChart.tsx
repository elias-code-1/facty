import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { RetentionData } from '../../hooks/useAdminStats';

interface RetentionChartProps {
  data: RetentionData[];
}

/** Composant pour afficher la rétention mensuelle */
export default function RetentionChart({ data }: RetentionChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-400 text-sm italic">Pas encore assez de données pour afficher cette statistique</p>
      </div>
    );
  }

  // Formater le mois pour l'affichage (ex: 2024-03 -> Mars 2024)
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(date);
  };

  const chartData = data.map(d => ({
    ...d,
    displayMonth: formatMonth(d.month)
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="displayMonth" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            yAxisId="left" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }}
            labelStyle={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
          />
          
          <ReferenceLine 
            yAxisId="right" 
            y={40} 
            stroke="#f59e0b" 
            strokeDasharray="3 3" 
            label={{ position: 'right', value: 'Objectif 40%', fill: '#f59e0b', fontSize: 10, fontWeight: 700 }} 
          />

          <Bar 
            yAxisId="left" 
            dataKey="registered" 
            name="Inscrits" 
            fill="#e0e7ff" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
          />
          
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="rate" 
            name="Rétention" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
