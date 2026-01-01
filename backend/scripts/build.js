import * as esbuild from 'esbuild';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const require = createRequire(import.meta.url);

const buildLambdaFunctions = async () => {
  console.log('🔨 Building Lambda functions...');

  const handlers = [
    'handlers/projects',
    'handlers/contact',
    'handlers/newsletter',
    'handlers/testimonials',
    'handlers/blog',
  ];

  try {
    await esbuild.build({
      entryPoints: handlers.map(h => `src/${h}.js`),
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outdir: 'dist',
      outExtension: { '.js': '.mjs' },
      external: ['@aws-sdk/*'],
      banner: {
        js: `
          import { createRequire } from 'module';
          const require = createRequire(import.meta.url);
        `.trim(),
      },
    });

    console.log('✅ Lambda functions built successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error);
    return false;
  }
};

buildLambdaFunctions();
