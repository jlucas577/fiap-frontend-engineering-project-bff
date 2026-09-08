require('dotenv').config();

if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

const app = require('./app');

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`BFF rodando na porta ${port}`);
});
