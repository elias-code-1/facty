import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  accentColor: 'indigo' | 'green' | 'orange' | 'blue';
  index: number;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
};

/** Carte de statistique pour le dashboard */
export default function StatCard({ title, value, subtitle, icon, accentColor, index }: StatCardProps) {
  const colors = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100"
    >
      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text}`}>
        {icon}
      </div>
      
      <div className="mt-3">
        <h3 className="text-xl md:text-2xl xl:text-3xl font-bold text-slate-800 tracking-tight truncate" title={String(value)}>
          {value}
        </h3>
        <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">{title}</p>
        <p className="text-[10px] md:text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </motion.div>
  );
}
