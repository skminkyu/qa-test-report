import express from 'express';
import cors from 'cors';
import testersRouter from './routes/testers';
import testItemsRouter from './routes/test-items';
import reportsRouter from './routes/reports';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/testers', testersRouter);
app.use('/api/test-items', testItemsRouter);
app.use('/api/reports', reportsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;
