import { supabase } from './supabaseClient';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  eventDate: string | null;
  sourcePage: string | null;
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
