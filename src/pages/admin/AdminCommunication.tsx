import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Globe, 
  Target, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Trash2,
  Clock
} from 'lucide-react';
import { useAdminCommunication, AnnouncementForm } from '../../hooks/useAdminCommunication';
import AnnouncementBanner from '../../components/admin/AnnouncementBanner';
import FullPageSpinner from '../../components/ui/FullPageSpinner';
import { timeAgo } from '../../utils/date';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

type FilterType = 'all' | 'active' | 'inactive' | 'expired';

export default function AdminCommunication() {
  const { announcements, profiles, loading, createAnnouncement, toggleActive, deleteAnnouncement } = useAdminCommunication();
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState<AnnouncementForm>({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // List state
  const [filter, setFilter] = useState<FilterType>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    return {
      active: announcements.filter(a => a.is_active).length,
      global: announcements.filter(a => a.target === 'all').length,
      specific: announcements.filter(a => a.target === 'specific').length
    };
  }, [announcements]);

  // Filtered list
  const filteredAnnouncements = useMemo(() => {
    const now = new Date();
    return announcements.filter(a => {
      const isExpired = a.expires_at && new Date(a.expires_at) < now;
      if (filter === 'active') return a.is_active && !isExpired;
      if (filter === 'inactive') return !a.is_active && !isExpired;
      if (filter === 'expired') return isExpired;
      return true;
    });
  }, [announcements, filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.target === 'specific' && !form.target_user_id) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un utilisateur cible.', type: 'error' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createAnnouncement(form);
      toast({ title: 'Succès', description: 'Annonce publiée avec succès.', type: 'success' });
      setForm({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        target_user_id: undefined,
        expires_at: undefined
      });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de publier l\'annonce.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleActive(id, current);
      toast({ title: 'Succès', description: `Annonce ${current ? 'désactivée' : 'activée'}.`, type: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de modifier le statut.', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAnnouncement(deleteId);
      toast({ title: 'Succès', description: 'Annonce supprimée.', type: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'annonce.', type: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading && announcements.length === 0) return <FullPageSpinner />;

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Communication</h1>
        <p className="text-slate-500 mt-1">Annonces globales et notifications ciblées</p>
      </div>

      {/* Section 1 : Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Megaphone size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
            <p className="text-sm font-medium text-slate-500">Annonces actives</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.global}</p>
            <p className="text-sm font-medium text-slate-500">Annonces globales</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.specific}</p>
            <p className="text-sm font-medium text-slate-500">Notifications ciblées</p>
          </div>
        </div>
      </div>

      {/* Section 2 : Créer une annonce */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Nouvelle annonce</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type d'annonce */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type d'annonce</label>
            <div className="flex flex-wrap gap-3">
              {(['info', 'warning', 'success', 'error'] as const).map(type => {
                const isSelected = form.type === type;
                let bg, border, text, icon, label;
                switch(type) {
                  case 'info': bg = 'bg-blue-100'; border = 'border-blue-300'; text = 'text-blue-800'; icon = <Info size={16}/>; label = 'Info'; break;
                  case 'warning': bg = 'bg-orange-100'; border = 'border-orange-300'; text = 'text-orange-800'; icon = <AlertTriangle size={16}/>; label = 'Attention'; break;
                  case 'success': bg = 'bg-green-100'; border = 'border-green-300'; text = 'text-green-800'; icon = <CheckCircle size={16}/>; label = 'Succès'; break;
                  case 'error': bg = 'bg-red-100'; border = 'border-red-300'; text = 'text-red-800'; icon = <XCircle size={16}/>; label = 'Urgent'; break;
                }
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                      isSelected ? `${bg} ${border} ${text} ring-2 ring-offset-1 ring-${border.split('-')[1]}-400` : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {icon}
                    <span className="font-bold text-sm">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Titre */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Titre</label>
              <span className="text-xs text-slate-400">{form.title.length}/80</span>
            </div>
            <input
              type="text"
              required
              maxLength={80}
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Titre de l'annonce..."
            />
          </div>

          {/* Message */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Message</label>
              <span className="text-xs text-slate-400">{form.message.length}/300</span>
            </div>
            <textarea
              required
              maxLength={300}
              rows={3}
              value={form.message}
              onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Contenu de votre message..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destinataires */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Destinataires</label>
              <div className="flex p-1 bg-slate-50 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, target: 'all', target_user_id: undefined }))}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${form.target === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Tous les utilisateurs
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, target: 'specific' }))}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${form.target === 'specific' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Utilisateur spécifique
                </button>
              </div>
              
              {form.target === 'specific' && (
                <select
                  required
                  value={form.target_user_id || ''}
                  onChange={e => setForm(prev => ({ ...prev, target_user_id: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="" disabled>Sélectionner un utilisateur...</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Expiration (optionnel)</label>
              <input
                type="datetime-local"
                value={form.expires_at || ''}
                onChange={e => setForm(prev => ({ ...prev, expires_at: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Aperçu */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Aperçu en temps réel</label>
            <AnnouncementBanner announcement={form as any} />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !form.title || !form.message}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3 : Annonces existantes */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Annonces ({filteredAnnouncements.length})</h2>
          <div className="flex p-1 bg-slate-50 rounded-xl overflow-x-auto no-scrollbar">
            {(['all', 'active', 'inactive', 'expired'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : f === 'inactive' ? 'Inactives' : 'Expirées'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.map(ann => {
              const isExpired = ann.expires_at && new Date(ann.expires_at) < new Date();
              
              let badgeBg, badgeText, badgeLabel;
              switch(ann.type) {
                case 'info': badgeBg = 'bg-blue-100'; badgeText = 'text-blue-600'; badgeLabel = 'Info'; break;
                case 'warning': badgeBg = 'bg-orange-100'; badgeText = 'text-orange-600'; badgeLabel = 'Attention'; break;
                case 'success': badgeBg = 'bg-green-100'; badgeText = 'text-green-600'; badgeLabel = 'Succès'; break;
                case 'error': badgeBg = 'bg-red-100'; badgeText = 'text-red-600'; badgeLabel = 'Urgent'; break;
              }

              const targetName = ann.target === 'all' 
                ? 'Tous' 
                : profiles.find(p => p.id === ann.target_user_id)?.full_name || 'Utilisateur inconnu';

              return (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all ${isExpired ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badgeBg} ${badgeText}`}>
                        {badgeLabel}
                      </span>
                      {isExpired && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-400">
                          Expirée
                        </span>
                      )}
                      <h3 className="font-bold text-slate-800">{ann.title}</h3>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(ann.id, ann.is_active)}
                      disabled={isExpired}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        ann.is_active ? 'bg-indigo-600' : 'bg-slate-200'
                      } ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <motion.span
                        layout
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          ann.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{ann.message}</p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Target size={14} />
                        <span className="font-medium">Cible: {targetName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span className="font-medium">
                          Expire: {ann.expires_at ? new Date(ann.expires_at).toLocaleString('fr-FR') : 'Jamais'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Créée {timeAgo(ann.created_at)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteId(ann.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              );
            })}
            
            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Aucune annonce trouvée.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer l'annonce"
        message="Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmVariant="danger"
      />
    </div>
  );
}
