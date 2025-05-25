import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mainRouter from './routes';
import { globalErrorHandler } from './utils/errorHandler';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', mainRouter);

app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
