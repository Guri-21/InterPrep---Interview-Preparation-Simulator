/**
 * InterPrep API — process entrypoint.
 * Boots: load env → connect MongoDB → start Express on PORT.
 */
import { env } from './src/config/env.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import { buildApp } from './src/app.js';

async function main() {
  await connectDB();
  const app = buildApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[api] InterPrep API listening on http://localhost:${env.PORT}`);
    console.log(`[api] env=${env.NODE_ENV}  provider=${env.AI_PROVIDER}  cors=${env.CLIENT_URL}`);
  });

  // Graceful shutdown.
  const shutdown = async (signal) => {
    console.log(`[api] ${signal} received — shutting down`);
    server.close(() => console.log('[api] HTTP server closed'));
    await disconnectDB();
    process.exit(0);
  };
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('[api] unhandledRejection:', reason);
  });
}

main().catch((err) => {
  console.error('[api] Fatal startup error:', err);
  process.exit(1);
});
