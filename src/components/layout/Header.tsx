import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Tableau de bord';
    if (path === '/invoices') return 'Mes factures';
    if (path === '/invoices/new') return 'Nouvelle facture';
    if (path.startsWith('/invoices/')) return 'Détails de la facture';
    if (path === '/clients') return 'Clients';
    if (path === '/settings') return 'Paramètres';
    if (path.startsWith('/admin/invoxa')) return 'Administration';
    return 'Invoxa';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-14 md:h-16 flex items-center justify-between px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MenuIcon />
        </button>
        <h2 className="text-xl md:text-2xl xl:text-3xl font-bold text-slate-800 truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {profile?.role === 'admin' && (
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <BellIcon />
            {/* Badge rouge fictif pour l'instant */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border-2 border-transparent hover:border-indigo-200 transition-all"
          >
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-30">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
