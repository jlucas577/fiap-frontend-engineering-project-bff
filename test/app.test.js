const assert = require('node:assert/strict');
const test = require('node:test');

const { createApp } = require('../src/app');
const { AppError } = require('../src/errors/appError');

async function startTestServer(askOpenAI) {
  const app = createApp({
    askOpenAI,
    disableRateLimit: true,
    errorReporter: { noticeError() {} }
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

test('GET /health informa que o serviço está disponível', async (context) => {
  const server = await startTestServer(async () => []);
  context.after(server.close);

  const response = await fetch(`${server.baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('GET /ask devolve diretamente o array de palavras', async (context) => {
  const words = Array.from({ length: 5 }, (_, index) => ({
    word: `word-${index}`,
    description: `Descrição ${index}`,
    useCase: `Use case ${index}`
  }));
  const server = await startTestServer(async () => words);
  context.after(server.close);

  const response = await fetch(`${server.baseUrl}/ask`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), words);
});

test('GET /ask expõe um erro conhecido sem detalhes internos', async (context) => {
  const server = await startTestServer(async () => {
    throw new AppError('OPENAI_REQUEST_ERROR', 'Falha externa.', 502);
  });
  context.after(server.close);

  const response = await fetch(`${server.baseUrl}/ask`);

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: { code: 'OPENAI_REQUEST_ERROR', message: 'Falha externa.' }
  });
});
