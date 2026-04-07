import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import DynamicIcon from '../ui/DynamicIcon';

export default function ProblemSection({ content }: { content: Record<string, any> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const defaultItems = [
    { icon: 'Clock', title: 'Perte de temps', description: 'Des heures passées sur Word ou Excel à formater des factures.' },
    { icon: 'Banknotes', title: 'Retards de paiement', description: 'Pas de suivi clair des factures impayées ou en retard.' },
    { icon: 'Calculator', title: 'Erreurs de calcul', description: 'TVA, totaux... les erreurs manuelles coûtent cher.' }
  ];

  const items = content.problem_items || defaultItems;

  return (
    <section id="problem" className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            {content.problem_title || 'La facturation ne devrait pas être une corvée'}
          </h2>
          <p className="text-lg text-slate-500">
            {content.problem_subtitle || 'La plupart des indépendants perdent un temps précieux sur des tâches administratives.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-red-200 hover:border-red-400 transition-colors"
            >
              <div className="text-red-500 mb-4">
                <DynamicIcon name={item.icon} size={36} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
