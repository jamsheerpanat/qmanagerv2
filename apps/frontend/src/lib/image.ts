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
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return compressImage(dataUrl, maxWidth, quality);
}
