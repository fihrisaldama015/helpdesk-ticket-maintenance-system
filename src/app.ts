import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';

// import authRoutes from './routes/auth.routes';
// import ticketRoutes from './routes/ticket.routes';

config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/auth', authRoutes);
// app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Helpdesk Ticket System API' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

export default app;