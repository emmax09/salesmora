import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const violations = [];
const ignored = new Set([
  '.git',
  '.next',
  '.pytest_cache',
  '.ruff_cache',
  '.turbo',
  '.venv',
  '__pycache__',
  'build',
  'coverage',
  'dist',
  'node_modules',
]);

function violation(message) {
  violations.push(message);
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

for (const requiredPath of [
  'frontend',
  'backend',
  'docs',
  'scripts',
  '.github',
  'README.md',
  'AGENTS.md',
  'frontend/package.json',
  'frontend/pnpm-workspace.yaml',
  'frontend/pnpm-lock.yaml',
  'backend/pyproject.toml',
  'backend/requirements.lock',
  'backend/.env.example',
  'backend/migrations/versions',
  'backend/worker/celery_app.py',
]) {
  if (!(await exists(requiredPath))) violation(`Required path is missing: ${requiredPath}`);
}

for (const forbiddenPath of [
  'packages',
  'package.json',
  'pnpm-workspace.yaml',
  'pnpm-lock.yaml',
  'node_modules',
  '.env',
  'backend/package.json',
  'backend/pnpm-workspace.yaml',
  'backend/pnpm-lock.yaml',
  'backend/node_modules',
]) {
  if (await exists(forbiddenPath)) violation(`Workspace boundary forbids root/backend path: ${forbiddenPath}`);
}

const frontendDependencies = JSON.parse(
  await readFile(path.join(root, 'frontend/package.json'), 'utf8'),
);
for (const dependency of ['@salesmora/api-client', '@salesmora/ui']) {
  if (!Object.hasOwn(frontendDependencies.dependencies ?? {}, dependency)) {
    violation(`frontend/package.json must declare ${dependency}`);
  }
}

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py']);
const importPattern = /\bfrom\s*['"]([^'"]+)['"]|\bimport\s*(?:\(\s*)?['"]([^'"]+)['"]/g;

async function visit(directory, workspace) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) await visit(filePath, workspace);
      continue;
    }
    if (!entry.isFile() || !sourceExtensions.has(path.extname(entry.name))) continue;
    const source = await readFile(filePath, 'utf8');
    if (workspace === 'backend') {
      if (/^\s*(?:from|import)\s+frontend(?:\.|\s|$)/m.test(source)) {
        violation(`${path.relative(root, filePath)} imports frontend-owned code`);
      }
      continue;
    }
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2];
      if (!specifier) continue;
      if (specifier.includes('backend') || specifier.startsWith('@salesmora/backend')) {
        violation(`${path.relative(root, filePath)} imports backend-owned code: ${specifier}`);
      }
      if (specifier.startsWith('@salesmora/')) {
        const declared = Object.hasOwn(frontendDependencies.dependencies ?? {}, specifier);
        if (!declared) {
          violation(`${path.relative(root, filePath)} imports undeclared dependency ${specifier}`);
        }
      }
    }
  }
}

await Promise.all([
  visit(path.join(root, 'frontend'), 'frontend'),
  visit(path.join(root, 'backend'), 'backend'),
]);

if (violations.length) {
  for (const issue of violations) console.error(issue);
  process.exitCode = 1;
} else {
  console.info('Frontend/Python backend workspace boundaries passed.');
}
