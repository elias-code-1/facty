-- ===============================================================
-- 1. TABLES
-- ===============================================================

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  logo_url text,
  currency text NOT NULL DEFAULT 'FCFA',
  role text NOT NULL DEFAULT 'user' 
    CHECK (role IN ('user', 'admin')),
  is_suspended boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: clients
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','sent','paid','cancelled')),
  currency text NOT NULL DEFAULT 'FCFA',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  notes text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: invoice_items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0
);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: platform_settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: admin_notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Default values for platform_settings
INSERT INTO public.platform_settings (key, value, description) 
VALUES
  ('registrations_enabled', 'true', 'Activer ou désactiver les nouvelles inscriptions'),
  ('maintenance_message', '', 'Message de maintenance affiché à tous les users'),
  ('free_plan_invoice_limit', '999999', 'Limite de factures pour le plan gratuit')
ON CONFLICT (key) DO NOTHING;

-- ===============================================================
-- 2. INDEXES
-- ===============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at);

-- ===============================================================
-- 3. RLS — ACTIVATION
-- ===============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- ===============================================================
-- 4. FONCTIONS (Helper)
-- ===============================================================

-- Helper function pour vérifier le rôle admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
    AND public.profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================
-- 5. POLICIES — USERS
-- ===============================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- clients
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients"
ON public.clients FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients"
ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients"
ON public.clients FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients"
ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
ON public.invoices FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
CREATE POLICY "Users can insert own invoices"
ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
CREATE POLICY "Users can update own invoices"
ON public.invoices FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
CREATE POLICY "Users can delete own invoices"
ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- invoice_items
DROP POLICY IF EXISTS "Users can view own invoice items" ON public.invoice_items;
CREATE POLICY "Users can view own invoice items"
ON public.invoice_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE public.invoices.id = public.invoice_items.invoice_id
    AND public.invoices.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own invoice items" ON public.invoice_items;
CREATE POLICY "Users can insert own invoice items"
ON public.invoice_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE public.invoices.id = public.invoice_items.invoice_id
    AND public.invoices.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update own invoice items" ON public.invoice_items;
CREATE POLICY "Users can update own invoice items"
ON public.invoice_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE public.invoices.id = public.invoice_items.invoice_id
    AND public.invoices.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete own invoice items" ON public.invoice_items;
CREATE POLICY "Users can delete own invoice items"
ON public.invoice_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.invoices
    WHERE public.invoices.id = public.invoice_items.invoice_id
    AND public.invoices.user_id = auth.uid()
  )
);

-- audit_logs
DROP POLICY IF EXISTS "Users can insert logs" ON public.audit_logs;
CREATE POLICY "Users can insert logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- platform_settings
DROP POLICY IF EXISTS "Users can read settings" ON public.platform_settings;
CREATE POLICY "Users can read settings"
ON public.platform_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

-- ===============================================================
-- 6. POLICIES — ADMIN
-- ===============================================================

-- profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles"
ON public.profiles FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
CREATE POLICY "Admin can delete profiles"
ON public.profiles FOR DELETE USING (public.is_admin());

-- clients
DROP POLICY IF EXISTS "Admin can view all clients" ON public.clients;
CREATE POLICY "Admin can view all clients"
ON public.clients FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete clients" ON public.clients;
CREATE POLICY "Admin can delete clients"
ON public.clients FOR DELETE USING (public.is_admin());

-- invoices
DROP POLICY IF EXISTS "Admin can view all invoices" ON public.invoices;
CREATE POLICY "Admin can view all invoices"
ON public.invoices FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete invoices" ON public.invoices;
CREATE POLICY "Admin can delete invoices"
ON public.invoices FOR DELETE USING (public.is_admin());

-- invoice_items
DROP POLICY IF EXISTS "Admin can view all invoice items" ON public.invoice_items;
CREATE POLICY "Admin can view all invoice items"
ON public.invoice_items FOR SELECT USING (public.is_admin());

-- audit_logs
DROP POLICY IF EXISTS "Admin can view all logs" ON public.audit_logs;
CREATE POLICY "Admin can view all logs"
ON public.audit_logs FOR SELECT USING (public.is_admin());

-- admin_notifications
DROP POLICY IF EXISTS "Admin can view notifications" ON public.admin_notifications;
CREATE POLICY "Admin can view notifications"
ON public.admin_notifications FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update notifications" ON public.admin_notifications;
CREATE POLICY "Admin can update notifications"
ON public.admin_notifications FOR UPDATE USING (public.is_admin());

-- platform_settings
DROP POLICY IF EXISTS "Admin can update settings" ON public.platform_settings;
CREATE POLICY "Admin can update settings"
ON public.platform_settings FOR UPDATE USING (public.is_admin());

-- ===============================================================
-- 7. TRIGGERS & FONCTIONS (Business Logic)
-- ===============================================================

-- 1. Créer un profil vide à chaque inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Log l'inscription
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
  VALUES (NEW.id, 'auth.register', 'profile', NEW.id);
  
  -- Notification admin
  INSERT INTO public.admin_notifications (type, message, metadata)
  VALUES (
    'new_user',
    'Nouvel utilisateur inscrit : ' || NEW.email,
    jsonb_build_object('user_id', NEW.id, 'email', NEW.email)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Mettre à jour last_seen_at automatiquement
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET last_seen_at = now()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_audit_log_inserted ON public.audit_logs;
CREATE TRIGGER on_audit_log_inserted
AFTER INSERT ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.update_last_seen();

-- 3. Notification quand un user est suspendu/réactivé
CREATE OR REPLACE FUNCTION public.handle_suspension_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.is_suspended = false AND NEW.is_suspended = true THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(), 'account.suspended', 'profile', NEW.id,
      jsonb_build_object('target_user_id', NEW.id)
    );
  ELSIF OLD.is_suspended = true AND NEW.is_suspended = false THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(), 'account.reactivated', 'profile', NEW.id,
      jsonb_build_object('target_user_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_suspension_changed ON public.profiles;
CREATE TRIGGER on_suspension_changed
AFTER UPDATE OF is_suspended ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_suspension_change();

-- ===============================================================
-- INSTRUCTIONS FINALES
-- ===============================================================
-- 1. Exécutez ce script dans le SQL Editor de Supabase.
-- 2. Pour devenir admin, inscrivez-vous normalement, puis exécutez :
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'VOTRE_EMAIL';
