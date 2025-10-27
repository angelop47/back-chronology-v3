// src/services/uploadService.ts
import fs from 'fs';
import { supabase } from '../config/supabase';

// Sube un archivo a Supabase Storage y retorna su URL pública
export const uploadToSupabase = async (filePath: string, fileName: string, mimeType?: string) => {
  // Lee el archivo del sistema de archivos
  const fileBuffer = fs.readFileSync(filePath);

  // Sube el archivo al bucket 'uploads' en Supabase
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`uploads/${fileName}`, fileBuffer, {
      contentType: mimeType || 'application/octet-stream',
      upsert: true,
    });

  fs.unlinkSync(filePath); // elimina el archivo temporal

  if (error) throw new Error(error.message);

  // obtener URL pública del archivo
  const { data: publicUrlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(`uploads/${fileName}`);

  return publicUrlData.publicUrl;
};
