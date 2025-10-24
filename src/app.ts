import express from 'express';
import cors from 'cors';
import eventsRoutes from './routes/eventsRoutes';
import filesRoutes from './routes/filesRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/events', eventsRoutes);
app.use('/files', filesRoutes);

export default app;
