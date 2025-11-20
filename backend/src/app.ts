import express, { Request, Response } from 'express';
import cors from 'cors';

import userRoutes from './routes/user.routes';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', userRoutes);

export default app;