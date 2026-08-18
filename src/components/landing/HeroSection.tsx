import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DynamicIcon from '../ui/DynamicIcon';

export default function HeroSection({ content }: { content: Record<string, any> }) {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen pt-24 pb-12 flex items-center bg-brand-white relative overflow-hidden">
      {/* Soft radial glow background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-brand-bluePrimary/5 rounded-full blur-[100px] opacity-70"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 bg-brand-cardGray text-brand-bluePrimary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              Gratuit pour commencer
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-geist font-extrabold text-brand-textDark leading-tight mb-6">
              {content.hero_headline || 'Gérez vos factures simplement.'}
            </h1>
            
            <p className="text-lg md:text-xl text-brand-textMuted mb-8 max-w-xl">
              {content.hero_subheadline || 'Créez, envoyez et suivez vos factures en quelques clics. Gagnez du temps et soyez payé plus rapidement.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-8">
              <button 
                onClick={() => navigate('/auth')}
                className="bg-brand-bluePrimary text-white px-8 py-4 rounded-xl font-geist font-bold hover:bg-brand-bluePrimary/90 transition-all shadow-lg shadow-brand-bluePrimary/20 text-lg"
              >
                {content.hero_cta_primary || 'Créer mon compte gratuit'}
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-brand-textDark border border-brand-border px-8 py-4 rounded-xl font-bold hover:bg-brand-lightGray transition-all text-lg"
              >
                {content.hero_cta_secondary || 'Découvrir'}
              </button>
            </div>
            
            <p className="text-sm text-brand-textMuted mb-6">
              {content.hero_social_proof || 'Rejoignez des milliers d\'indépendants satisfaits.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-brand-textMuted">
              <div className="flex items-center gap-2">
                <DynamicIcon name={content.hero_feature_1_icon || 'Zap'} size={20} className="text-brand-bluePrimary" />
                {content.hero_feature_1 || '30s chrono'}
              </div>
              <div className="flex items-center gap-2">
                <DynamicIcon name={content.hero_feature_2_icon || 'Gift'} size={20} className="text-brand-bluePrimary" />
                {content.hero_feature_2 || '100% Gratuit'}
              </div>
              <div className="flex items-center gap-2">
                <DynamicIcon name={content.hero_feature_3_icon || 'FileText'} size={20} className="text-brand-bluePrimary" />
                {content.hero_feature_3 || 'PDF Pro'}
              </div>
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
                  className="w-full h-auto rounded-2xl shadow-2xl border border-brand-border rotate-2"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-brand-white rounded-2xl shadow-2xl border border-brand-border rotate-2 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-32 h-8 bg-brand-lightGray rounded-lg"></div>
                    <div className="w-24 h-8 bg-brand-cardGray rounded-lg"></div>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="w-full h-4 bg-brand-cardGray rounded"></div>
                    <div className="w-3/4 h-4 bg-brand-cardGray rounded"></div>
                    <div className="w-5/6 h-4 bg-brand-cardGray rounded"></div>
                  </div>
                  <div className="mt-auto flex justify-between items-end pt-8 border-t border-brand-border">
                    <div className="w-20 h-4 bg-brand-lightGray rounded"></div>
                    <div className="w-32 h-6 bg-brand-textDark rounded"></div>
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
