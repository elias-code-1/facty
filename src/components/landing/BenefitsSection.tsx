import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import DynamicIcon from '../ui/DynamicIcon';

export default function BenefitsSection({ content }: { content: Record<string, any> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const defaultBenefits = [
    { icon: 'Rocket', title: 'Rapide', description: 'Créez une facture en moins de 30 secondes.' },
    { icon: 'Smartphone', title: 'Mobile-first', description: 'Gérez votre activité depuis votre smartphone.' },
    { icon: 'BarChart3', title: 'Tableau de bord', description: 'Suivez votre chiffre d\'affaires en temps réel.' },
    { icon: 'Lock', title: 'Sécurisé', description: 'Vos données sont cryptées et sauvegardées.' },
    { icon: 'Globe', title: 'Multi-devises', description: 'Facturez vos clients partout dans le monde.' },
    { icon: 'Palette', title: 'Personnalisable', description: 'Ajoutez votre logo et vos couleurs.' }
  ];

  const benefits = content.benefits_items || defaultBenefits;

  return (
    <section className="bg-brand-white py-24 border-t border-brand-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-geist font-extrabold text-brand-textDark mb-4 tracking-tight">
            {content.benefits_title || 'Pourquoi choisir Facty ?'}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-brand-bluePrimary/10 text-brand-bluePrimary rounded-full flex items-center justify-center mb-4">
                <DynamicIcon name={item.icon} size={24} />
              </div>
              <h3 className="text-lg font-geist font-bold text-brand-textDark mb-2">{item.title}</h3>
              <p className="text-brand-textMuted text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
