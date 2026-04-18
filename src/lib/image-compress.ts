// Client-side image compression for KYC uploads.
// - Accepts only image/jpeg, image/jpg, image/png
// - Resizes to MAX_WIDTH preserving aspect ratio
// - Encodes as JPEG (smaller, universally supported)
// - Iteratively reduces quality until <= MAX_BYTES

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXT = /\.(jpe?g|png)$/i;
const MAX_WIDTH = 1024;
const MAX_BYTES = 1024 * 1024; // 1MB

export class KycValidationError extends Error {}

export function validateKycFile(file: File): void {
  const typeOk =
    ALLOWED_TYPES.includes(file.type.toLowerCase()) ||
    ALLOWED_EXT.test(file.name);
  if (!typeOk) {
    throw new KycValidationError("Only JPG or PNG images are allowed.");
  }
  // Hard cap raw upload at 10MB so we don't try to decode absurd files in-memory.
  if (file.size > 10 * 1024 * 1024) {
    throw new KycValidationError("Image is too large. Please use a photo under 10MB.");
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new KycValidationError("Could not read this image."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality
    );
  });
}

/**
 * Compress an image to <=1MB JPEG, max width 1024px.
 * Throws KycValidationError if the input fails validation.
 */
export async function compressKycImage(file: File): Promise<Blob> {
  validateKycFile(file);

  const img = await loadImage(file);

  const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new KycValidationError("Image processing not supported on this device.");
  // White background so any transparent PNG flattens cleanly.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  // Iteratively lower quality until under the size cap.
  const qualities = [0.8, 0.72, 0.65, 0.55, 0.45];
  let blob: Blob | null = null;
  for (const q of qualities) {
    blob = await canvasToBlob(canvas, q);
    if (blob.size <= MAX_BYTES) return blob;
  }
  // As a last resort, downscale further and try again at q=0.6.
  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = Math.round(w * 0.75);
  smallCanvas.height = Math.round(h * 0.75);
  const sctx = smallCanvas.getContext("2d");
  if (sctx) {
    sctx.fillStyle = "#ffffff";
    sctx.fillRect(0, 0, smallCanvas.width, smallCanvas.height);
    sctx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
    blob = await canvasToBlob(smallCanvas, 0.6);
    if (blob.size <= MAX_BYTES) return blob;
  }
  if (!blob) throw new KycValidationError("Could not compress image.");
  if (blob.size > MAX_BYTES) {
    throw new KycValidationError("Image is too large even after compression. Please retake the photo.");
  }
  return blob;
}
