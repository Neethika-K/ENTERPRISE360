import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Isolated local test database (never touch dev.db). Path resolves relative
    // to the prisma schema dir → prisma/test.db, same as dev.db.
    env: { DATABASE_URL: 'file:./test.db' },
    // SQLite has a single writer; run files sequentially (no overlap).
    fileParallelism: false,
    setupFiles: ['tests/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
