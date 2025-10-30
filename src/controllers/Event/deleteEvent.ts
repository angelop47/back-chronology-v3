// src/controllers/Event/deleteEvent.ts
import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// Eliminar un evento
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Borramos primero las relaciones
    const { error: relError } = await supabase.from('event_categories').delete().eq('event_id', id);

    if (relError) throw relError;

    // Luego el evento principal
    const { error: eventError } = await supabase.from('events').delete().eq('id', id);

    if (eventError) throw eventError;

    res.json({ message: 'Evento eliminado con éxito' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: String(err) });
  }
};
