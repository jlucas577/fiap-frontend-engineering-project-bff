const assert = require('node:assert/strict');
const test = require('node:test');

const { generateWords } = require('../src/services/groqService');

const words = Array.from({ length: 5 }, (_, index) => ({
  word: `word-${index}`,
  description: `Descrição ${index}`,
  useCase: `Use case ${index}`
}));

test('solicita saída estruturada ao Groq e retorna o contrato público', async () => {
  let request;
  const httpClient = {
    async post(url, body, config) {
      request = { url, body, config };
      return { data: { choices: [{ message: { content: JSON.stringify({ words }) } }] } };
    }
  };

  const result = await generateWords({
    apiKey: 'test-key',
    model: 'test-model',
    httpClient
  });

  assert.deepEqual(result, words);
  assert.equal(request.url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(request.body.model, 'test-model');
  assert.equal(request.body.response_format.type, 'json_schema');
  assert.equal(request.body.response_format.json_schema.strict, true);
  assert.equal(request.config.timeout, 10_000);
});

test('identifica uma chave do Groq ausente', async () => {
  await assert.rejects(generateWords({ apiKey: '' }), {
    code: 'CONFIGURATION_ERROR'
  });
});

test('identifica JSON inválido retornado pelo Groq', async () => {
  const httpClient = {
    async post() {
      return { data: { choices: [{ message: { content: 'inválido' } }] } };
    }
  };

  await assert.rejects(generateWords({ apiKey: 'test-key', httpClient }), {
    code: 'INVALID_JSON_RESPONSE'
  });
});

test('identifica falhas na comunicação com o Groq', async () => {
  const httpClient = {
    async post() {
      throw new Error('network error');
    }
  };

  await assert.rejects(generateWords({ apiKey: 'test-key', httpClient }), {
    code: 'GROQ_REQUEST_ERROR'
  });
});
