const express = require('express');
const dotenv = require('dotenv');

const { notFoundHandler } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');

const { ticketsRouter } = require('./modules/tickets/tickets.routes');
const { catalogRouter } = require('./modules/catalog/catalog.routes');

dotenv.config();

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/tickets', ticketsRouter);
  app.use('/api/catalog', catalogRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
