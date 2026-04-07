import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

export default function CtaSection({ content }: { content: Record<string, any> }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-indigo-600 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {content.cta_title || 'Prêt à simplifier votre facturation ?'}
          </h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            {content.cta_subtitle || 'Rejoignez les indépendants qui font confiance à Facty pour gérer leur activité.'}
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-xl text-lg"
          >
            {content.cta_button || 'Créer mon compte gratuit'}
          </button>
        </motion.div>
      </div>
    </section>
  );
}