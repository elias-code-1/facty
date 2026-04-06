import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Activity, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  X,
  LogOut,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';

interface AdminSidebarProps {
  onClose?: () => void;
}

const navLinks = [
  { to: '/admin/invoxa', label: 'Vue globale', icon: <LayoutDashboard size={20} />, end: true },
  { to: '/admin/invoxa/users', label: 'Utilisateurs', icon: <Users size={20} /> },
  { to: '/admin/invoxa/invoices', label: 'Factures', icon: <FileText size={20} /> },
  { to: '/admin/invoxa/logs', label: 'Logs', icon: <Activity size={20} /> },
  { to: '/admin/invoxa/stats', label: 'Statistiques', icon: <BarChart3 size={20} /> },
  { to: '/admin/invoxa/communication', label: 'Communication', icon: <Megaphone size={20} /> },
  { to: '/admin/invoxa/settings', label: 'Paramètres', icon: <Settings size={20} /> },
];

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/invoxa/login');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-800/50">
      {/* Header Sidebar */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight">Invoxa</span>
          <span className="bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5">
            Admin
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            {link.icon}
            <span className="md:hidden lg:block">{link.label}</span>
          </NavLink>
        ))}

        <div className="my-6 border-t border-slate-800/50 mx-2" />

        <Link
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
        >
          <ArrowLeft size={20} />
          <span className="md:hidden lg:block">Retour à l'app</span>
        </Link>
      </nav>

      {/* User Info Bottom */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-900/20">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0 md:hidden lg:block">
            <p className="text-sm font-semibold truncate text-white">{profile?.full_name || 'Admin'}</p>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Administrateur</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="md:hidden lg:block">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
