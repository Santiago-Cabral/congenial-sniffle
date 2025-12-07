import { supabase, bucketName } from "./Supabase";
import imageCompression from "browser-image-compression";

/* =====================================
   COMPRESIÓN DE IMAGEN
   ===================================== */
async function compressImage(file) {
  const options = {
    maxSizeMB: 0.6,          // Peso máximo ~600kb
    maxWidthOrHeight: 1400,  // Escala máxima
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (err) {
    console.error("Error al comprimir imagen:", err);
    return file; // fallback
  }
}

/* =====================================
   SUBIR UNA SOLA IMAGEN
   ===================================== */
export async function uploadSingleImage(file) {
  if (!file) return null;

  // Comprimir antes de subir
  const compressed = await compressImage(file);

  // Crear nombre aleatorio
  const ext = compressed.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.${ext}`;

  // Subir
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, compressed, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw error;
  }

  // Obtener url pública
  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);

  return data.publicUrl;
}

/* =====================================
   SUBIR MULTIPLES IMÁGENES
   ===================================== */
export async function uploadMultipleImages(files) {
  const urls = [];

  for (const file of files) {
    const url = await uploadSingleImage(file);
    urls.push(url);
  }

  return urls;
}

/* =====================================
   BORRAR IMAGEN
   ===================================== */
export async function deleteImage(url) {
  try {
    const parts = url.split("/public/");
    if (parts.length < 2) return;

    const path = parts[1];

    await supabase.storage.from(bucketName).remove([path]);
  } catch (err) {
    console.error("Error al eliminar imagen:", err);
  }
}
