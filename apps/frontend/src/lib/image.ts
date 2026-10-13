/**
 * Downscales a data-URL image in the browser before it is sent to the API.
 *
 * Images are stored as base64 strings on the row itself, so an uncompressed
 * phone photo becomes several megabytes of database column that is then re-sent
 * with every list response. Everything that accepts an upload must go through
 * here.
 */
export async function compressImage(
  base64Str: string,
  maxWidth = 150,
  quality = 0.6,
): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith("data:image")) {
      return resolve(base64Str);
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = maxWidth / img.width;
      if (ratio >= 1) return resolve(base64Str);
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64Str);
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a picked file and returns a downscaled data URL. Product artwork is
 * shown as a small thumbnail in lists and inside generated PDFs, so 800px wide
 * is comfortably more than either needs.
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxWidth = 800,
  quality = 0.7,
): Promise<string> {
  return compressImage(await readAsDataUrl(file), maxWidth, quality);
}

/** Width of the list thumbnail. Wide enough for a retina 48px avatar. */
export const THUMBNAIL_WIDTH = 160;

/**
 * Produces both sizes a product needs from a single pick: the full image for
 * the detail page and PDFs, and a thumbnail for list responses.
 *
 * Lists never receive the full image, so the thumbnail is what keeps the
 * catalogue page's payload small — around a tenth of the full size.
 */
export async function fileToProductImages(
  file: File,
): Promise<{ productImage: string; productThumbnail: string }> {
  const original = await readAsDataUrl(file);
  const [productImage, productThumbnail] = await Promise.all([
    compressImage(original, 800, 0.7),
    compressImage(original, THUMBNAIL_WIDTH, 0.6),
  ]);
  return { productImage, productThumbnail };
}
