import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { TSParser } from './parsers/ts-parser';
import { RustParser } from './parsers/rust-parser';
import { Validator } from './validator';
import { Generator } from './generator';
import { Parser } from './types';

async function main() {
  const parsers: Parser[] = [new TSParser(), new RustParser()];
  const files = globSync('**/*.{ts,tsx,rs}', { 
    ignore: [
      'node_modules/**', 
      'dist/**', 
      'dist-electron/**', 
      'release/**', 
      'tools/api-doc-gen/**', 
      '**/target/**',
      '**/pkg/**',
      '**/*.d.ts'
    ] 
  });
  
  console.log(`🚀 Scanning ${files.length} files...`);

  const allEntries = [];
  for (const file of files) {
    const absolutePath = path.resolve(file);
    const content = fs.readFileSync(file, 'utf8');
    const parser = parsers.find(p => p.canParse(file));
    if (parser) {
      const entries = parser.parse(file, content);
      // Update entries to use absolute paths
      const updatedEntries = entries.map(e => ({
        ...e,
        file: absolutePath
      }));
      allEntries.push(...updatedEntries);
    }
  }

  // Validation
  const issues = Validator.validate(allEntries);
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  if (warnings.length > 0) {
    console.log(`\n⚠️  Documentation Warnings (${warnings.length}):`);
    warnings.forEach(w => console.log(`  [${w.file}:${w.line}] ${w.name}: ${w.message}`));
  }

  if (errors.length > 0) {
    console.log(`\n❌ Documentation Errors (${errors.length}):`);
    errors.forEach(e => console.log(`  [${e.file}:${e.line}] ${e.name}: ${e.message}`));
    console.error('\n❌ Documentation strictness check failed. Please fix the errors above.');
    process.exit(1);
  }

  // Generation
  const html = Generator.generate(allEntries);
  const outputPath = path.join(process.cwd(), 'index.html');
  fs.writeFileSync(outputPath, html);
  
  console.log(`\n✨ Documentation generated successfully at ${outputPath}`);
  console.log(`📦 Total entries documented: ${allEntries.length}`);
}

main().catch(err => {
  console.error('Fatal error during doc generation:', err);
  process.exit(1);
});
