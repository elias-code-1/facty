import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accentColor: 'indigo' | 'green' | 'blue' | 'violet' | 'orange' | 'emerald' | 'yellow' | 'red';
  index: number;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    iconBg: 'bg-violet-100',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    iconBg: 'bg-red-100',
  },
};

/** Carte de statistique compacte pour le dashboard admin */
export default function AdminStatCard({ title, value, subtitle, icon, accentColor, index }: AdminStatCardProps) {
  const colors = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl p-4 border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center ${colors.text}`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight truncate" title={String(value)}>
          {value}
        </h3>
        <p className="text-xs font-medium text-slate-500 mt-1">{title}</p>
        {subtitle && (
          <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
