import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// Obtiene todos los eventos ordenados por fecha, incluyendo sus categorías y el creador
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(
        `
        *,
        event_categories (
          category_id:categories (*)
        )
        `,
      )
      .order('date', { ascending: true });

    if (error) throw error;

    // Obtener todos los clerk_id únicos
    const clerkIds = [...new Set(events.map((e) => e.createdBy))];

    if (clerkIds.length === 0) {
      return res.json(events);
    }

    // Buscar los usuarios correspondientes en clerk_users
    const { data: users, error: userError } = await supabase
      .from('clerk_users')
      .select('*')
      .in('clerk_id', clerkIds);

    if (userError) throw userError;

    // Mapa clerk_id → usuario
    const userMap = new Map(users.map((u) => [u.clerk_id, u]));

    // Formatear respuesta final
    const formatted = events.map((event) => ({
      ...event,
      categories: event.event_categories?.map((ec: any) => ec.category) || [],
      createdBy: userMap.get(event.createdBy) || null, // reemplaza el ID con los datos del creador
    }));

    res.json(formatted);
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({
      error: err.message || JSON.stringify(err, null, 2),
    });
  }
};
