import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * MongoDB connector. Idempotent — multiple callers in the same process share
 * the underlying connection. We don't pass deprecated options (mongoose 8+
 * defaults already include unified topology + new parser).
 */
let connection = null;

export async function connectDB() {
  if (connection) return connection;

  mongoose.set('strictQuery', true);

  connection = await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: !env.isProd, // build indexes automatically in dev only
  });

  const { name, host, port } = mongoose.connection;
  console.log(`[db] Connected to mongodb://${host}${port ? `:${port}` : ''}/${name}`);

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });

  return connection;
}

export async function disconnectDB() {
  if (!connection) return;
  await mongoose.disconnect();
  connection = null;
}
