// src/services/uploadService.ts
import fs from 'fs';
import { supabase } from '../config/supabase';

export const uploadToSupabase = async (filePath: string, fileName: string, mimeType?: string) => {
  const fileBuffer = fs.readFileSync(filePath);

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
