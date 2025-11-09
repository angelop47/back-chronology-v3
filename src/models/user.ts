// src/models/user.ts
export interface User {
  id: string; // ID interno UUID
  clerkId: string; // ID del usuario en Clerk (user_xxx)
  email?: string; // correo principal
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  lastEvent?: string; // último evento recibido (user.created, etc)
  updatedAt: string; // fecha del último sync (ISO date string)
}
