import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create dist directory if it doesn't exist
const distDir = join(__dirname, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Create a simple placeholder handler for Lambda
const placeholderHandler = `
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Lambda function placeholder - deploy actual code soon',
      event: event
    })
  };
};
`;

// Write placeholder to dist
import { writeFileSync } from 'fs';
writeFileSync(join(distDir, 'index.js'), placeholderHandler);

// Create Lambda deployment package
const outputPath = join(__dirname, '..', 'terraform', 'modules', 'api', 'lambda_functions.zip');
const output = createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Lambda package created: ${archive.pointer()} bytes`);
  console.log(`📦 Location: ${outputPath}`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();

// Also create empty layer zip
const layerOutputPath = join(__dirname, '..', 'terraform', 'modules', 'api', 'lambda_layer.zip');
const layerOutput = createWriteStream(layerOutputPath);
const layerArchive = archiver('zip', { zlib: { level: 9 } });

layerOutput.on('close', () => {
  console.log(`✅ Lambda layer created: ${layerArchive.pointer()} bytes`);
});

layerArchive.pipe(layerOutput);
layerArchive.append('# Placeholder', { name: 'README.md' });
layerArchive.finalize();
