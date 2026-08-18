import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

export default function PricingSection({ content }: { content: Record<string, any> }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    "Factures et devis illimités",
    "Gestion illimitée des clients",
    "Export PDF",
    "Personnalisation avec logo",
    "Support prioritaire",
    "Accès aux futures mises à jour"
  ];

  return (
    <section id="tarifs" className="py-24 bg-brand-lightGray border-t border-brand-border/50 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-bluePrimary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-bluePrimary/10 text-brand-bluePrimary font-medium text-sm mb-6">
            <Zap size={16} />
            <span>Offre de lancement</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-geist font-extrabold text-brand-textDark mb-6 tracking-tight">
            Un tarif unique, <br className="hidden md:block" />
            sans abonnement
          </h2>
          <p className="text-lg text-brand-textMuted">
            Payez une seule fois, profitez de Facty pour toujours. Pas de frais mensuels cachés, pas de limite dans le temps.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-brand-white rounded-3xl p-8 border-[2px] border-brand-bluePrimary/20 shadow-xl shadow-brand-bluePrimary/5 relative overflow-hidden">
            {/* Ribbon */}
            <div className="absolute top-6 right-0 bg-brand-bluePrimary text-white text-xs font-bold px-4 py-1.5 rounded-l-full shadow-md">
              Licence à vie
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-geist font-bold text-brand-textDark mb-2">Facty Premium</h3>
              <p className="text-brand-textMuted text-sm mb-6">Tout ce dont vous avez besoin pour facturer comme un pro.</p>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-geist font-extrabold text-brand-textDark">2000</span>
                <span className="text-xl font-bold text-brand-textMuted">FCFA</span>
              </div>
              <p className="text-sm font-medium text-brand-goldCertified bg-brand-goldCertified/10 inline-block px-3 py-1 rounded-full">
                Paiement unique (Lifetime)
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-greenSuccess/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-brand-greenSuccess" />
                  </div>
                  <span className="text-brand-textDark font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-brand-bluePrimary hover:bg-brand-bluePrimary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-bluePrimary/20 flex items-center justify-center gap-2"
            >
              <span>Commencer maintenant</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <p className="text-center text-xs text-brand-textMuted mt-4">
              Version gratuite limitée (3 factures/mois) disponible.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
