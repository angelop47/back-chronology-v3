// src/routes/index.ts
import { Express } from 'express';
import eventsRoutes from './eventsRoutes';
import categoriesRoutes from './categoriesRoutes';

export const registerRoutes = (app: Express): void => {
  // Events routes
  app.use('/events', eventsRoutes);

  // Categories routes
  app.use('/categories', categoriesRoutes);
};

export { default as eventsRoutes } from './eventsRoutes';
export { default as categoriesRoutes } from './categoriesRoutes';
