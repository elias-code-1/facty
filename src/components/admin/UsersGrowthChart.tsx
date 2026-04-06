import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'motion/react';

interface UsersGrowthChartProps {
  data: {
    month: string;
    total: number;
    new: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl">
        <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-xs text-indigo-600 flex justify-between gap-4">
            <span>Total:</span>
            <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-xs text-blue-400 flex justify-between gap-4">
            <span>Nouveaux:</span>
            <span className="font-bold">{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function UsersGrowthChart({ data }: UsersGrowthChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
    >
      <h3 className="text-lg font-bold text-slate-800 mb-6">Croissance des utilisateurs</h3>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
            />
            <Line
              name="Total utilisateurs"
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              name="Nouveaux inscrits"
              type="monotone"
              dataKey="new"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#60a5fa', strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
