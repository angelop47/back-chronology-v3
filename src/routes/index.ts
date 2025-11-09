// src/routes/index.ts
import { Express } from 'express';
import eventsRoutes from './eventsRoutes';
import categoriesRoutes from './categoriesRoutes';
import usersRoutes from './usersRoutes';

export const registerRoutes = (app: Express): void => {
  // Events routes
  app.use('/api/events', eventsRoutes);

  // Categories routes
  app.use('/api/categories', categoriesRoutes);

  // Users routes
  app.use('/api/users', usersRoutes);
};

export { default as eventsRoutes } from './eventsRoutes';
export { default as categoriesRoutes } from './categoriesRoutes';
export { default as usersRoutes } from './usersRoutes';
