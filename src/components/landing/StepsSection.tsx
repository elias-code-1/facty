import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FilePlus, Send } from 'lucide-react';

export default function StepsSection({ content }: { content: Record<string, any> }) {
  const steps = content.steps_items || [
    {
      icon: 'UserPlus',
      title: 'Créez votre compte',
      description: 'Inscrivez-vous gratuitement en quelques secondes et configurez votre profil professionnel.'
    },
    {
      icon: 'FilePlus',
      title: 'Générez votre facture',
      description: 'Ajoutez vos clients, vos articles et créez une facture professionnelle personnalisée.'
    },
    {
      icon: 'Send',
      title: 'Envoyez et soyez payé',
      description: 'Téléchargez votre facture en PDF ou envoyez-la directement par email à votre client.'
    }
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'UserPlus': return <UserPlus size={32} />;
      case 'FilePlus': return <FilePlus size={32} />;
      case 'Send': return <Send size={32} />;
      default: return <UserPlus size={32} />;
    }
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {content.steps_title || 'Comment ça marche ?'}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            {content.steps_subtitle || 'Facty est conçu pour être simple et intuitif. Commencez en 3 étapes.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-slate-100 -z-10" />

          {steps.map((step: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 relative">
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {index + 1}
                </span>
                {getIcon(step.icon)}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
