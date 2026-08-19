import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

export default function TestimonialsSection({ content }: { content: Record<string, any> }) {
  const testimonials = content.testimonials_items || [
    {
      name: 'Thomas Martin',
      role: 'Freelance Designer',
      content: 'Facty a totalement changé ma façon de facturer. Je gagne au moins 2 heures par semaine sur ma gestion administrative.',
      avatar: 'https://i.pravatar.cc/150?u=thomas'
    },
    {
      name: 'Sarah Benali',
      role: 'Consultante Marketing',
      content: 'L\'interface est incroyablement intuitive. Mes clients reçoivent des factures professionnelles et je suis payée plus rapidement.',
      avatar: 'https://i.pravatar.cc/150?u=sarah'
    },
    {
      name: 'Julien Lefebvre',
      role: 'Développeur Web',
      content: 'Enfin un outil simple qui ne demande pas une formation de comptable pour être utilisé. Je recommande à 100%.',
      avatar: 'https://i.pravatar.cc/150?u=julien'
    }
  ];

  return (
    <section className="py-24 bg-brand-white border-t border-brand-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-geist font-extrabold text-brand-textDark mb-4 tracking-tight">
            {content.testimonials_title || 'Ils nous font confiance'}
          </h2>
          <p className="text-brand-textMuted max-w-2xl mx-auto text-lg">
            {content.testimonials_subtitle || 'Découvrez pourquoi des centaines de professionnels choisissent Facty pour leur facturation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-brand-lightGray p-8 rounded-3xl border border-brand-border/50 relative group hover:bg-brand-white hover:shadow-2xl hover:shadow-brand-bluePrimary/5 hover:border-brand-bluePrimary/20 transition-all duration-300"
            >
              <div className="absolute -top-4 left-8 w-10 h-10 bg-brand-bluePrimary text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-bluePrimary/20">
                <Quote size={20} />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-brand-goldCertified text-brand-goldCertified" />
                ))}
              </div>
              
              <p className="text-brand-textMuted mb-8 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full border-2 border-brand-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-brand-textDark">{testimonial.name}</h4>
                  <p className="text-xs text-brand-textMuted">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
