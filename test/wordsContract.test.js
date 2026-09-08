const assert = require('node:assert/strict');
const test = require('node:test');

const { validateWords } = require('../src/contracts/wordsContract');

const validWords = Array.from({ length: 5 }, (_, index) => ({
  word: `word-${index}`,
  description: `Descrição ${index}`,
  useCase: `Use case ${index}`,
}));

test('valida uma lista com cinco palavras distintas', () => {
  assert.deepEqual(validateWords(validWords), validWords);
});

test('rejeita uma quantidade diferente de cinco palavras', () => {
  assert.throws(() => validateWords(validWords.slice(0, 4)), {
    code: 'INVALID_WORDS_CONTRACT'
  });
});

test('rejeita propriedades adicionais', () => {
  const words = structuredClone(validWords);
  words[0].extra = 'valor inválido';

  assert.throws(() => validateWords(words), {
    code: 'INVALID_WORDS_CONTRACT'
  });
});

test('rejeita palavras duplicadas sem diferenciar maiúsculas', () => {
  const words = structuredClone(validWords);
  words[1].word = 'WORD-0';

  assert.throws(() => validateWords(words), {
    code: 'INVALID_WORDS_CONTRACT'
  });
});
