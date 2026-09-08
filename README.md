# FIAP Vocabulary BFF

API Backend for Frontend desenvolvida para a atividade de Front-end Engineering da FIAP. O serviço consulta o Groq e entrega ao front-end cinco palavras distintas em inglês, acompanhadas de explicação em português e exemplo de uso.

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

Este BFF fornece o conteúdo utilizado por uma aplicação de apoio ao estudo de inglês. A integração usa o Groq Free Tier com Structured Outputs e JSON Schema, além de validar o resultado localmente antes de responder, preservando um contrato previsível para o front-end.

## Funcionalidades

- Geração de cinco palavras distintas em inglês.
- Explicações em português e exemplos de uso em inglês.
- Saída estruturada e validada.
- Tratamento separado para configuração ausente, indisponibilidade do Groq, JSON inválido e quebra de contrato.
- Limitação de requisições por endereço IP.
- CORS configurável por ambiente.
- Endpoint de saúde para monitoramento.
- Registro de erros no New Relic quando configurado.
- Testes automatizados sem chamadas reais ao Groq.

## Contrato da API

### `GET /`

Retorna `200 OK` com uma mensagem indicando que a API está em execução:

```json
{
  "message": "FIAP Vocabulary BFF está em execução."
}
```

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
    "code": "GROQ_REQUEST_ERROR",
    "message": "Não foi possível consultar o serviço do Groq."
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
- Axios para comunicação com o Groq.
- Groq Chat Completions com Structured Outputs.
- Node.js Test Runner para testes automatizados.
- Express Rate Limit para proteção contra excesso de requisições.
- New Relic para observabilidade opcional.

## Como executar

### Pré-requisitos

- Node.js 22 ou superior.
- npm.
- Uma chave válida da API do Groq.

### Instalação

```bash
git clone https://github.com/jlucas577/fiap-frontend-engineering-project-bff.git
cd fiap-frontend-engineering-project-bff
npm install
cp .env.example .env
```

Preencha `GROQ_API_KEY` no arquivo `.env` e inicie o serviço:

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

Os testes usam dependências injetadas e não consomem a cota do Groq.

## Deploy

O BFF pode ser publicado gratuitamente na Vercel como uma única Vercel Function. A plataforma reconhece automaticamente a aplicação Express exportada por `src/app.js`, portanto não é necessário criar um arquivo `vercel.json`.

### Pré-requisitos

- Repositório publicado no GitHub.
- Conta na [Vercel](https://vercel.com/).
- Chave criada no [Groq Console](https://console.groq.com/keys).

### Deploy pelo painel da Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e entre com o GitHub.
2. Importe este repositório.
3. Mantenha o **Root Directory** apontando para a raiz do projeto.
4. Caso seja solicitado um framework, selecione **Other**. Não configure **Build Command** nem **Output Directory**.
5. Em **Settings > Environment Variables**, adicione:

   | Variável | Valor recomendado |
   | --- | --- |
   | `GROQ_API_KEY` | Chave privada iniciada por `gsk_` |
   | `GROQ_MODEL` | `openai/gpt-oss-20b` |
   | `CORS_ORIGIN` | URL pública do front-end ou `*` durante o desenvolvimento |
   | `NEW_RELIC_APP_NAME` | `FIAP Vocabulary BFF` |
   | `NEW_RELIC_LICENSE_KEY` | Chave do New Relic, caso o monitoramento seja utilizado |

6. Habilite as variáveis para **Production** e, se necessário, também para **Preview**.
7. Clique em **Deploy**.

A Vercel instala as dependências e gerencia a porta da função automaticamente. Não cadastre `PORT` no painel. Nunca publique o arquivo `.env` nem exponha `GROQ_API_KEY` ou `NEW_RELIC_LICENSE_KEY` no front-end.

### Validação do deploy

Após a publicação, substitua `URL_DA_API` pelo domínio fornecido pela Vercel:

```bash
curl https://URL_DA_API/
curl https://URL_DA_API/health
curl https://URL_DA_API/ask
```

Os dois primeiros endpoints devem responder imediatamente. `/ask` deve retornar um array com cinco palavras. Caso ocorra uma falha, consulte **Deployments > Logs** no painel da Vercel.

### Atualizações

Depois que o projeto estiver conectado ao GitHub, cada push na branch principal gera um novo deploy de produção. Branches e pull requests geram deployments de Preview. Alterações nas variáveis de ambiente só entram em vigor após um novo deploy.

Também é possível publicar pela [Vercel CLI](https://vercel.com/docs/cli):

```bash
npx vercel
npx vercel --prod
```

### URLs públicas

- API: a definir após o deploy.
- Front-end: a definir após o deploy.

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | Sim | - | Chave usada exclusivamente pelo servidor para autenticar no Groq. |
| `GROQ_MODEL` | Não | `openai/gpt-oss-20b` | Modelo gratuito utilizado para gerar as palavras com Structured Outputs. |
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
├── services/      # Integração com o Groq
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
- [Compatibilidade com OpenAI — documentação do Groq](https://console.groq.com/docs/openai)
- [Structured Outputs — documentação do Groq](https://console.groq.com/docs/structured-outputs)
- [Limites do plano gratuito — documentação do Groq](https://console.groq.com/docs/rate-limits)
