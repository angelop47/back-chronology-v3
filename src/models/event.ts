// src/models/event.ts
export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  createdAt: string; // ISO date string
  verified: boolean;
  imageUrl?: string[];
  categories?: string[]; // Array de IDs de categorías
  createdBy: string; // ID del usuario que creó el evento
}
