import { supabase } from './supabaseClient';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  eventDate: string | null;
  sourcePage: string | null;
  imageUrl: string | null;
  kind: string;
  status: string;
  createdAt: string;
}

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  event_date: string | null;
  source_page: string | null;
  image_url: string | null;
  kind: string | null;
  status: string;
  created_at: string;
}

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    eventDate: row.event_date,
    sourcePage: row.source_page,
    imageUrl: row.image_url ?? null,
    kind: row.kind ?? 'contact',
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[leads] Eroare la citirea cererilor:', error.message);
    return [];
  }
  return (data as LeadRow[]).map(rowToLead);
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('leads').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteLead(id: string): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sesiunea admin a expirat. Autentifica-te din nou.');

  const response = await fetch(`/api/delete-lead?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Nu am putut sterge cererea.');
  }
}
