const axios = require('axios');

const { wordsResponseFormat, validateWords } = require('../contracts/wordsContract');
const { AppError } = require('../errors/appError');

const groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';

async function generateWords(options = {}) {
  const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
  const model = options.model ?? process.env.GROQ_MODEL ?? 'openai/gpt-oss-20b';
  const httpClient = options.httpClient ?? axios;

  if (!apiKey) {
    throw new AppError('CONFIGURATION_ERROR', 'A variável GROQ_API_KEY não foi configurada.', 500);
  }

  let response;

  try {
    response = await httpClient.post(groqEndpoint, {
      model,
      messages: [
        {
          role: 'system',
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
      timeout: 10_000
    });
  } catch (error) {
    throw new AppError(
      'GROQ_REQUEST_ERROR',
      'Não foi possível consultar o serviço do Groq.',
      502,
      { cause: error }
    );
  }

  const content = response.data?.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    throw new AppError('GROQ_RESPONSE_ERROR', 'O Groq retornou uma resposta sem conteúdo válido.', 502);
  }

  let parsedContent;

  try {
    parsedContent = JSON.parse(content);
  } catch (error) {
    throw new AppError('INVALID_JSON_RESPONSE', 'O Groq retornou um JSON inválido.', 502, { cause: error });
  }

  return validateWords(parsedContent.words);
}

module.exports = { generateWords };
