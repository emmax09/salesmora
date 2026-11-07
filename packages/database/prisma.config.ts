import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { fileURLToPath } from 'node:url';

const rootDirectory = new URL('../../', import.meta.url);
config({ path: fileURLToPath(new URL('.env', rootDirectory)) });
config({ path: fileURLToPath(new URL('.env.example', rootDirectory)) });

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Set DIRECT_URL or DATABASE_URL in the environment or root .env file.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: databaseUrl },
});
