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
  Megaphone,
  LayoutTemplate,
  Headphones,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import { TEAM_ROLES } from '../../data/teamRoles';

const navLinks = [
  { to: '/admin/facty', label: 'Vue globale', icon: <LayoutDashboard size={20} />, end: true },
  { to: '/admin/facty/users', label: 'Utilisateurs', icon: <Users size={20} /> },
  { to: '/admin/facty/invoices', label: 'Factures', icon: <FileText size={20} /> },
  { to: '/admin/facty/logs', label: 'Logs', icon: <Activity size={20} /> },
  { to: '/admin/facty/stats', label: 'Statistiques', icon: <BarChart3 size={20} /> },
  { to: '/admin/facty/payments', label: 'Paiements', icon: <CreditCard size={20} /> },
  { to: '/admin/facty/communication', label: 'Communication', icon: <Megaphone size={20} /> },
  { to: '/admin/facty/landing', label: 'Landing Page', icon: <LayoutTemplate size={20} /> },
  { to: '/admin/facty/support', label: 'Support', icon: <Headphones size={20} /> },
  { to: '/admin/facty/chat', label: 'Chat', icon: <MessageSquare size={20} /> },
  { to: '/admin/facty/settings', label: 'Paramètres', icon: <Settings size={20} /> },
];

interface AdminSidebarProps {
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
  onClose?: () => void;
}

export default function AdminSidebar({ isMenuOpen, setIsMenuOpen, onClose }: AdminSidebarProps) {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const isOwner = profile?.role === 'admin';
  const navigate = useNavigate();
  const [openTicketsCount, setOpenTicketsCount] = React.useState(0);
  const [unreadChatCount, setUnreadChatCount] = React.useState(0);

  // Filtrer les liens en fonction du rôle
  const filteredLinks = navLinks.filter(link => {
    if (isOwner) return true;
    if (!profile?.team_role) return false;
    
    const roleConfig = TEAM_ROLES[profile.team_role as keyof typeof TEAM_ROLES];
    if (!roleConfig) return false;
    
    return roleConfig.pages.some(p => p === link.to);
  });

  const isMobile = isMenuOpen !== undefined;
  const handleClose = () => {
    if (setIsMenuOpen) setIsMenuOpen(false);
    if (onClose) onClose();
  };

  React.useEffect(() => {
    const fetchOpenTickets = async () => {
      const { count } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      
      if (count !== null) setOpenTicketsCount(count);
    };

    fetchOpenTickets();

    const fetchUnreadChat = async () => {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_type', 'user')
        .eq('is_read', false);
      
      if (count !== null) setUnreadChatCount(count);
    };

    fetchUnreadChat();

    // Abonnement temps réel pour le badge
    // On utilise un nom unique pour éviter les conflits si le composant est rendu deux fois (mobile/desktop)
    const channel = supabase
      .channel(`support_badge_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_tickets'
      }, () => {
        fetchOpenTickets();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages'
      }, () => {
        fetchUnreadChat();
      })
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/facty/login');
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isMobile && isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleClose}
        />
      )}

      <div className={`
        flex flex-col h-full bg-slate-900 text-white border-r border-slate-800/50
        ${isMobile ? `
          fixed top-0 left-0 h-full w-72 z-50 md:hidden transform transition-transform duration-300
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ` : ''}
      `}>
        {/* Header Sidebar */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight md:hidden lg:block">Facty</span>
            <span className="bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 md:hidden lg:block">
              Admin
            </span>
            <div className="hidden md:flex lg:hidden w-10 h-10 bg-indigo-600 rounded-xl items-center justify-center font-bold shadow-lg shadow-indigo-900/40">
              F
            </div>
          </div>
          {isMobile && (
            <button onClick={handleClose} className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {filteredLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {link.icon}
              </div>
              <span className="md:hidden lg:block flex-1 truncate">{link.label}</span>
              
              {/* Tooltip for compact mode */}
              <div className="hidden md:group-hover:block lg:group-hover:hidden absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg whitespace-nowrap z-50 shadow-xl border border-slate-700 pointer-events-none">
                {link.label}
              </div>

              {link.to === '/admin/facty/support' && openTicketsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-900/20 md:hidden lg:flex">
                  {openTicketsCount}
                </span>
              )}
              {link.to === '/admin/facty/support' && openTicketsCount > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-900 hidden md:block lg:hidden" />
              )}

              {link.to === '/admin/facty/chat' && unreadChatCount > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-indigo-900/20 md:hidden lg:flex">
                  {unreadChatCount}
                </span>
              )}
              {link.to === '/admin/facty/chat' && unreadChatCount > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border border-slate-900 hidden md:block lg:hidden" />
              )}
            </NavLink>
          ))}

          {isOwner && (
            <NavLink
              to="/admin/facty/team"
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                👥
              </div>
              <span className="md:hidden lg:block flex-1 truncate">Équipe</span>
              
              {/* Tooltip for compact mode */}
              <div className="hidden md:group-hover:block lg:group-hover:hidden absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg whitespace-nowrap z-50 shadow-xl border border-slate-700 pointer-events-none">
                Équipe
              </div>
            </NavLink>
          )}

          <div className="my-6 border-t border-slate-800/50 mx-2" />

          <Link
            to="/dashboard"
            onClick={handleClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span className="md:hidden lg:block">Retour à l'app</span>
          </Link>
        </nav>

        {/* User Info Bottom */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center gap-3 px-2 mb-4 group relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-900/20 flex-shrink-0">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0 md:hidden lg:block">
              <p className="text-sm font-semibold truncate text-white">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                {isOwner ? 'Administrateur' : (TEAM_ROLES[profile?.team_role as keyof typeof TEAM_ROLES]?.label || 'Membre')}
              </p>
            </div>
            
            {/* Tooltip for compact mode */}
            <div className="hidden md:group-hover:block lg:group-hover:hidden absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg whitespace-nowrap z-50 shadow-xl border border-slate-700 pointer-events-none">
              {profile?.full_name || 'Admin'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 group relative"
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <span className="md:hidden lg:block">Déconnexion</span>
            
            {/* Tooltip for compact mode */}
            <div className="hidden md:group-hover:block lg:group-hover:hidden absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg whitespace-nowrap z-50 shadow-xl border border-slate-700 pointer-events-none">
              Déconnexion
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
