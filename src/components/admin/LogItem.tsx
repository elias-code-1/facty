import React from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Printer, 
  RefreshCw, 
  Eye, 
  Users, 
  Settings, 
  Ban, 
  CheckCircle 
} from 'lucide-react';
import { AdminLog } from '../../hooks/useAdminLogs';
import { timeAgo } from '../../utils/date';

interface LogItemProps {
  log: AdminLog;
  index: number;
  key?: string | number;
}

/** Composant pour afficher un élément du journal d'activité */
export default function LogItem({ log, index }: LogItemProps) {
  // Icône et couleur selon catégorie
  const getIcon = () => {
    const action = log.action;
    if (action.startsWith('auth.')) return { icon: <Key size={14} />, bg: 'bg-blue-100', text: 'text-blue-600' };
    if (action === 'invoice.created') return { icon: <Plus size={14} />, bg: 'bg-indigo-100', text: 'text-indigo-600' };
    if (action === 'invoice.updated') return { icon: <Edit size={14} />, bg: 'bg-indigo-100', text: 'text-indigo-600' };
    if (action === 'invoice.deleted') return { icon: <Trash2 size={14} />, bg: 'bg-red-100', text: 'text-red-600' };
    if (action === 'invoice.exported_pdf') return { icon: <FileText size={14} />, bg: 'bg-violet-100', text: 'text-violet-600' };
    if (action === 'invoice.printed') return { icon: <Printer size={14} />, bg: 'bg-violet-100', text: 'text-violet-600' };
    if (action === 'invoice.status_changed') return { icon: <RefreshCw size={14} />, bg: 'bg-orange-100', text: 'text-orange-600' };
    if (action === 'invoice.viewed') return { icon: <Eye size={14} />, bg: 'bg-slate-100', text: 'text-slate-600' };
    if (action.startsWith('client.')) return { icon: <Users size={14} />, bg: 'bg-green-100', text: 'text-green-600' };
    if (action.startsWith('profile.')) return { icon: <Settings size={14} />, bg: 'bg-slate-100', text: 'text-slate-600' };
    if (action === 'account.suspended') return { icon: <Ban size={14} />, bg: 'bg-red-100', text: 'text-red-600' };
    if (action === 'account.reactivated') return { icon: <CheckCircle size={14} />, bg: 'bg-green-100', text: 'text-green-600' };
    
    return { icon: <Activity size={14} />, bg: 'bg-slate-100', text: 'text-slate-600' };
  };

  // Traduction des actions
  const getActionLabel = () => {
    const labels: Record<string, string> = {
      'auth.login': "s'est connecté",
      'auth.logout': "s'est déconnecté",
      'auth.register': "s'est inscrit",
      'invoice.created': "a créé la facture",
      'invoice.updated': "a modifié la facture",
      'invoice.deleted': "a supprimé la facture",
      'invoice.status_changed': "a changé le statut",
      'invoice.exported_pdf': "a exporté un PDF",
      'invoice.printed': "a imprimé une facture",
      'invoice.viewed': "a consulté la facture",
      'client.created': "a ajouté un client",
      'client.updated': "a modifié un client",
      'client.deleted': "a supprimé un client",
      'profile.updated': "a mis à jour son profil",
      'account.suspended': "a été suspendu",
      'account.reactivated': "a été réactivé"
    };
    return labels[log.action] || log.action;
  };

  const { icon, bg, text } = getIcon();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg"
    >
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${bg} ${text}`}>
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {log.user ? (
              <>
                <span className="text-sm font-bold text-slate-800">{log.user.full_name}</span>
                <span className="text-[10px] text-slate-400">{log.user.email}</span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-400 italic">Utilisateur supprimé</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">{timeAgo(log.created_at)}</span>
        </div>
        
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm text-slate-600">
            {getActionLabel()}
          </p>
          
          {/* Metadata */}
          {log.action === 'invoice.status_changed' && log.metadata?.from && log.metadata?.to && (
            <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-0.5 text-[10px] font-bold text-slate-500">
              <span className="capitalize">{log.metadata.from}</span>
              <span>→</span>
              <span className="capitalize text-indigo-600">{log.metadata.to}</span>
            </div>
          )}
          
          {(log.action === 'invoice.created' || log.action === 'invoice.deleted') && log.metadata?.invoice_number && (
            <span className="bg-slate-100 rounded px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600">
              {log.metadata.invoice_number}
            </span>
          )}
          
          {log.action === 'account.suspended' && log.metadata?.deleted_by === 'admin' && (
            <span className="text-[10px] font-medium text-red-400 italic">
              Par : Administrateur
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Fallback icon for unknown actions
const Activity = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
