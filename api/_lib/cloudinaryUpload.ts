import crypto from 'crypto';

/**
 * Upload server-side în Cloudinary, dintr-un data URI (base64).
 *
 * Folosit de /api/photo-submission: vizitatorul NU e autentificat, deci nu poate
 * folosi fluxul semnat din admin (api/cloudinary-sign). Aici serverul face
 * upload-ul cu cheia secretă Cloudinary, după ce a trecut de rate-limit — așa
 * cheia rămâne server-side și controlăm cine poate încărca.
 */
export async function uploadDataUriToCloudinary(dataUri: string, folder: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary nu e configurat pe server.');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message || 'Upload-ul către Cloudinary a eșuat.');
  }
  return body.secure_url as string;
}
