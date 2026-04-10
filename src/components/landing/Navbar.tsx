import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ content }: { content: Record<string, any> }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    
    // Liste des pages qui se comportent comme la landing page (scroll interne)
    const isLandingLikePage = location.pathname === '/' || (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/auth') && !location.pathname.startsWith('/settings') && !location.pathname.startsWith('/invoices') && !location.pathname.startsWith('/clients') && !location.pathname.startsWith('/contact') && !location.pathname.startsWith('/legal') && !location.pathname.startsWith('/privacy'));

    if (id === '') {
      if (!isLandingLikePage) {
        // Navigation contextuelle : on essaie de retourner sur la dernière page SEO ou l'accueil
        const lastSEOPath = localStorage.getItem('lastSEOPath');
        if (lastSEOPath && lastSEOPath !== location.pathname) {
          navigate(lastSEOPath);
        } else {
          navigate('/#');
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', location.pathname + '#');
      }
      return;
    }

    if (!isLandingLikePage) {
      // Si on est sur une page statique (Contact, etc.), on redirige vers l'accueil ou le dernier SEO
      const lastSEOPath = localStorage.getItem('lastSEOPath');
      const targetBase = lastSEOPath || '/';
      navigate(targetBase + '#' + id);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', location.pathname + '#' + id);
    } else {
      // Si l'élément n'existe pas sur cette page, on va à l'accueil
      navigate('/#' + id);
    }
  };

  // Déterminer si on doit forcer le fond blanc (sur les pages qui n'ont pas de Hero sombre/dégradé au top)
  const isStaticPage = ['/contact', '/legal', '/privacy', '/auth'].some(path => location.pathname.startsWith(path));
  const showOpaqueNavbar = isScrolled || isStaticPage;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showOpaqueNavbar ? 'bg-white/95 backdrop-blur shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {content.nav_logo_url ? (
            <img src={content.nav_logo_url} alt="Logo" className="h-12 md:h-16" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-3xl md:text-4xl font-bold text-indigo-600">Facty</span>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('')} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Accueil</button>
          <button onClick={() => scrollToSection('fonctionnalités')} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Fonctionnalités</button>
          <button onClick={() => navigate('/contact')} className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Contact</button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => navigate('/auth')} className="text-indigo-600 font-bold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
            Se connecter
          </button>
          <button onClick={() => navigate('/auth')} className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            {content.nav_cta_text || 'Commencer'}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[101] shadow-2xl p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2">
                  {content.nav_logo_url ? (
                    <img src={content.nav_logo_url} alt="Logo" className="h-10" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-600">Facty</span>
                  )}
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => scrollToSection('')} 
                  className="text-left py-4 px-4 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-semibold transition-all"
                >
                  Accueil
                </button>
                <button 
                  onClick={() => scrollToSection('fonctionnalités')} 
                  className="text-left py-4 px-4 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-semibold transition-all"
                >
                  Fonctionnalités
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/contact'); }} 
                  className="text-left py-4 px-4 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 font-semibold transition-all"
                >
                  Contact
                </button>
              </div>

              <div className="mt-auto pt-10 flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/auth')} 
                  className="w-full py-4 text-indigo-600 font-bold border-2 border-indigo-50 rounded-2xl hover:bg-indigo-50 transition-colors"
                >
                  Se connecter
                </button>
                <button 
                  onClick={() => navigate('/auth')} 
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  {content.nav_cta_text || 'Commencer gratuitement'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
