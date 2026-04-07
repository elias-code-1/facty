import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer({ content }: { content: Record<string, any> }) {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="flex flex-col items-start">
            {content.nav_logo_url ? (
              <img src={content.nav_logo_url} alt="Logo" className="h-10 mb-4 brightness-0 invert" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-3xl font-bold text-white mb-4">Facty</span>
            )}
            <p className="text-slate-400 mb-6">
              {content.footer_tagline || 'La facturation simple pour les indépendants.'}
            </p>
            <p className="text-slate-500 text-sm">
              {content.footer_copyright || `© ${new Date().getFullYear()} Facty. Tous droits réservés.`}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-slate-300 mb-2">Navigation</h4>
            <button onClick={() => scrollToSection('features')} className="text-left text-slate-400 hover:text-white transition-colors">Fonctionnalités</button>
            <button onClick={() => scrollToSection('pricing')} className="text-left text-slate-400 hover:text-white transition-colors">Tarifs</button>
            <button onClick={() => scrollToSection('faq')} className="text-left text-slate-400 hover:text-white transition-colors">FAQ</button>
            <button onClick={() => navigate('/auth')} className="text-left text-slate-400 hover:text-white transition-colors">Se connecter</button>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-slate-300 mb-2">Contact</h4>
            <a href="mailto:support@facty.com" className="text-slate-400 hover:text-white transition-colors">
              support@facty.com
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}