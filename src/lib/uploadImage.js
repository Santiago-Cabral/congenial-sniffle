import { supabase, bucketName } from "./Supabase";
import imageCompression from "browser-image-compression";

/* =====================================
   COMPRESIÓN DE IMAGEN
   ===================================== */
async function compressImage(file, maxWidthOrHeight, maxSizeMB) {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: "image/webp", // fuerza WebP sin importar el formato original
  };

  try {
    return await imageCompression(file, options);
  } catch (err) {
    console.error("Error al comprimir imagen:", err);
    return file; // fallback: sube el original si falla la compresión
  }
}

/* =====================================
   SUBIR UNA SOLA IMAGEN (genera full + thumb)
   ===================================== */
export async function uploadSingleImage(file) {
  if (!file) return null;

  // Generamos las dos variantes en paralelo
  const [full, thumb] = await Promise.all([
    compressImage(file, 1400, 0.4), // imagen grande, para el detalle
    compressImage(file, 400, 0.1),  // miniatura, para listados/cards
  ]);

  const base = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const fullName = `${base}.webp`;
  const thumbName = `${base}-thumb.webp`;

  const [fullUpload, thumbUpload] = await Promise.all([
    supabase.storage.from(bucketName).upload(fullName, full, {
      cacheControl: "31536000", // 1 año — el nombre es único, nunca se pisa
      upsert: false,
    }),
    supabase.storage.from(bucketName).upload(thumbName, thumb, {
      cacheControl: "31536000",
      upsert: false,
    }),
  ]);

  if (fullUpload.error) {
    console.error("Upload error (full):", fullUpload.error);
    throw fullUpload.error;
  }
  if (thumbUpload.error) {
    console.error("Upload error (thumb):", thumbUpload.error);
    // no tiramos el flujo entero por el thumb; seguimos con la principal
  }

  const { data: fullData } = supabase.storage.from(bucketName).getPublicUrl(fullName);
  const { data: thumbData } = supabase.storage.from(bucketName).getPublicUrl(thumbName);

  return {
    url: fullData.publicUrl,
    thumbUrl: thumbUpload.error ? fullData.publicUrl : thumbData.publicUrl, // fallback si el thumb falló
  };
}

/* =====================================
   SUBIR MULTIPLES IMÁGENES
   ===================================== */
export async function uploadMultipleImages(files) {
  const results = [];

  for (const file of files) {
    const result = await uploadSingleImage(file);
    results.push(result);
  }

  return results; // array de { url, thumbUrl }
}

/* =====================================
   BORRAR IMAGEN (borra full + thumb juntos)
   ===================================== */
export async function deleteImage(urlOrPair) {
  try {
    // Acepta tanto un string (compatibilidad vieja) como { url, thumbUrl }
    const urls =
      typeof urlOrPair === "string"
        ? [urlOrPair]
        : [urlOrPair?.url, urlOrPair?.thumbUrl].filter(Boolean);

    const paths = urls
      .map((url) => {
        const parts = url.split("/public/");
        return parts.length >= 2 ? parts[1] : null;
      })
      .filter(Boolean);

    if (paths.length === 0) return;

    await supabase.storage.from(bucketName).remove(paths);
  } catch (err) {
    console.error("Error al eliminar imagen:", err);
  }
}