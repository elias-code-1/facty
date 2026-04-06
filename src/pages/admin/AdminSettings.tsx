import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wrench, 
  ToggleRight, 
  Database, 
  Download, 
  ShieldAlert,
  Save
} from 'lucide-react';
import { useAdminPlatform } from '../../hooks/useAdminPlatform';
import { useToast } from '../../hooks/useToast';
import Switch from '../../components/ui/Switch';
import FeatureFlag from '../../components/admin/FeatureFlag';
import FullPageSpinner from '../../components/ui/FullPageSpinner';
import { supabase } from '../../lib/supabase';

export default function AdminSettings() {
  const { settings, loading, updateSetting } = useAdminPlatform();
  const { toast } = useToast();
  
  // Local state for text inputs to avoid saving on every keystroke
  const [maintenanceTitle, setMaintenanceTitle] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [freePlanLimit, setFreePlanLimit] = useState('');
  
  // Initialize local state when settings load
  React.useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      setMaintenanceTitle(settings.maintenance_title || '');
      setMaintenanceMessage(settings.maintenance_message || '');
      setFreePlanLimit(settings.free_plan_invoice_limit || '999999');
    }
  }, [settings, loading]);

  const [isExporting, setIsExporting] = useState<string | null>(null);

  if (loading) return <FullPageSpinner />;

  const handleToggle = async (key: string, value: string) => {
    try {
      await updateSetting(key, value);
      const label = key.replace('feature_', '').replace(/_/g, ' ');
      toast({ 
        title: 'Succès', 
        description: `Fonctionnalité ${label} ${value === 'true' ? 'activée' : 'désactivée'} ✓`, 
        type: 'success' 
      });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de modifier le paramètre.', type: 'error' });
    }
  };

  const handleSaveMaintenanceMessage = async () => {
    try {
      await updateSetting('maintenance_title', maintenanceTitle);
      await updateSetting('maintenance_message', maintenanceMessage);
      toast({ title: 'Succès', description: 'Message de maintenance sauvegardé.', type: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder le message.', type: 'error' });
    }
  };

  const handleSaveFreePlanLimit = async () => {
    try {
      await updateSetting('free_plan_invoice_limit', freePlanLimit);
      toast({ title: 'Succès', description: 'Limite du plan gratuit sauvegardée.', type: 'success' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder la limite.', type: 'error' });
    }
  };

  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({ title: 'Info', description: 'Aucune donnée à exporter.', type: 'info' });
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ];
    const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (type: 'users' | 'invoices' | 'logs') => {
    try {
      setIsExporting(type);
      const date = new Date().toISOString().split('T')[0];
      
      if (type === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, company_name, currency, created_at, last_seen_at, is_suspended');
        if (error) throw error;
        exportCSV(data || [], `invoxa-backup-users-${date}.csv`);
      } else if (type === 'invoices') {
        const { data, error } = await supabase
          .from('invoices')
          .select('id, user_id, invoice_number, status, issue_date, due_date, subtotal, tax_rate, total, created_at');
        if (error) throw error;
        exportCSV(data || [], `invoxa-backup-invoices-${date}.csv`);
      } else if (type === 'logs') {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id, user_id, action, entity_type, entity_id, created_at');
        if (error) throw error;
        exportCSV(data || [], `invoxa-backup-logs-${date}.csv`);
      }
      
      toast({ title: 'Succès', description: 'Export terminé ✓', type: 'success' });
    } catch (error) {
      console.error('Erreur export:', error);
      toast({ title: 'Erreur', description: 'L\'export a échoué.', type: 'error' });
    } finally {
      setIsExporting(null);
    }
  };

  const isMaintenanceActive = settings.maintenance_enabled === 'true';

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Paramètres plateforme</h1>
        <p className="text-slate-500 mt-1">Contrôlez le comportement global d'Invoxa</p>
      </div>

      {/* SECTION 1 : Mode Maintenance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl p-6 shadow-sm transition-all ${
          isMaintenanceActive ? 'border-2 border-red-300' : 'border border-slate-100'
        }`}
      >
        {isMaintenanceActive && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex items-start gap-3">
            <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-800 font-medium">
              ⚠️ La maintenance est actuellement ACTIVE. Les utilisateurs voient la page de maintenance.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isMaintenanceActive ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
            }`}>
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Mode Maintenance</h2>
              <p className="text-xs text-slate-500">Bloquer l'accès à l'application</p>
            </div>
          </div>
          <Switch 
            checked={isMaintenanceActive} 
            onChange={(val) => handleToggle('maintenance_enabled', val ? 'true' : 'false')} 
            colorOn="bg-red-500"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre affiché</label>
            <input
              type="text"
              value={maintenanceTitle}
              onChange={(e) => setMaintenanceTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Maintenance en cours"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message affiché</label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Nous effectuons des améliorations. De retour dans quelques minutes."
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveMaintenanceMessage}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              <Save size={16} />
              Sauvegarder le message
            </button>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2 : Feature Flags */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ToggleRight size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Fonctionnalités</h2>
            <p className="text-xs text-slate-500">Activer ou désactiver des features sans redéploiement</p>
          </div>
        </div>

        <div className="flex flex-col">
          <FeatureFlag
            label="Export PDF"
            description="Permettre aux users d'exporter leurs factures en PDF"
            settingKey="feature_pdf_export"
            value={settings.feature_pdf_export || 'false'}
            onToggle={handleToggle}
          />
          <FeatureFlag
            label="Impression"
            description="Permettre l'impression directe des factures"
            settingKey="feature_print"
            value={settings.feature_print || 'false'}
            onToggle={handleToggle}
          />
          <FeatureFlag
            label="Export CSV"
            description="Permettre l'export des factures en CSV"
            settingKey="feature_csv_export"
            value={settings.feature_csv_export || 'false'}
            onToggle={handleToggle}
          />
          <FeatureFlag
            label="Gestion clients"
            description="Permettre la gestion du carnet d'adresses"
            settingKey="feature_clients"
            value={settings.feature_clients || 'false'}
            onToggle={handleToggle}
          />
          <FeatureFlag
            label="Partage par lien"
            description="Générer un lien public pour partager une facture"
            settingKey="feature_invoice_share"
            value={settings.feature_invoice_share || 'false'}
            onToggle={handleToggle}
            badge="Bientôt"
            disabled={true}
          />
          <FeatureFlag
            label="Factures récurrentes"
            description="Créer des factures qui se génèrent automatiquement"
            settingKey="feature_recurring"
            value={settings.feature_recurring || 'false'}
            onToggle={handleToggle}
            badge="Bientôt"
            disabled={true}
          />
        </div>
      </motion.div>

      {/* SECTION 3 : Plan gratuit */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Plan gratuit</h2>
            <p className="text-xs text-slate-500">Configurer les limites du plan gratuit</p>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Limite de factures par mois</label>
            <input
              type="number"
              min="1"
              value={freePlanLimit}
              onChange={(e) => setFreePlanLimit(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Nombre maximum de factures par mois pour les comptes gratuits. (999999 = illimité)</p>
          </div>
          <button
            onClick={handleSaveFreePlanLimit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <Save size={16} />
            Sauvegarder
          </button>
        </div>
      </motion.div>

      {/* SECTION 4 : Backup manuel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Download size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Backup des données</h2>
            <p className="text-xs text-slate-500">Exporter toutes les données de la plateforme</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-blue-800 font-medium mt-0.5">
            Ces exports sont destinés à la sauvegarde. Stockez-les dans un endroit sécurisé.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleExport('users')}
            disabled={isExporting !== null}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group disabled:opacity-50"
          >
            <span className="font-bold text-slate-700 group-hover:text-indigo-700">Exporter tous les users (CSV)</span>
            <Download size={18} className="text-slate-400 group-hover:text-indigo-600" />
          </button>
          
          <button
            onClick={() => handleExport('invoices')}
            disabled={isExporting !== null}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group disabled:opacity-50"
          >
            <span className="font-bold text-slate-700 group-hover:text-indigo-700">Exporter toutes les factures (CSV)</span>
            <Download size={18} className="text-slate-400 group-hover:text-indigo-600" />
          </button>

          <button
            onClick={() => handleExport('logs')}
            disabled={isExporting !== null}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group disabled:opacity-50"
          >
            <span className="font-bold text-slate-700 group-hover:text-indigo-700">Exporter les logs d'activité (CSV)</span>
            <Download size={18} className="text-slate-400 group-hover:text-indigo-600" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
