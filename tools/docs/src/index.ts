import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DocEngine } from './engine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

/**
 * Entry point for the Documentation API Generator.
 * Initializes the DocEngine and triggers the parsing/generation pipeline.
 */
async function main() {
  const engine = new DocEngine(projectRoot);
  const entries = await engine.process();
  
  console.log(`📦 Total entries documented: ${entries.length}`);
}

main().catch(err => {
  console.error('Fatal error during doc generation:', err);
  process.exit(1);
});
