import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useInvoices, InvoiceWithItems } from '../hooks/useInvoices';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { supabase } from '../lib/supabase';
import { exportInvoicePDF } from '../utils/exportPdf';
import InvoiceTemplate from '../components/invoice/InvoiceTemplate';
import InvoiceActions from '../components/invoice/InvoiceActions';
import InvoiceStatusBadge from '../components/invoice/InvoiceStatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';

import { motion } from 'framer-motion';

/**
 * Page de détail d'une facture
 * Affiche le template final et permet les actions de gestion
 */
export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { getInvoiceWithItems, updateStatus, deleteInvoice } = useInvoices(user);
  const { profile, loading: profileLoading } = useProfile(user);
  const { showToast } = useToast();
  const { pdfExport, print, loading: flagsLoading } = useFeatureFlags();

  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Charger la facture au mount
  useEffect(() => {
    const loadInvoice = async () => {
      if (!id || !user || authLoading) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await getInvoiceWithItems(id);
        
        if (!data) {
          throw new Error('Facture introuvable');
        }
        
        setInvoice(data);

        // Log consultation (audit)
        supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'invoice.viewed',
          entity_type: 'invoice',
          entity_id: data.id,
          metadata: { invoice_number: data.invoice_number }
        }).then(({ error: auditError }) => {
          if (auditError) console.warn('Audit log failed:', auditError);
        });

      } catch (err: any) {
        console.error('Erreur chargement facture:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, user, authLoading, getInvoiceWithItems]);

  const handleStatusChange = async (status: InvoiceWithItems['status']) => {
    if (!invoice) return;
    try {
      await updateStatus(invoice.id, status);
      setInvoice(prev => prev ? { ...prev, status } : null);
      showToast(`Statut mis à jour : ${status}`, 'success');
    } catch (err) {
      showToast('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleExportPDF = async () => {
    if (!invoice || !user) return;
    setExportLoading(true);
    try {
      await exportInvoicePDF(
        'invoice-template',
        `Invoxa-${invoice.invoice_number}.pdf`
      );
      
      // Logger l'export
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'invoice.exported_pdf',
        entity_type: 'invoice',
        entity_id: invoice.id,
        metadata: { invoice_number: invoice.invoice_number }
      });
      
      showToast('PDF téléchargé avec succès ✓', 'success');
    } catch (err) {
      console.error('Erreur export PDF:', err);
      showToast('Erreur lors de la génération du PDF', 'error');
    } finally {
      setExportLoading(false);
    }
  };
  
  const handlePrint = async () => {
    if (!invoice || !user) return;
    setPrintLoading(true);
    try {
      // Petit délai pour que le DOM soit prêt
      await new Promise(resolve => setTimeout(resolve, 300));
      
      window.print();
  
      // Log après impression
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'invoice.printed',
        entity_type: 'invoice',
        entity_id: invoice.id,
        metadata: { invoice_number: invoice.invoice_number }
      });
  
      showToast('Impression lancée ✓', 'success');
    } catch (err) {
      console.error('Erreur impression:', err);
      showToast("Erreur lors de l'impression", 'error');
    } finally {
      setPrintLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    try {
      setIsDeleting(true);
      await deleteInvoice(invoice.id);
      showToast('Facture supprimée avec succès', 'success');
      navigate('/invoices');
    } catch (err) {
      showToast('Erreur lors de la suppression de la facture', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // 1. État Chargement
  if (loading || profileLoading || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  // 2. État Erreur
  if (error || !invoice || !profile) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Oups ! Une erreur est survenue</h2>
        <p className="text-slate-500 mb-6">
          {error?.message || 'Nous n\'avons pas pu charger les détails de cette facture.'}
        </p>
        
        {error && (
          <div className="bg-slate-50 p-4 rounded-xl text-left mb-8 overflow-auto max-h-32">
            <p className="text-xs font-mono text-slate-400 uppercase mb-2">Détails techniques :</p>
            <code className="text-xs text-red-600">{JSON.stringify(error, null, 2)}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
            Retour aux factures
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <RefreshCw size={20} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // 3. État Succès (Affichage Data)
  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* BARRE D'ACTIONS & NAVIGATION (no-print) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            <Link 
              to="/invoices"
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Retour aux factures"
            >
              <ArrowLeft size={24} />
            </Link>
            
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 md:gap-3">
                <h1 className="text-base md:text-lg font-black text-slate-800 tracking-tight truncate max-w-[120px] xs:max-w-[180px] md:max-w-none">
                  {invoice.invoice_number}
                </h1>
                <InvoiceStatusBadge status={invoice.status} size="sm" />
              </div>
              <p className="hidden xs:block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Émise le {new Intl.DateTimeFormat('fr-FR').format(new Date(invoice.issue_date))}
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <InvoiceActions 
              invoice={invoice}
              onStatusChange={handleStatusChange}
              onDelete={() => setShowDeleteConfirm(true)}
              onExportPDF={pdfExport ? handleExportPDF : undefined}
              exportLoading={exportLoading}
              onPrint={print ? handlePrint : undefined}
              printLoading={printLoading}
            />
          </div>
        </div>
      </div>

      {/* Fixed Action Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] no-print">
        <InvoiceActions 
          invoice={invoice}
          onStatusChange={handleStatusChange}
          onDelete={() => setShowDeleteConfirm(true)}
          onExportPDF={pdfExport ? handleExportPDF : undefined}
          exportLoading={exportLoading}
          onPrint={print ? handlePrint : undefined}
          printLoading={printLoading}
          isMobile
        />
      </div>

      {/* ZONE D'IMPRESSION / TEMPLATE */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div id="invoice-print-wrapper">
            <InvoiceTemplate 
              ref={invoiceRef}
              invoice={invoice}
              profile={profile}
            />
          </div>
        </motion.div>
      </div>

      {/* DIALOGUE DE CONFIRMATION DE SUPPRESSION */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la facture ?"
        message={`Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoice_number} ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        confirmVariant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
