/** Types TypeScript pour les tables de la base de données */

export interface Profile {
  id: string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string | null;
  currency: string;
  role: 'user' | 'admin';
  team_role?: string | null;
  invited_by?: string | null;
  is_suspended: boolean;
  is_premium?: boolean;
  premium_expires_at?: string | null;
  plan_type?: string | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  currency: string;
  issue_date: string;
  due_date: string;
  notes: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export type AdminNotificationType = 'new_user' | 'limit_reached' | 'critical_error';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export type AnnouncementType = 'info' | 'warning' | 'success' | 'error';
export type AnnouncementTarget = 'all' | 'specific';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  is_active: boolean;
  target: AnnouncementTarget;
  target_user_id: string | null;
  created_by: string | null;
  expires_at: string | null;
  created_at: string;
}
