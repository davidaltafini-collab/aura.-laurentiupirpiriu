import type { VercelRequest, VercelResponse } from './_lib/types';
import { getSupabaseAdmin } from './_lib/supabaseAdmin';
import { sendLeadEmails } from './_lib/mailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, eventDate, message, sourcePage, locale } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Numele este obligatoriu.' });
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Adresa de email nu este validă.' });
  }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Mesajul este obligatoriu.' });
  }

  const lead = {
    name: name.trim().slice(0, 200),
    email: email.trim().slice(0, 200),
    phone: typeof phone === 'string' ? phone.trim().slice(0, 50) : '',
    eventDate: typeof eventDate === 'string' ? eventDate.trim().slice(0, 100) : '',
    message: message.trim().slice(0, 5000),
  };

  try {
    const supabase = getSupabaseAdmin();
    const { error: dbError } = await supabase.from('leads').insert({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      event_date: lead.eventDate || null,
      message: lead.message,
      locale: typeof locale === 'string' ? locale : null,
      source_page: typeof sourcePage === 'string' ? sourcePage.slice(0, 200) : null,
    });

    if (dbError) {
      console.error('[api/contact] Eroare Supabase:', dbError.message);
      return res.status(500).json({ error: 'Nu am putut salva cererea. Încearcă din nou.' });
    }

    try {
      await sendLeadEmails(lead);
    } catch (mailError) {
      // Lead-ul e deja salvat în Supabase — nu blocăm utilizatorul dacă emailul eșuează,
      // dar logăm ca să știm să verificăm manual configurarea SMTP.
      console.error('[api/contact] Lead salvat, dar trimiterea emailului a eșuat:', mailError);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/contact] Eroare neașteptată:', err);
    return res.status(500).json({ error: 'A apărut o eroare neașteptată. Încearcă din nou.' });
  }
}
