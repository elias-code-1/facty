import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Menu, 
  CheckCheck, 
  AlertCircle, 
  UserPlus, 
  Zap,
  ChevronDown
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { formatDate } from '../../utils/invoice';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const location = useLocation();
  const { unreadCount, adminNotifications, markAllAsRead, markAsRead } = useAdmin();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Titre dynamique selon la route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/invoxa') return 'Vue globale';
    if (path === '/admin/invoxa/users') return 'Utilisateurs';
    if (path.includes('/admin/invoxa/users/')) return 'Détail utilisateur';
    if (path === '/admin/invoxa/invoices') return 'Factures';
    if (path === '/admin/invoxa/logs') return 'Logs';
    if (path === '/admin/invoxa/stats') return 'Statistiques';
    if (path === '/admin/invoxa/settings') return 'Paramètres';
    return 'Administration';
  };

  // Fermer les notifications au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'new_user': return <UserPlus size={16} className="text-blue-500" />;
      case 'limit_reached': return <Zap size={16} className="text-orange-500" />;
      case 'critical_error': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <header className="h-16 md:h-20 bg-slate-800/5 border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Notifications Admin */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2.5 rounded-xl transition-all duration-200 relative ${
              isNotifOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <CheckCheck size={14} />
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                  {adminNotifications.length > 0 ? (
                    adminNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`p-4 border-b border-slate-50 flex gap-3 transition-colors cursor-pointer ${
                          !notif.is_read ? 'bg-indigo-50/30 hover:bg-indigo-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          !notif.is_read ? 'bg-white shadow-sm' : 'bg-slate-100'
                        }`}>
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatDate(notif.created_at)}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-500">Aucune notification</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50/50 text-center border-t border-slate-50">
                  <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                    Voir tout l'historique
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
