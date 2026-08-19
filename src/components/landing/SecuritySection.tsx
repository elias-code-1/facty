import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Database, Server } from 'lucide-react';

export default function SecuritySection({ content }: { content: Record<string, any> }) {
  const securityItems = content.security_items || [
    {
      icon: 'ShieldCheck',
      title: 'Protection des données',
      description: 'Vos données sont cryptées et stockées en toute sécurité sur des serveurs hautement protégés.'
    },
    {
      icon: 'Lock',
      title: 'Accès sécurisé',
      description: 'Nous utilisons les derniers standards de sécurité pour garantir que vous seul avez accès à vos informations.'
    },
    {
      icon: 'Database',
      title: 'Sauvegardes automatiques',
      description: 'Vos factures et données clients sont sauvegardées quotidiennement pour éviter toute perte.'
    }
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck': return <ShieldCheck className="text-emerald-500" size={24} />;
      case 'Lock': return <Lock className="text-indigo-500" size={24} />;
      case 'Database': return <Database className="text-blue-500" size={24} />;
      default: return <Server className="text-slate-500" size={24} />;
    }
  };

  return (
    <section className="py-24 bg-brand-lightGray border-t border-brand-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-geist font-extrabold text-brand-textDark mb-6 tracking-tight">
              {content.security_title || 'Votre sécurité est notre priorité absolue'}
            </h2>
            <p className="text-brand-textMuted text-lg mb-8 leading-relaxed">
              {content.security_description || 'Nous comprenons l\'importance de vos données financières. C\'est pourquoi nous utilisons des technologies de pointe pour assurer une protection maximale.'}
            </p>
            
            <div className="space-y-6">
              {securityItems.map((item: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-brand-white rounded-2xl shadow-sm border border-brand-border/50"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-lightGray rounded-xl flex items-center justify-center">
                    {getIcon(item.icon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-textDark mb-1">{item.title}</h3>
                    <p className="text-sm text-brand-textMuted leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <img 
                src="/securite.avif" 
                alt="Security" 
                className="rounded-3xl shadow-2xl shadow-brand-bluePrimary/10 border-8 border-brand-white"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -right-6 bg-brand-white p-6 rounded-2xl shadow-xl border border-brand-border/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-greenSuccess/10 text-brand-greenSuccess rounded-full flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-textMuted uppercase tracking-wider">Certifié</p>
                  <p className="text-sm font-bold text-brand-textDark">100% Sécurisé</p>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-bluePrimary/10 rounded-full blur-3xl opacity-50 -z-10" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-greenSuccess/10 rounded-full blur-3xl opacity-50 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
