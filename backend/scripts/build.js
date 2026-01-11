import * as esbuild from 'esbuild';
import { mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const TERRAFORM_API_PATH = join(__dirname, '..', '..', 'terraform', 'modules', 'api');

const buildLambdaFunctions = async () => {
  console.log('Building Lambda functions...');

  const handlers = [
    'handlers/projects',
    'handlers/contact',
    'handlers/newsletter',
    'handlers/testimonials',
    'handlers/blog',
    'handlers/admin/emails',
    'handlers/webhook/email',
    'handlers/admin/projects',
    'handlers/admin/blog',
    'handlers/admin/contacts',
  ];

  try {
    // Clean dist directory
    const distDir = join(__dirname, '..', 'dist');
    if (existsSync(distDir)) {
      rmSync(distDir, { recursive: true });
    }
    mkdirSync(distDir, { recursive: true });

    await esbuild.build({
      entryPoints: handlers.map(h => `src/${h}.js`),
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',  // Use CommonJS for Lambda
      outdir: 'dist',
      outbase: 'src',
      external: ['@aws-sdk/*'],
    });

    console.log('Lambda functions built successfully');

    // Create zip file
    await createZip();

    return true;
  } catch (error) {
    console.error('Build failed:', error);
    return false;
  }
};

const createZip = async () => {
  console.log('Creating Lambda deployment package...');

  const distDir = join(__dirname, '..', 'dist');
  const zipPath = join(TERRAFORM_API_PATH, 'lambda_functions.zip');

  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Lambda package created: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add all files from dist directory, preserving structure
    archive.directory(distDir, false);

    archive.finalize();
  });
};

buildLambdaFunctions();
