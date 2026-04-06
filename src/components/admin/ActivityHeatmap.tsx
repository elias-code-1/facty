import React from 'react';
import { motion } from 'motion/react';
import { HeatmapData } from '../../hooks/useAdminStats';

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

/** Composant pour afficher une heatmap d'activité */
export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Fonction pour obtenir la couleur selon l'intensité
  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count <= 5) return 'bg-indigo-100';
    if (count <= 15) return 'bg-indigo-300';
    if (count <= 30) return 'bg-indigo-500';
    return 'bg-indigo-700';
  };

  return (
    <div className="overflow-x-auto no-scrollbar pb-4">
      <div className="min-w-[600px]">
        <div className="flex gap-1 mb-2 ml-10">
          {days.map(day => (
            <div key={day} className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {hours.map(hour => (
            <div key={hour} className="flex items-center gap-1">
              <div className="w-10 text-right pr-2 text-[10px] font-bold text-slate-400">
                {hour % 3 === 0 ? `${String(hour).padStart(2, '0')}h` : ''}
              </div>
              
              <div className="flex-1 flex gap-1">
                {days.map((_, dayIndex) => {
                  const cell = data.find(d => d.day === dayIndex && d.hour === hour);
                  const count = cell?.count || 0;
                  
                  return (
                    <motion.div
                      key={`${dayIndex}-${hour}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (dayIndex + hour) * 0.005 }}
                      className={`flex-1 h-4 rounded-sm transition-all duration-200 cursor-help hover:ring-2 hover:ring-indigo-400 ${getColor(count)}`}
                      title={`${days[dayIndex]} à ${hour}h : ${count} actions`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
