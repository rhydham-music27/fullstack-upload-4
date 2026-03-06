const { createApp } = require('./app');
const { connectMongo } = require('./config/mongo');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectMongo();

  const app = createApp();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
