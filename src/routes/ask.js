const express = require('express');

const { AppError } = require('../errors/appError');
const { generateWords: defaultGenerateWords } = require('../services/groqService');

const silentErrorReporter = { noticeError() {} };

function getDefaultErrorReporter() {
  if (!process.env.NEW_RELIC_LICENSE_KEY) {
    return silentErrorReporter;
  }

  return require('newrelic');
}

function createAskRouter(options = {}) {
  const router = express.Router();
  const generateWords = options.generateWords ?? defaultGenerateWords;
  const errorReporter = options.errorReporter ?? getDefaultErrorReporter();

  router.get('/', async (request, response) => {
    try {
      const words = await generateWords();
      response.status(200).json(words);
    } catch (error) {
      errorReporter.noticeError(error, {
        endpoint: '/ask',
        errorCode: error.code ?? 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      });

      if (error instanceof AppError) {
        response.status(error.statusCode).json({
          error: { code: error.code, message: error.message }
        });
        return;
      }

      response.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno ao consultar as palavras.'
        }
      });
    }
  });

  return router;
}

module.exports = { createAskRouter };
