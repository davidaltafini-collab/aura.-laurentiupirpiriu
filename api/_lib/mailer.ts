import nodemailer from 'nodemailer';

interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  message: string;
}

function getTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Lipsesc variabilele de email (EMAIL_HOST/EMAIL_PORT/EMAIL_USER/EMAIL_PASS) din Vercel.');
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

export async function sendLeadEmails(lead: LeadInput) {
  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_USER!;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!adminEmail) {
    throw new Error('Lipsește ADMIN_NOTIFICATION_EMAIL din variabilele de mediu Vercel.');
  }

  const details = [
    ['Nume', lead.name],
    ['Email', lead.email],
    ['Telefon', lead.phone || '—'],
    ['Data evenimentului', lead.eventDate || '—'],
  ];

  const detailsHtml = details.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;">${k}</td><td>${escapeHtml(v)}</td></tr>`).join('');

  await Promise.all([
    // Notificare către Laurentiu
    transporter.sendMail({
      from: `"CAPTUR. — Site" <${fromAddress}>`,
      to: adminEmail,
      replyTo: lead.email,
      subject: `Cerere nouă de pe site — ${lead.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;">
          <h2 style="margin-bottom:16px;">Ai o cerere nouă</h2>
          <table>${detailsHtml}</table>
          <p style="margin-top:16px;white-space:pre-wrap;">${escapeHtml(lead.message)}</p>
        </div>
      `,
    }),
    // Confirmare către persoana care a completat formularul
    transporter.sendMail({
      from: `"CAPTUR. Photography" <${fromAddress}>`,
      to: lead.email,
      subject: 'Am primit cererea ta — CAPTUR. Photography',
      html: `
        <div style="font-family:sans-serif;max-width:480px;">
          <h2 style="margin-bottom:16px;">Mulțumim, ${escapeHtml(lead.name)}!</h2>
          <p>Am primit cererea ta și Laurentiu îți va răspunde în cel mai scurt timp, direct pe acest email.</p>
          <p style="color:#666;margin-top:24px;">— Echipa CAPTUR.</p>
        </div>
      `,
    }),
  ]);
}

// Notificare către Laurentiu când un vizitator trimite o poză din footer.
export async function sendPhotoSubmissionEmail(input: { email: string; message: string; imageUrl: string }) {
  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_USER!;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    throw new Error('Lipsește ADMIN_NOTIFICATION_EMAIL din variabilele de mediu Vercel.');
  }

  await transporter.sendMail({
    from: `"CAPTUR. — Site" <${fromAddress}>`,
    to: adminEmail,
    replyTo: input.email,
    subject: 'Poză nouă trimisă de un vizitator',
    html: `
      <div style="font-family:sans-serif;max-width:480px;">
        <h2 style="margin-bottom:16px;">Ai primit o poză</h2>
        <p style="color:#666;">De la: <strong>${escapeHtml(input.email)}</strong></p>
        ${input.message ? `<p style="margin-top:12px;white-space:pre-wrap;">${escapeHtml(input.message)}</p>` : ''}
        <p style="margin-top:16px;"><a href="${input.imageUrl}">Deschide poza în mărime completă</a></p>
        <img src="${input.imageUrl}" alt="Poză trimisă" style="max-width:100%;border-radius:12px;margin-top:8px;" />
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
