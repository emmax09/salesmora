import { createDatabaseClient } from './client.js';

async function checkConnection(): Promise<void> {
  const client = createDatabaseClient();
  try {
    await client.$queryRaw`SELECT 1`;
    console.info('PostgreSQL connection succeeded.');
  } finally {
    await client.$disconnect();
  }
}

void checkConnection().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown connection error';
  console.error(`PostgreSQL connection failed: ${message}`);
  process.exitCode = 1;
});
