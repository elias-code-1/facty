import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import DynamicIcon from '../ui/DynamicIcon';

export default function ProductSection({ content }: { content: Record<string, any> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const defaultUseCases = [
    { icon: 'Palette', title: 'Freelances & Créatifs', description: 'Facturez vos missions simplement et gardez une trace de vos revenus.' },
    { icon: 'Laptop', title: 'Agences & Tech', description: 'Gérez vos clients et vos projets avec des factures professionnelles.' },
    { icon: 'Wrench', title: 'Artisans & Services', description: 'Envoyez vos devis et factures directement depuis votre mobile sur le terrain.' }
  ];

  const useCases = content.product_use_cases || defaultUseCases;

  const defaultFeatures = [
    { title: 'Gestion des clients', description: 'Enregistrez vos clients pour les réutiliser facilement.' },
    { title: 'Articles illimités', description: 'Créez votre catalogue de services ou produits.' },
    { title: 'Export PDF pro', description: 'Générez des PDF propres et conformes.' },
    { title: 'Suivi des paiements', description: 'Marquez vos factures comme payées en un clic.' }
  ];

  const userFeatures = content.user_features_items || defaultFeatures;

  return (
    <section id="fonctionnalités" className="bg-brand-lightGray py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-geist font-extrabold text-brand-textDark mb-4 tracking-tight">
            {content.product_title || 'Tout ce dont vous avez besoin'}
          </h2>
          <p className="text-lg text-brand-textMuted">
            {content.product_subtitle || 'Une interface claire, des fonctionnalités pensées pour vous faire gagner du temps.'}
          </p>
        </motion.div>

        {/* Screenshots Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-2"
          >
            {content.product_screenshot_1 ? (
              <img src={content.product_screenshot_1} alt="Dashboard" className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-brand-bluePrimary/10 border border-brand-border" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-[400px] bg-brand-border/30 rounded-2xl flex items-center justify-center text-brand-textMuted font-medium border border-brand-border">Screenshot à venir</div>
            )}
          </motion.div>
          <div className="col-span-1 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-1/2"
            >
              {content.product_screenshot_2 ? (
                <img src={content.product_screenshot_2} alt="Feature 1" className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-brand-bluePrimary/10 border border-brand-border" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full min-h-[190px] bg-brand-border/30 rounded-2xl flex items-center justify-center text-brand-textMuted font-medium border border-brand-border">Screenshot à venir</div>
              )}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="h-1/2"
            >
              {content.product_screenshot_3 ? (
                <img src={content.product_screenshot_3} alt="Feature 2" className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-brand-bluePrimary/10 border border-brand-border" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full min-h-[190px] bg-brand-border/30 rounded-2xl flex items-center justify-center text-brand-textMuted font-medium border border-brand-border">Screenshot à venir</div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Mobile Screenshots (Carousel/Stack) */}
        <div className="md:hidden flex flex-col gap-6 mb-16">
          {content.product_screenshot_1 ? (
            <img src={content.product_screenshot_1} alt="Dashboard" className="w-full rounded-2xl shadow-lg border border-brand-border" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full aspect-video bg-brand-border/30 rounded-2xl flex items-center justify-center text-brand-textMuted font-medium border border-brand-border">Screenshot à venir</div>
          )}
          {content.product_screenshot_2 && (
            <img src={content.product_screenshot_2} alt="Feature 1" className="w-full rounded-2xl shadow-lg border border-brand-border" referrerPolicy="no-referrer" />
          )}
        </div>

        {/* Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {useCases.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
              className="bg-brand-white rounded-2xl p-6 shadow-sm border border-brand-border/50 hover:shadow-lg transition-shadow"
            >
              <div className="text-brand-bluePrimary mb-4">
                <DynamicIcon name={item.icon} size={36} />
              </div>
              <h3 className="text-xl font-geist font-bold text-brand-textDark mb-2">{item.title}</h3>
              <p className="text-brand-textMuted">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* User Features List */}
        <div className="bg-brand-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-border/50">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-geist font-bold text-brand-textDark">
              {content.user_features_title || 'Fonctionnalités incluses'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {userFeatures.map((feature: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-brand-bluePrimary/10 text-brand-bluePrimary rounded-full flex items-center justify-center mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-bold text-brand-textDark mb-1">{feature.title}</h4>
                  <p className="text-sm text-brand-textMuted leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
