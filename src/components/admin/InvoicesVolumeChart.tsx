import React from 'react';
import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'motion/react';
import { formatCurrency } from '../../utils/format';

interface InvoicesVolumeChartProps {
  data: {
    month: string;
    count: number;
    revenue: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl">
        <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-xs text-indigo-600 flex justify-between gap-4">
            <span>Factures:</span>
            <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-xs text-emerald-600 flex justify-between gap-4">
            <span>Revenus:</span>
            <span className="font-bold">{formatCurrency(payload[1].value)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function InvoicesVolumeChart({ data }: InvoicesVolumeChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
    >
      <h3 className="text-lg font-bold text-slate-800 mb-6">Volume de facturation</h3>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(val) => `${val / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
            />
            <Bar 
              yAxisId="left"
              name="Nombre de factures"
              dataKey="count" 
              fill="#e0e7ff" 
              radius={[4, 4, 0, 0]} 
              barSize={40}
            />
            <Area 
              yAxisId="right"
              name="Revenus (FCFA)"
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
