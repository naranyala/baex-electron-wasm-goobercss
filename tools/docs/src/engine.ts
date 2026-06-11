import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { globSync } from 'glob';
import { Validator } from './validator';
import { DocEntry, DocParam, DocType } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Language-specific configuration for the Universal Parser.
 * Defines how to identify comments, attributes, and language-specific code structures.
 */
interface LanguageProfile {
  /** File extensions supported by this profile. */
  extensions: string[];
  /** Predicate to check if a line marks the start of a doc comment. */
  commentStart: (line: string) => boolean;
  /** Predicate to check if a line is a language attribute/decorator. */
  isAttribute: (line: string) => boolean;
  /** Logic to strip comment prefixes and suffixes. */
  cleanComment: (line: string) => string;
  /** Predicate to check if a line marks the end of a block comment. */
  isCommentEnd: (line: string) => boolean;
  /** Logic to extract entry metadata (name, type, visibility) from a signature. */
  identify: (signature: string, scopeStack: string[], wasmExport: boolean) => { name: string; type: DocType; isPublic: boolean };
  /** Logic to parse language-specific tags like @param or # Arguments. */
  parseTags: (comment: string, signature: string) => { description: string, params: DocParam[], returns?: string };
}

/**
 * A unified documentation engine that handles multiple languages through 
 * integrated profiles rather than separate modules.
 * Orchestrates the full pipeline: scanning, parsing, validation, and report generation.
 */
export class DocEngine {
  private projectRoot: string;

