const axios = require('axios');

const { wordsResponseFormat, validateWords } = require('../contracts/wordsContract');
const { AppError } = require('../errors/appError');

const openAIEndpoint = 'https://api.openai.com/v1/chat/completions';

async function askOpenAI(options = {}) {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const httpClient = options.httpClient ?? axios;

  if (!apiKey) {
    throw new AppError('CONFIGURATION_ERROR', 'A variável OPENAI_API_KEY não foi configurada.', 500);
  }

  let response;

  try {
    response = await httpClient.post(openAIEndpoint, {
      model,
      messages: [
        {
          role: 'developer',
          content: 'Você é um professor de inglês para estudantes brasileiros.'
        },
        {
          role: 'user',
          content: 'Gere cinco palavras distintas em inglês, cada uma com uma explicação em português e um exemplo de uso em inglês.'
        }
      ],
      response_format: wordsResponseFormat
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30_000
    });
  } catch (error) {
    throw new AppError(
      'OPENAI_REQUEST_ERROR',
      'Não foi possível consultar o serviço da OpenAI.',
      502,
      { cause: error }
    );
  }

  const content = response.data?.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    throw new AppError('OPENAI_RESPONSE_ERROR', 'A OpenAI retornou uma resposta sem conteúdo válido.', 502);
  }

  let parsedContent;

  try {
    parsedContent = JSON.parse(content);
  } catch (error) {
    throw new AppError('INVALID_JSON_RESPONSE', 'A OpenAI retornou um JSON inválido.', 502, { cause: error });
  }

  return validateWords(parsedContent.words);
}

module.exports = { askOpenAI };
