import express from 'express';
import cors from 'cors';
import eventsRoutes from './routes/eventsRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/events', eventsRoutes);

export default app;
