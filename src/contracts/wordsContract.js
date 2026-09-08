const { AppError } = require('../errors/appError');

const wordSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['word', 'description', 'useCase'],
  properties: {
    word: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    useCase: { type: 'string', minLength: 1 }
  }
};

const wordsResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'english_vocabulary_words',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['words'],
      properties: {
        words: {
          type: 'array',
          minItems: 5,
          maxItems: 5,
          items: wordSchema
        }
      }
    }
  }
};

function throwInvalidContract() {
  throw new AppError(
    'INVALID_WORDS_CONTRACT',
    'A resposta recebida não respeita o contrato de palavras.',
    502
  );
}

function validateWords(words) {
  if (!Array.isArray(words) || words.length !== 5) {
    throwInvalidContract();
  }

  const expectedKeys = ['description', 'useCase', 'word'];
  const normalizedWords = words.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throwInvalidContract();
    }

    const keys = Object.keys(item).sort();
    const hasExactKeys = keys.length === expectedKeys.length
      && keys.every((key, index) => key === expectedKeys[index]);
    const hasValidValues = expectedKeys.every(
      (key) => typeof item[key] === 'string' && item[key].trim().length > 0,
    );

    if (!hasExactKeys || !hasValidValues) {
      throwInvalidContract();
    }

    return {
      word: item.word.trim(),
      description: item.description.trim(),
      useCase: item.useCase.trim()
    };
  });

  const uniqueWords = new Set(
    normalizedWords.map((item) => item.word.toLocaleLowerCase('en-US'))
  );

  if (uniqueWords.size !== normalizedWords.length) {
    throwInvalidContract();
  }

  return normalizedWords;
}

module.exports = { validateWords, wordsResponseFormat };
