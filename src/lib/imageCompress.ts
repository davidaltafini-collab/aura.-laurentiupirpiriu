/**
 * Compresie de imagini pe client, înainte de upload. Fără dependențe: folosește
 * canvas-ul browserului.
 *
 * Motivul: pozele de la aparat/telefon pot avea zeci de MB (ex. 35MB la 4K).
 * Upload-ul lor e lent și, în plus, Cloudinary respinge peste ~10MB pe planul
 * gratuit. Reducem latura mare la maxim `maxDimension` px și re-encodăm JPEG,
 * ceea ce aduce un 4K de 35MB la ~1–3MB, fără pierdere vizibilă pentru web
 * (Cloudinary mai optimizează oricum la livrare).
 */

interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 3200,
  quality: 0.82,
};

export async function compressImage(file: File, options?: CompressOptions): Promise<File> {
  const { maxDimension, quality } = { ...DEFAULTS, ...options };

  // GIF (animație) și non-imagini: le lăsăm neatinse, canvas-ul le-ar strica.
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  try {
    // `imageOrientation: 'from-image'` aplică rotația din EXIF — altfel pozele
    // făcute pe telefon în portret ar ieși rotite.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob) return file;

    // Dacă poza era deja mică și nu am redimensionat, iar JPEG-ul ar ieși mai
    // mare decât originalul (ex. un PNG mic), păstrăm originalul.
    if (scale === 1 && blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    // Format neacceptat de canvas (ex. HEIC pe un browser care nu-l decodează):
    // urcăm originalul, mai bine decât să blocăm upload-ul.
    return file;
  }
}
