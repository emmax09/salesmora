import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const limit = 500;
const rootDirectory = process.cwd();
const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
]);
const ignoredGeneratedDirectories = new Set([
  path.join('packages', 'database', 'src', 'generated', 'prisma'),
]);
const ignoredGeneratedFiles = new Set([path.join('apps', 'web', 'next-env.d.ts')]);
const sourceExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.sql',
]);
const violations = [];

async function visit(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    const relativePath = path.relative(rootDirectory, filePath);
    if (entry.isDirectory()) {
      if (
        !ignoredDirectories.has(entry.name) &&
        !ignoredGeneratedDirectories.has(relativePath)
      ) {
        await visit(filePath);
      }
      continue;
    }
    if (
      !entry.isFile() ||
      ignoredGeneratedFiles.has(relativePath) ||
      !sourceExtensions.has(path.extname(entry.name))
    ) {
      continue;
    }

    const contents = await readFile(filePath, 'utf8');
    const lines =
      contents.length === 0
        ? 0
        : contents.split(/\r\n|\r|\n/).length - (contents.endsWith('\n') ? 1 : 0);
    if (lines > limit) violations.push({ filePath, lines });
  }
}

await visit(process.cwd());
if (violations.length > 0) {
  for (const violation of violations) {
    console.error(
      `${path.relative(rootDirectory, violation.filePath)}: ${violation.lines} lines (limit ${limit})`,
    );
  }
  process.exitCode = 1;
} else {
  console.info(`Source file limit check passed (maximum ${limit} lines).`);
}
