import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

export default function CtaSection({ content }: { content: Record<string, any> }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-brand-bluePrimary py-24 relative overflow-hidden">
      {/* Glow effect background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-white/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-geist font-extrabold text-brand-white mb-6 tracking-tight">
            {content.cta_title || 'Prêt à simplifier votre facturation ?'}
          </h2>
          <p className="text-xl text-brand-white/80 mb-10 max-w-2xl mx-auto">
            {content.cta_subtitle || 'Rejoignez les indépendants qui font confiance à Facty pour gérer leur activité.'}
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-brand-white text-brand-bluePrimary px-8 py-4 rounded-xl font-bold hover:bg-brand-lightGray transition-all shadow-2xl hover:-translate-y-1 text-lg"
          >
            {content.cta_button || 'Créer mon compte gratuit'}
          </button>
        </motion.div>
      </div>
    </section>
  );
}