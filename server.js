import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { interviewQuestionsHandler, jobMatchHandler } from './api/_lib/geminiHandlers.js';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '100kb' }));
app.post('/api/job-match', jobMatchHandler);
app.post('/api/interview-questions', interviewQuestionsHandler);

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const port = Number(process.env.PORT) || 3000;

if (isProduction) {
  const distDir = path.join(rootDir, 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
} else {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Candidly ${isProduction ? 'server' : 'dev server'} running at http://localhost:${port}`);
});
