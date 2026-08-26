/**
 * Compress an image File in-browser before uploading.
 *
 * - Downscales to fit within `maxWidth`/`maxHeight` (preserving aspect ratio).
 * - Re-encodes as JPEG (or PNG for PNGs) at the given `quality`.
 * - Flattens EXIF orientation so portrait phone photos display upright.
 * - Returns the ORIGINAL file when compression isn't possible or wouldn't help
 *   (e.g. tiny files, SVGs, or when the re-encoded blob isn't smaller).
 *
 * Works on the base44 media CDN because fetch() against media.base44.com is CORS-enabled.
 */
export async function compressImage(file, { maxWidth = 1600, maxHeight = 1200, quality = 0.82 } = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  if (file.type === 'image/svg+xml') return file;            // vector — leave alone
  if (file.type === 'image/gif') return file;               // animated gifs — leave alone
  if (file.size && file.size < 150 * 1024) return file;     // already tiny

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (e) {
    return file; // unsupported format (e.g. HEIC on some browsers) — upload as-is
  }

  try {
    let { width, height } = bitmap;
    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Flatten transparency onto white for JPEGs (avoids ugly black backgrounds)
    const isPng = file.type === 'image/png';
    if (!isPng) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(bitmap, 0, 0, w, h);

    const mime = isPng ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
    if (!blob) return file;
    if (blob.size >= (file.size || 0)) return file; // no size benefit

    const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');
    const ext = isPng ? 'png' : 'jpg';
    return new File([blob], `${baseName}.${ext}`, { type: mime, lastModified: Date.now() });
  } finally {
    if (bitmap && bitmap.close) bitmap.close();
  }
}

/**
 * Fetch an existing image URL, compress it, and return a File plus size info.
 * Returns null if the image can't be fetched (CORS/offline/etc.).
 */
export async function compressImageFromUrl(url, opts) {
  let res;
  try {
    res = await fetch(url, { mode: 'cors' });
  } catch (e) {
    return null;
  }
  if (!res.ok) return null;

  const blob = await res.blob();
  const originalSize = blob.size;
  const type = blob.type || 'image/jpeg';
  const name = (url.split('/').pop() || 'image').split('?')[0] || 'image';
  const file = new File([blob], name, { type });

  const compressed = await compressImage(file, opts);
  return {
    file: compressed,
    originalSize,
    compressedSize: compressed.size,
    wasCompressed: compressed !== file,
  };
}