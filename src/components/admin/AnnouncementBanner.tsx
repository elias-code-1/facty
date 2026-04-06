import React from 'react';
import { motion } from 'motion/react';
import { Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { Announcement } from '../../types/database';

interface AnnouncementBannerProps {
  key?: React.Key;
  announcement: Announcement | (Partial<Announcement> & { id?: string });
  onDismiss?: () => void;
}

export default function AnnouncementBanner({ announcement, onDismiss }: AnnouncementBannerProps) {
  const getStyle = () => {
    switch (announcement.type) {
      case 'info':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info className="text-blue-600 shrink-0" size={20} /> };
      case 'warning':
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: <AlertTriangle className="text-orange-600 shrink-0" size={20} /> };
      case 'success':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <CheckCircle className="text-green-600 shrink-0" size={20} /> };
      case 'error':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <XCircle className="text-red-600 shrink-0" size={20} /> };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info className="text-blue-600 shrink-0" size={20} /> };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border} ${style.text} shadow-sm relative`}
    >
      {style.icon}
      <div className="flex-1 min-w-0 pr-6">
        <h4 className="font-bold text-sm mb-1">{announcement.title || 'Titre de l\'annonce'}</h4>
        <p className="text-sm opacity-90 whitespace-pre-wrap">{announcement.message || 'Message de l\'annonce'}</p>
      </div>
      
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Fermer"
        >
          <X size={16} className="opacity-70" />
        </button>
      )}
    </motion.div>
  );
}
