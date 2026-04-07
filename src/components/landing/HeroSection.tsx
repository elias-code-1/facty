import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeroSection({ content }: { content: Record<string, any> }) {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen pt-24 pb-12 flex items-center bg-gradient-to-br from-white via-indigo-50/30 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              Gratuit pour commencer
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
              {content.hero_headline || 'Gérez vos factures simplement.'}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-xl">
              {content.hero_subheadline || 'Créez, envoyez et suivez vos factures en quelques clics. Gagnez du temps et soyez payé plus rapidement.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-8">
              <button 
                onClick={() => navigate('/auth')}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-lg"
              >
                {content.hero_cta_primary || 'Créer mon compte gratuit'}
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all text-lg"
              >
                {content.hero_cta_secondary || 'Découvrir'}
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-6">
              {content.hero_social_proof || 'Rejoignez des milliers d\'indépendants satisfaits.'}
            </p>
            
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2"><span className="text-xl">⚡</span> 30s chrono</div>
              <div className="flex items-center gap-2"><span className="text-xl">🆓</span> 100% Gratuit</div>
              <div className="flex items-center gap-2"><span className="text-xl">📄</span> PDF Pro</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-lg mx-auto"
            >
              {content.hero_mockup_url ? (
                <img 
                  src={content.hero_mockup_url} 
                  alt="App Mockup" 
                  className="w-full h-auto rounded-2xl shadow-2xl border border-slate-100 rotate-2"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-white rounded-2xl shadow-2xl border border-slate-100 rotate-2 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-32 h-8 bg-slate-100 rounded-lg"></div>
                    <div className="w-24 h-8 bg-indigo-100 rounded-lg"></div>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="w-full h-4 bg-slate-50 rounded"></div>
                    <div className="w-3/4 h-4 bg-slate-50 rounded"></div>
                    <div className="w-5/6 h-4 bg-slate-50 rounded"></div>
                  </div>
                  <div className="mt-auto flex justify-between items-end pt-8 border-t border-slate-50">
                    <div className="w-20 h-4 bg-slate-100 rounded"></div>
                    <div className="w-32 h-6 bg-slate-800 rounded"></div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
