const assert = require('node:assert/strict');
const test = require('node:test');

const { askOpenAI } = require('../src/services/openaiService');

const words = Array.from({ length: 5 }, (_, index) => ({
  word: `word-${index}`,
  description: `Descrição ${index}`,
  useCase: `Use case ${index}`
}));

test('solicita saída estruturada e retorna o contrato público', async () => {
  let requestBody;
  const httpClient = {
    async post(url, body) {
      requestBody = body;
      return { data: { choices: [{ message: { content: JSON.stringify({ words }) } }] } };
    }
  };

  const result = await askOpenAI({
    apiKey: 'test-key',
    model: 'test-model',
    httpClient
  });

  assert.deepEqual(result, words);
  assert.equal(requestBody.model, 'test-model');
  assert.equal(requestBody.response_format.type, 'json_schema');
  assert.equal(requestBody.response_format.json_schema.strict, true);
});

test('identifica uma chave ausente', async () => {
  await assert.rejects(askOpenAI({ apiKey: '' }), {
    code: 'CONFIGURATION_ERROR'
  });
});

test('identifica JSON inválido', async () => {
  const httpClient = {
    async post() {
      return { data: { choices: [{ message: { content: 'inválido' } }] } };
    }
  };

  await assert.rejects(askOpenAI({ apiKey: 'test-key', httpClient }), {
    code: 'INVALID_JSON_RESPONSE'
  });
});

test('identifica falhas na comunicação com a OpenAI', async () => {
  const httpClient = {
    async post() {
      throw new Error('network error');
    }
  };

  await assert.rejects(askOpenAI({ apiKey: 'test-key', httpClient }), {
    code: 'OPENAI_REQUEST_ERROR'
  });
});
