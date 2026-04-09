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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {content.testimonials_title || 'Ils nous font confiance'}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
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
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
            >
              <div className="absolute -top-4 left-8 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Quote size={20} />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-slate-600 mb-8 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
