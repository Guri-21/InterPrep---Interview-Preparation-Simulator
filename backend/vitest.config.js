import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30_000,      // mongodb-memory-server can be slow on first run
    hookTimeout: 30_000,
    include: ['src/__tests__/**/*.test.js'],
    // Run test files sequentially — they share a single MongoMemoryServer.
    fileParallelism: false,
  },
});
