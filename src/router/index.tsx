import { ReactNode, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import Spinner from '../components/ui/Spinner';
import FullPageSpinner from '../components/ui/FullPageSpinner';

// Pages
import Auth from '../pages/Auth';
import Dashboard from '../pages/Dashboard';
import Invoices from '../pages/Invoices';
import InvoiceNew from '../pages/InvoiceNew';
import InvoiceDetail from '../pages/InvoiceDetail';
import InvoiceEdit from '../pages/InvoiceEdit';
import Clients from '../pages/Clients';
import Settings from '../pages/Settings';
import SuspendedPage from '../pages/Suspended';
import Maintenance from '../pages/Maintenance';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminUserDetail from '../pages/admin/AdminUserDetail';
import AdminInvoices from '../pages/admin/AdminInvoices';
import AdminLogs from '../pages/admin/AdminLogs';
import AdminStats from '../pages/admin/AdminStats';
import AdminCommunication from '../pages/admin/AdminCommunication';
import AdminSettings from '../pages/admin/AdminSettings';

// Layouts
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../components/layout/AdminLayout';

/** Composant pour protéger les routes privées */
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { session, user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({ title: '', message: '' });
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenance = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', [
          'maintenance_enabled',
          'maintenance_title',
          'maintenance_message'
        ]);

      if (data) {
        const map = data.reduce((acc, s) => ({
          ...acc, [s.key]: s.value
        }), {} as Record<string, string>);

        setMaintenanceMode(
          map['maintenance_enabled'] === 'true'
        );
        setMaintenanceData({
          title: map['maintenance_title'] ?? 'Maintenance en cours',
          message: map['maintenance_message'] ?? ''
        });
      }
      setSettingsLoading(false);
    };

    fetchMaintenance();
  }, []);

  // Vérification des variables d'environnement (pour le preview AI Studio)
  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-slate-50">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Supabase non configuré</h1>
        <p className="text-slate-600 mb-6 max-w-md">
          Veuillez configurer les variables d'environnement <strong>VITE_SUPABASE_URL</strong> et 
          <strong>VITE_SUPABASE_ANON_KEY</strong> dans le panneau Secrets de l'AI Studio.
        </p>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left text-sm font-mono">
          VITE_SUPABASE_URL=votre_url<br />
          VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
        </div>
      </div>
    );
  }

  if (authLoading || profileLoading || settingsLoading || (session && !profile)) {
    return <FullPageSpinner />;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.is_suspended) {
    return <SuspendedPage />;
  }

  // Maintenance : visible pour tous sauf admin
  if (maintenanceMode && profile?.role !== 'admin') {
    return (
      <Maintenance
        title={maintenanceData.title}
        message={maintenanceData.message}
      />
    );
  }

  return <>{children}</>;
};

/** Composant pour protéger les routes admin */
const AdminRoute = () => {
  const { session, user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user);

  // Attendre que LES DEUX soient chargés, et si on a une session, attendre d'avoir le profil
  if (authLoading || profileLoading || (session && !profile)) {
    return <FullPageSpinner />;
  }

  // Pas connecté → page login admin
  if (!session) {
    return <Navigate to="/admin/invoxa/login" replace />;
  }

  // Connecté mais pas admin → page login admin (pas de redirection vers /dashboard)
  if (profile?.role !== 'admin') {
    return <Navigate to="/admin/invoxa/login" replace />;
  }

  return <Outlet />;
};

/** Configuration du routeur principal */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Route publique admin */}
        <Route path="/admin/invoxa/login" element={<AdminLogin />} />
        
        {/* Routes protégées (Utilisateur standard) */}
        <Route element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<InvoiceNew />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Routes Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/invoxa" element={<AdminDashboard />} />
            <Route path="/admin/invoxa/users" element={<AdminUsers />} />
            <Route path="/admin/invoxa/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/invoxa/invoices" element={<AdminInvoices />} />
            <Route path="/admin/invoxa/logs" element={<AdminLogs />} />
            <Route path="/admin/invoxa/stats" element={<AdminStats />} />
            <Route path="/admin/invoxa/communication" element={<AdminCommunication />} />
            <Route path="/admin/invoxa/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
