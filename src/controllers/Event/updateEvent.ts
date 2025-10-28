import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import { uploadToSupabase } from '../../services/uploadService';

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    let { event_categories, ...fieldsToUpdate } = req.body;

    // 🧩 Si los campos vienen en formato string (por form-data), parsealos
    if (typeof event_categories === 'string') {
      try {
        event_categories = JSON.parse(event_categories);
      } catch {
        event_categories = [];
      }
    }

    // 🖼️ Si vienen archivos (por ejemplo nuevas imágenes), súbelos
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const imageUrls: string[] = [];

      for (const file of files) {
        const url = await uploadToSupabase(file.path, file.originalname, file.mimetype);
        imageUrls.push(url);
      }

      // Agregamos o reemplazamos el campo imageUrl
      fieldsToUpdate.imageUrl = imageUrls;
    }

    // ✏️ Actualizar los campos del evento (solo los que vinieron)
    if (Object.keys(fieldsToUpdate).length > 0) {
      const { error: updateError } = await supabase
        .from('events')
        .update(fieldsToUpdate)
        .eq('id', id);

      if (updateError) throw updateError;
    }

    // 🔗 Si se enviaron categorías, actualiza la tabla intermedia
    if (event_categories && Array.isArray(event_categories)) {
      await supabase.from('event_categories').delete().eq('event_id', id);

      const { error: relError } = await supabase.from('event_categories').insert(
        event_categories.map((catId: string) => ({
          event_id: id,
          category_id: catId,
        })),
      );

      if (relError) throw relError;
    }

    res.json({ message: 'Evento actualizado correctamente' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: String(err) });
  }
};
