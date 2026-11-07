import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(frontendDirectory, '../backend/openapi/v1.json');
const target = path.join(frontendDirectory, 'packages/api-client/openapi/v1.json');

await mkdir(path.dirname(target), { recursive: true });
await copyFile(source, target);
console.info('Synced frontend OpenAPI v1 snapshot from the backend.');
