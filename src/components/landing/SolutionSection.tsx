import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function SolutionSection({ content }: { content: Record<string, any> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const defaultStats = [
    { number: '30s', label: 'Pour créer une facture' },
    { number: '100%', label: 'Conforme et professionnel' },
    { number: '0€', label: 'Pour commencer' }
  ];

  const stats = content.solution_stats || defaultStats;

  return (
    <section className="bg-brand-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-geist font-extrabold text-brand-textDark mb-8">
            {content.solution_title || 'La solution simple et rapide'}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-brand-border">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="pt-8 sm:pt-0 flex flex-col items-center">
                <span className="text-5xl font-geist font-bold text-brand-bluePrimary mb-2">{stat.number}</span>
                <span className="text-brand-textMuted text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
          
          <div className="w-16 h-1 bg-brand-bluePrimary mx-auto mt-12 rounded-full"></div>
        </motion.div>
      </div>
    </section>
  );
}
