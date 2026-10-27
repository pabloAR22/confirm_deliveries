import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, HttpError } from './middlewares.js';
import { openapi } from './openapi.js';
import { router } from './routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json());

// CORS mínimo: el token va en un header (no cookies), así que basta con permitir el origen del frontend.
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use('/api/v1', router);
app.use((req, res, next) => next(new HttpError(404, 'Ruta no encontrada')));
app.use(errorHandler);
