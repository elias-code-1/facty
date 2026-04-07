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

  return (
    <section id="features" className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            {content.product_title || 'Tout ce dont vous avez besoin'}
          </h2>
          <p className="text-lg text-slate-500">
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
              <img src={content.product_screenshot_1} alt="Dashboard" className="w-full h-full object-cover rounded-2xl shadow-xl border border-slate-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-[400px] bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium border border-slate-300">Screenshot à venir</div>
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
                <img src={content.product_screenshot_2} alt="Feature 1" className="w-full h-full object-cover rounded-2xl shadow-xl border border-slate-200" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full min-h-[190px] bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium border border-slate-300">Screenshot à venir</div>
              )}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="h-1/2"
            >
              {content.product_screenshot_3 ? (
                <img src={content.product_screenshot_3} alt="Feature 2" className="w-full h-full object-cover rounded-2xl shadow-xl border border-slate-200" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full min-h-[190px] bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium border border-slate-300">Screenshot à venir</div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Mobile Screenshots (Carousel/Stack) */}
        <div className="md:hidden flex flex-col gap-6 mb-16">
          {content.product_screenshot_1 ? (
            <img src={content.product_screenshot_1} alt="Dashboard" className="w-full rounded-2xl shadow-lg border border-slate-200" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full aspect-video bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium border border-slate-300">Screenshot à venir</div>
          )}
          {content.product_screenshot_2 && (
            <img src={content.product_screenshot_2} alt="Feature 1" className="w-full rounded-2xl shadow-lg border border-slate-200" referrerPolicy="no-referrer" />
          )}
        </div>

        {/* Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
              <div className="text-indigo-600 mb-4">
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
