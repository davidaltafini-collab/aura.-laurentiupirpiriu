import { supabase } from './supabaseClient';

interface CloudinarySignResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Trebuie să fii autentificat pentru a încărca poze.');

  const signRes = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!signRes.ok) {
    const body = await signRes.json().catch(() => ({}));
    throw new Error(body.error || 'Nu am putut obține permisiunea de upload.');
  }
  const sign: CloudinarySignResponse = await signRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sign.apiKey);
  formData.append('timestamp', String(sign.timestamp));
  formData.append('signature', sign.signature);
  formData.append('folder', sign.folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!uploadRes.ok) {
    const body = await uploadRes.json().catch(() => ({}));
    throw new Error(body?.error?.message || 'Upload-ul către Cloudinary a eșuat.');
  }

  const result = await uploadRes.json();
  return result.secure_url as string;
}
