const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');

const { createAskRouter } = require('./routes/ask');

function createApp(options = {}) {
  const app = express();
  const allowedOrigin = options.allowedOrigin ?? process.env.CORS_ORIGIN ?? '*';

  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(cors({
    origin: allowedOrigin,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  if (!options.disableRateLimit) {
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 20,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Muitas requisições. Tente novamente mais tarde.'
        }
      }
    }));
  }

  app.use('/ask', createAskRouter({
    askOpenAI: options.askOpenAI,
    errorReporter: options.errorReporter
  }));

  app.get('/', (request, response) => {
    response.status(200).json({
      message: 'FIAP Vocabulary BFF está em execução.'
    });
  });

  app.get('/health', (request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  app.use((request, response) => {
    response.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' },
    });
  });

  return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
