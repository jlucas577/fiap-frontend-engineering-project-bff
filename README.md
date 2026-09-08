# FIAP Vocabulary BFF

API Backend for Frontend desenvolvida para a atividade de Front-end Engineering da FIAP. O serviço consulta a OpenAI e entrega ao front-end cinco palavras distintas em inglês, acompanhadas de explicação em português e exemplo de uso.

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Contrato da API](#contrato-da-api)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Testes](#testes)
- [Deploy](#deploy)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Participantes](#participantes)
- [Referências](#referências)

## Sobre o projeto

Este BFF fornece o conteúdo utilizado por uma aplicação de apoio ao estudo de inglês. A integração usa Structured Outputs com JSON Schema e também valida o resultado localmente antes de responder, preservando um contrato previsível para o front-end.

## Funcionalidades

- Geração de cinco palavras distintas em inglês.
- Explicações em português e exemplos de uso em inglês.
- Saída estruturada e validada.
- Tratamento separado para configuração ausente, indisponibilidade da OpenAI, JSON inválido e quebra de contrato.
- Limitação de requisições por endereço IP.
- CORS configurável por ambiente.
- Endpoint de saúde para monitoramento.
- Registro de erros no New Relic quando configurado.
- Testes automatizados sem chamadas reais à OpenAI.

## Contrato da API

### `GET /ask`

Retorna `200 OK` com um array contendo exatamente cinco itens:

```json
[
  {
    "word": "serendipity",
    "description": "Descoberta feliz feita por acaso.",
    "useCase": "Finding this book was pure serendipity."
  }
]
```

Cada objeto contém exclusivamente os campos obrigatórios `word`, `description` e `useCase`, todos preenchidos com texto. As palavras são únicas sem diferenciação entre letras maiúsculas e minúsculas.

Em caso de falha, a API responde no seguinte formato:

```json
{
  "error": {
    "code": "OPENAI_REQUEST_ERROR",
    "message": "Não foi possível consultar o serviço da OpenAI."
  }
}
```

### `GET /health`

Retorna `200 OK` quando o processo está disponível:

```json
{
  "status": "ok"
}
```

## Tecnologias

- Node.js 22 ou superior.
- Express para a API HTTP.
- Axios para comunicação com a OpenAI.
- OpenAI Chat Completions com Structured Outputs.
- Node.js Test Runner para testes automatizados.
- Express Rate Limit para proteção contra excesso de requisições.
- New Relic para observabilidade opcional.

## Como executar

### Pré-requisitos

- Node.js 22 ou superior.
- npm.
- Uma chave válida da API da OpenAI.

### Instalação

```bash
git clone https://github.com/jlucas577/fiap-frontend-engineering-project-bff.git
cd fiap-frontend-engineering-project-bff
npm install
cp .env.example .env
```

Preencha `OPENAI_API_KEY` no arquivo `.env` e inicie o serviço:

```bash
npm start
```

A API estará disponível em `http://localhost:3000`. Para verificar:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ask
```

## Testes

```bash
npm test
```

Para executar os testes em modo de observação:

```bash
npm run test:watch
```

Os testes usam dependências injetadas e não consomem créditos da OpenAI.

## Deploy

O projeto pode ser publicado como um Web Service no Render ou em outra plataforma compatível com Node.js.

### Exemplo no Render

1. Publique este repositório no GitHub.
2. No Render, crie um novo **Web Service** conectado ao repositório.
3. Configure o comando de instalação como `npm ci`.
4. Configure o comando de inicialização como `npm start`.
5. Cadastre `OPENAI_API_KEY` e `OPENAI_MODEL` nas variáveis do serviço.
6. Defina `CORS_ORIGIN` com a URL pública do front-end.
7. Faça o deploy e valide os endpoints `/health` e `/ask`.

A plataforma fornece `PORT` automaticamente. Nunca publique o arquivo `.env` nem exponha a chave da OpenAI no front-end.

### URLs públicas

- API: a definir após o deploy.
- Front-end: a definir após o deploy.

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Sim | - | Chave usada exclusivamente pelo servidor para autenticar na OpenAI. |
| `OPENAI_MODEL` | Não | `gpt-4o-mini` | Modelo utilizado para gerar as palavras. Deve aceitar Structured Outputs. |
| `PORT` | Não | `3000` | Porta HTTP local. |
| `CORS_ORIGIN` | Não | `*` | Origem autorizada a consumir a API. Em produção, use a URL do front-end. |
| `NEW_RELIC_APP_NAME` | Não | `My Application` | Nome da aplicação no New Relic. |
| `NEW_RELIC_LICENSE_KEY` | Não | - | Chave para habilitar o monitoramento no New Relic. |

## Estrutura do projeto

```text
src/
├── contracts/     # Schema e validação do contrato público
├── errors/        # Erros conhecidos da aplicação
├── routes/        # Rotas HTTP
├── services/      # Integração com a OpenAI
├── app.js         # Configuração da aplicação Express
└── server.js      # Inicialização do servidor
test/              # Testes automatizados
```

## Participantes

| Nome | Matrícula |
| --- | --- |
| Ana Carolina Domingos Moreira | RM368399 |
| Bruno Bergamasco de Azevedo | RM367485 |
| João Lucas Martins de Almeida | RM368253 |
| Rafael da Costa Fonseca | RM368026 |
| Roberto Dias da Cruz Maia | RM368380 |

## Referências

- [Como escrever um README no GitHub — Alura](https://www.alura.com.br/artigos/escrever-bom-readme)
- [Chat Completions — documentação oficial da OpenAI](https://developers.openai.com/api/reference/cli/resources/chat/subresources/completions)
