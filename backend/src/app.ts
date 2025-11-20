import express, { Request, Response } from 'express';
import cors from 'cors';

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', userRoutes);
app.use('/api', authRoutes);

export default app;