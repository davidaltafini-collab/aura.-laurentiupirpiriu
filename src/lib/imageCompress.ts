/**
 * Compresie de imagini pe client — INTELIGENTĂ: comprimă doar când e strict
 * necesar. E un site de fotografie, deci pozele trebuie să rămână la calitate
 * maximă; nu atingem nimic dacă poza urcă oricum fără probleme.
 *
 * Singurul caz în care compresia e obligatorie: fișierul depășește limita de
 * upload a Cloudinary (10MB pe planul gratuit) — atunci ar fi respins complet.
 * Sub limită, urcăm originalul neatins, iar Cloudinary optimizează oricum la
 * livrare (deci vizitatorul primește o versiune ușoară, fără să sacrificăm
 * originalul stocat).
 */

// Limita Cloudinary pentru imagini pe planul gratuit.
const CLOUDINARY_MAX_BYTES = 10 * 1024 * 1024;
// Ținta când suntem nevoiți să comprimăm — confortabil sub limită.
const SAFE_TARGET_BYTES = 9 * 1024 * 1024;
// Când comprimăm, nu coborâm sub o latură generoasă: păstrăm detaliul.
const MAX_DIMENSION_WHEN_COMPRESSING = 4096;
// Ordinea de calitate încercată — pornim foarte sus și coborâm doar cât trebuie.
const QUALITY_STEPS = [0.92, 0.88, 0.84, 0.8, 0.75];

/**
 * @returns fișierul original dacă nu e nevoie de compresie, altfel o versiune
 *          JPEG suficient de mică cât să treacă de Cloudinary, la cea mai mare
 *          calitate care încape sub limită.
 */
export async function compressImage(file: File): Promise<File> {
  // Non-imagini și GIF (animație): nu le atingem.
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  // Cazul normal pentru un site de poze: fișierul e sub limită -> ORIGINAL,
  // fără nicio pierdere de calitate. Nu decodăm nimic, nu re-encodăm nimic.
  if (file.size <= CLOUDINARY_MAX_BYTES) return file;

  // Doar aici, pentru fișierele care altfel ar fi respinse, comprimăm.
  try {
    // `imageOrientation: 'from-image'` coace rotația din EXIF în pixeli — altfel
    // pozele de telefon în portret ar ieși rotite după re-encodare.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

    const maxDim = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_DIMENSION_WHEN_COMPRESSING / maxDim);
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

    // Coborâm calitatea progresiv, dar ne oprim la prima care încape sub țintă —
    // deci păstrăm cea mai bună calitate posibilă. Ultima treaptă e acceptată
    // oricum, ca să garantăm că iese ceva sub limită.
    for (const quality of QUALITY_STEPS) {
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', quality),
      );
      if (!blob) continue;
      const isLast = quality === QUALITY_STEPS[QUALITY_STEPS.length - 1];
      if (blob.size <= SAFE_TARGET_BYTES || isLast) {
        const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
      }
    }
    return file;
  } catch {
    // Format neacceptat de canvas (ex. HEIC pe unele browsere): întoarcem
    // originalul. Dacă depășește limita, Cloudinary îl va respinge cu un mesaj
    // clar — pe care admin-ul îl vede acum în alertă.
    return file;
  }
}
