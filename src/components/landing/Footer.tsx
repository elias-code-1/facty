import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Mail, Phone } from 'lucide-react';

export default function Footer({ content }: { content: Record<string, any> }) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (id === '') {
      if (location.pathname !== '/') {
        navigate('/#');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/#');
      }
      return;
    }
    if (location.pathname !== '/') {
      navigate('/#' + id);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    window.history.pushState(null, '', '/#' + id);
  };

  const socialLinks = [
    { key: 'footer_social_facebook', icon: Facebook, label: 'Facebook' },
    { key: 'footer_social_twitter', icon: Twitter, label: 'Twitter' },
    { key: 'footer_social_instagram', icon: Instagram, label: 'Instagram' },
    { key: 'footer_social_linkedin', icon: Linkedin, label: 'LinkedIn' },
    { key: 'footer_social_youtube', icon: Youtube, label: 'YouTube' },
    { key: 'footer_social_github', icon: Github, label: 'GitHub' },
  ];

  const hasSocialLinks = socialLinks.some(link => content[link.key]);

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="md:col-span-2 flex flex-col items-start">
            {content.nav_logo_url ? (
              <img src={content.nav_logo_url} alt="Logo" className="h-10 mb-6 brightness-0 invert" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-3xl font-bold text-white mb-6">Facty</span>
            )}
            <p className="text-slate-400 mb-8 max-w-sm leading-relaxed">
              {content.footer_tagline || 'La facturation simple pour les indépendants.'}
            </p>
            
            {hasSocialLinks && (
              <div className="flex items-center gap-4 mb-8">
                {socialLinks.map(social => {
                  const url = content[social.key];
                  if (!url) return null;
                  const Icon = social.icon;
                  return (
                    <a 
                      key={social.key}
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                      aria-label={social.label}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            )}

            <p className="text-slate-500 text-sm">
              {content.footer_copyright || `© ${new Date().getFullYear()} Facty. Tous droits réservés.`}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white text-lg mb-2">Navigation</h4>
            <button onClick={() => scrollToSection('')} className="text-left text-slate-400 hover:text-white transition-colors">Accueil</button>
            <button onClick={() => scrollToSection('fonctionnalités')} className="text-left text-slate-400 hover:text-white transition-colors">Fonctionnalités</button>
            <button onClick={() => navigate('/contact')} className="text-left text-slate-400 hover:text-white transition-colors">Contact</button>
            <button onClick={() => navigate('/auth')} className="text-left text-slate-400 hover:text-white transition-colors">Se connecter</button>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white text-lg mb-2">Solutions</h4>
            <button onClick={() => navigate('/logiciel-facturation-freelance')} className="text-left text-slate-400 hover:text-white transition-colors">Freelances</button>
            <button onClick={() => navigate('/logiciel-facturation-pme')} className="text-left text-slate-400 hover:text-white transition-colors">PME & Startups</button>
            <button onClick={() => navigate('/logiciel-facturation-afrique')} className="text-left text-slate-400 hover:text-white transition-colors">Afrique (CFA)</button>
            <button onClick={() => navigate('/generateur-facture-gratuit')} className="text-left text-slate-400 hover:text-white transition-colors">Générateur gratuit</button>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white text-lg mb-2">Légal</h4>
            <button onClick={() => navigate('/legal')} className="text-left text-slate-400 hover:text-white transition-colors">Mentions Légales</button>
            <button onClick={() => navigate('/privacy')} className="text-left text-slate-400 hover:text-white transition-colors">Confidentialité</button>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white text-lg mb-2">Contact</h4>
            <div className="space-y-4">
              <a 
                href={`mailto:${content.footer_contact_email || 'support@facty.com'}`} 
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <Mail size={16} />
                </div>
                {content.footer_contact_email || 'support@facty.com'}
              </a>
              
              {content.footer_contact_phone && (
                <a 
                  href={`tel:${content.footer_contact_phone}`} 
                  className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <Phone size={16} />
                  </div>
                  {content.footer_contact_phone}
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
