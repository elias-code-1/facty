import React from 'react';
import { motion } from 'motion/react';
import { Wrench } from 'lucide-react';

interface MaintenanceProps {
  title: string;
  message: string;
}

export default function Maintenance({ title, message }: MaintenanceProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Particules / Pulse subtil */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20"
      />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold text-white mb-12 tracking-tight">Invoxa</h1>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 mb-8 shadow-2xl"
        >
          <Wrench size={40} className="text-indigo-400" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
          {message}
        </p>
        <p className="text-indigo-400 font-medium text-sm">
          Nous serons de retour très bientôt.
        </p>
      </div>
    </div>
  );
}
