import express, { Request, Response } from 'express';
import cors from 'cors';

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import categoryRoutes from './routes/category.routes';
import budgetRoutes from './routes/budget.routes';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', transactionRoutes);
app.use('/api', categoryRoutes);
app.use('/api', budgetRoutes);

export default app;