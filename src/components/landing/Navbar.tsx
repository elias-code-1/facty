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

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur shadow-sm py-3' : 'bg-transparent py-5'}`}>
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
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl p-6 flex flex-col md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex flex-col gap-6 text-lg font-medium text-slate-700">
                <button onClick={() => scrollToSection('')} className="text-left hover:text-indigo-600">Accueil</button>
                <button onClick={() => scrollToSection('fonctionnalités')} className="text-left hover:text-indigo-600">Fonctionnalités</button>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/contact'); }} className="text-left hover:text-indigo-600">Contact</button>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button onClick={() => navigate('/auth')} className="w-full py-3 text-indigo-600 font-bold border border-indigo-100 rounded-xl">
                  Se connecter
                </button>
                <button onClick={() => navigate('/auth')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200">
                  {content.nav_cta_text || 'Commencer'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