  /**
   * Initializes the engine with the project's root path.
   * @param projectRoot Absolute path to the repository root.
   */
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Internal registry of language profiles.
   * Currently supports TypeScript (.ts, .tsx) and Rust (.rs).
   */
  private profiles: Record<'ts' | 'rs', LanguageProfile> = {
    ts: {
      extensions: ['.ts', '.tsx'],
      commentStart: (l) => l.startsWith('/**'),
      isAttribute: (l) => l.startsWith('@'),
      isCommentEnd: (l) => l.includes('*/'),
      cleanComment: (l) => l.trim().replace(/^\/\*\*|\*\/$|^\*/, '').trim(),
      identify: (sig, scope) => {
        let type: DocType = 'function';
        if (sig.includes('class ')) type = 'class';
        else if (sig.includes('interface ')) type = 'interface';
        else if (sig.includes('enum ')) type = 'enum';
        else if (sig.includes('type ') || sig.includes('const ') || sig.includes('let ')) type = 'variable';
        else if (scope.length > 0) type = 'method';
        const isPublic = sig.includes('export ') || sig.includes('public ');
        const nameMatch = sig.match(/(?:export\s+)?(?:class|interface|enum|function|const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/) 
                       || sig.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]/)
                       || sig.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        return { name: nameMatch ? nameMatch[1] : 'anonymous', type, isPublic };
      },
      parseTags: (comment, sig) => {
        const lines = comment.split('\n');
        const params: DocParam[] = [];
        let returns = '';
        const descLines: string[] = [];
        const retMatch = sig.match(/:\s*([^=\{]+)$/) || sig.match(/\)\s*:\s*([^=\{]+)/);
        if (retMatch) returns = retMatch[1].trim();
        const pMatch = sig.match(/\(([^)]*)\)/);
        if (pMatch) {
          pMatch[1].split(',').map(p => p.trim()).filter(p => p).forEach(p => {
            const [n, t] = p.split(':').map(s => s.trim());
            if (n) params.push({ name: n.replace('?', ''), type: t || 'any', description: '' });
          });
        }
        lines.forEach(line => {
          const clean = line.trim();
          if (!clean || clean.startsWith('@')) {
            if (clean.startsWith('@param')) {
                const m = clean.match(/@param\s+{(.*?)}\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)/) || clean.match(/@param\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)/);
                if (m) {
                    const pName = m[2] || m[1];
                    const existing = params.find(p => p.name === pName);
                    if (existing) {
                        existing.description = m[3] || m[2] || '';
                        if (m[1] && m[2]) existing.type = m[1];
                    } else params.push({ name: pName, type: m[1] && m[2] ? m[1] : undefined, description: m[3] || m[2] || '' });
                }
            } else if (clean.startsWith('@returns')) returns = clean.replace(/@returns\s*/, '').trim();
          } else descLines.push(clean);
        });
        return { description: descLines.join('\n').trim(), params, returns };
      }
    },
    rs: {
      extensions: ['.rs'],
      commentStart: (l) => l.startsWith('///') || l.startsWith('/**'),
      isAttribute: (l) => l.startsWith('#['),
      isCommentEnd: (l) => l.includes('*/') || !l.trim().startsWith('///'), // Simplified
      cleanComment: (l) => l.trim().replace(/^\/\/\/|\/\*\*|\*\/$|^\*$/, '').trim(),
      identify: (sig, scope, wasm) => {
        let type: DocType = 'function';
        if (sig.includes('struct ')) type = 'struct';
        else if (sig.includes('trait ')) type = 'trait';
        else if (sig.includes('enum ')) type = 'enum';
        else if (sig.includes('const ')) type = 'variable';
        else if (scope.length > 0) type = 'method';
        const isPublic = sig.includes('pub ') || wasm;
        const nameMatch = sig.match(/(?:pub\s+)?(?:fn|struct|trait|enum|const)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        return { name: nameMatch ? nameMatch[1] : 'anonymous', type, isPublic };
      },
      parseTags: (comment, sig) => {
        const lines = comment.split('\n');
        const params: DocParam[] = [];
        let returns = '';
        const descLines: string[] = [];
        const retMatch = sig.match(/->\s*([^\{;]+)/);
        if (retMatch) returns = retMatch[1].trim();
        const pMatch = sig.match(/\(([^)]*)\)/);
        if (pMatch && (sig.includes('fn ') || sig.includes('method'))) {
            const innerMatch = sig.match(/\(([^)]*)\)/);
            if (innerMatch) {
                innerMatch[1].split(',').map(p => p.trim()).filter(p => p).forEach(p => {
                    const [n, t] = p.split(':').map(s => s.trim());
                    if (n && t) params.push({ name: n, type: t, description: '' });
                });
            }
        }
        let section: 'desc' | 'args' | 'ret' = 'desc';
        lines.forEach(line => {
            const clean = line.trim();
            if (!clean) return;
            if (clean.toLowerCase().startsWith('# arguments')) section = 'args';
            else if (clean.toLowerCase().startsWith('# returns')) section = 'ret';
            else if (section === 'args') {
                const m = clean.match(/^\*?\s*`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s*-\s*(.*)/);
                if (m) {
                    const existing = params.find(p => p.name === m[1]);
                    if (existing) existing.description = m[2];
                    else params.push({ name: m[1], description: m[2] });
                } else descLines.push(line);
            } else if (section === 'ret') returns = (returns ? returns + ' ' : '') + clean;
            else descLines.push(line);
        });
        return { description: descLines.join('\n').trim(), params, returns };
      }
    }
  };

  /**
   * Main entry point for the documentation generation process.
   * Scans files, parses content, and triggers finalization logic.
   * @returns A promise resolving to an array of all discovered documentation entries.
   */
  public async process() {
    const files = globSync('**/*.{ts,tsx,rs}', { 
      cwd: this.projectRoot,
      ignore: ['node_modules/**', 'dist/**', 'dist-electron/**', 'release/**', 'tools/docs/**', '**/target/**', '**/pkg/**', '**/*.d.ts'] 
    });
    
    console.log(`🚀 Scanning ${files.length} files...`);

    const allEntries: DocEntry[] = [];
    for (const file of files) {
      const absPath = path.resolve(this.projectRoot, file);
      const content = fs.readFileSync(absPath, 'utf8');
      const profile = file.endsWith('.rs') ? this.profiles.rs : this.profiles.ts;
      
      const entries = this.parseFile(file, content, profile);
      allEntries.push(...entries.map(e => ({ ...e, file: absPath })));
    }

    this.finalize(allEntries);
    return allEntries;
  }

  /**
   * Internally parses a single source file using a specific language profile.
   * Implements a state machine to group comments, attributes, and signatures.
   */
  private parseFile(filePath: string, content: string, profile: LanguageProfile): DocEntry[] {
    const entries: DocEntry[] = [];
    const lines = content.split('\n');
    let i = 0;
    const scopeStack: string[] = [];

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) { i++; continue; }

      let commentBuffer = '';
      let hasComment = false;
      let wasmExport = false;

      const checkWasm = (l: string) => l.includes('wasm_bindgen');

      // 1. Scan for leading attributes
      let scanIdx = i;
      while (scanIdx < lines.length && profile.isAttribute(lines[scanIdx].trim())) {
        if (checkWasm(lines[scanIdx])) wasmExport = true;
        scanIdx++;
      }

      // 2. Extract and clean documentation comments
      if (profile.commentStart(line)) {
        hasComment = true;
        while (i < lines.length && !profile.isCommentEnd(lines[i])) {
            commentBuffer += profile.cleanComment(lines[i]) + '\n';
            i++;
        }
        if (i < lines.length && profile.isCommentEnd(lines[i])) {
            commentBuffer += profile.cleanComment(lines[i]) + '\n';
            i++;
        }
      }

      // 3. Re-check for attributes after the comment block
      while (i < lines.length && profile.isAttribute(lines[i].trim())) {
        if (checkWasm(lines[i])) wasmExport = true;
        i++;
      }

      // 4. Capture the following code signature
      let sigBuf = '';
      let sigStart = i + 1;
      let pDepth = 0;
      let foundSig = false;
      let tempI = i;

      while (tempI < lines.length) {
        const cur = lines[tempI].trim();
        if (!cur || cur.startsWith('//') || profile.isAttribute(cur)) { tempI++; continue; }
        sigBuf += (sigBuf ? '\n' : '') + lines[tempI];
        pDepth += (lines[tempI].match(/\(/g) || []).length;
        pDepth -= (lines[tempI].match(/\)/g) || []).length;
        
        // Terminate signature on typical delimiters (braces, semicolons, etc.)
        if (pDepth === 0 && (cur.includes('{') || cur.includes(';') || cur.includes('=') || cur.includes(':'))) {
          foundSig = true;
          break;
        }
        tempI++;
        if (!hasComment && tempI > i + 5) break;
      }

      if (foundSig) {
        const fullSig = sigBuf.trim();
        const { description, params, returns } = profile.parseTags(commentBuffer, fullSig);
        const { name, type, isPublic } = profile.identify(fullSig, scopeStack, wasmExport);

        entries.push({
          name,
          description: wasmExport ? `**[WASM Export]**\n\n${description}` : (description || (hasComment ? '' : '<em>No documentation provided.</em>')),
          signature: fullSig.split('{')[0].trim(),
          file: filePath,
          line: sigStart,
          type,
          language: filePath.endsWith('.rs') ? 'rust' : 'typescript',
          isPublic,
          params,
          returns,
          parent: scopeStack[scopeStack.length - 1]
        });

        // Update scope for nested members
        if (['struct', 'trait', 'enum', 'class', 'interface'].includes(type)) scopeStack.push(name);
        i = tempI + 1;
      } else {
        i = hasComment ? tempI + 1 : i + 1;
      }

      // Pop scope if braces close
      if (i < lines.length && lines[i-1]?.trim().includes('}')) scopeStack.pop();
    }
    return entries;
  }

  /**
   * Performs validation, logs coverage summary, and writes final output files.
   */
  private finalize(allEntries: DocEntry[]) {
    const issues = Validator.validate(allEntries);
    const errors = issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      errors.forEach(e => console.log(`  [${e.file}:${e.line}] ${e.name}: ${e.message}`));
      process.exit(1);
    }

    const covered = allEntries.filter(e => e.description && !e.description.includes('No documentation provided')).length;
    const percent = ((covered / allEntries.length) * 100).toFixed(1);
    console.log(`\n📈 Result: ${covered}/${allEntries.length} entries documented (${percent}%)`);

    // Write text summary for CI/CD tracking
    fs.writeFileSync(path.resolve(this.projectRoot, 'docs-coverage.txt'), `EXBA Documentation Coverage: ${percent}%\nGenerated: ${new Date().toLocaleString()}`);
    // Write JSON payload for the Rsbuild documentation site
    fs.writeFileSync(path.resolve(__dirname, '../ui/public/docs.json'), JSON.stringify(allEntries, null, 2));
  }
}
