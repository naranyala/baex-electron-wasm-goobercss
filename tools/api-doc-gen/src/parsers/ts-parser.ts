import { Parser, DocEntry, DocParam } from '../types';

export class TSParser implements Parser {
  canParse(filePath: string): boolean {
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  }

  private parseTags(comment: string): { description: string, params: DocParam[], returns?: string } {
    const lines = comment.split('\n');
    const params: DocParam[] = [];
    let returns = '';
    const descLines: string[] = [];

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('@param')) {
        const match = line.match(/@param\s+{(.*?)}\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)/) || 
                     line.match(/@param\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)/);
        if (match) {
          params.push({
            name: match[2] || match[1],
            type: match[1] && !match[2] ? match[1] : undefined,
            description: match[3] || match[2] || ''
          });
        }
      } else if (line.startsWith('@returns') || line.startsWith('@return')) {
        returns = line.replace(/@(returns|return)\s*/, '').trim();
      } else if (!line.startsWith('@')) {
        descLines.push(line);
      }
    }

    return {
      description: descLines.join(' ').trim(),
      params,
      returns
    };
  }

  parse(filePath: string, content: string): DocEntry[] {
    const entries: DocEntry[] = [];
    const lines = content.split('\n');
    let i = 0;
    const scopeStack: string[] = [];

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) { i++; continue; }

      let commentBuffer = '';
      let hasComment = false;

      if (line.startsWith('/**')) {
        hasComment = true;
        while (i < lines.length && !lines[i].includes('*/')) {
          commentBuffer += lines[i].replace(/^\s*\*\s?/, '') + '\n';
          i++;
        }
        if (i < lines.length) {
          commentBuffer += lines[i].replace(/^\s*\*\s?/, '').replace(/\*\/$/, '').trim() + '\n';
        }
        i++;
      }

      let signatureBuffer = '';
      let sigStartLine = i + 1;
      let parenDepth = 0;
      let foundSignature = false;
      
      let lookAheadLimit = hasComment ? lines.length : i + 5; 
      let tempI = i;

      while (tempI < lines.length) {
        const currentLine = lines[tempI].trim();
        if (!currentLine) { tempI++; continue; }
        
        if (!hasComment && currentLine.startsWith('@')) {
          tempI++;
          continue;
        }

        signatureBuffer += (signatureBuffer ? '\n' : '') + lines[tempI];
        parenDepth += (lines[tempI].match(/\(/g) || []).length;
        parenDepth -= (lines[tempI].match(/\)/g) || []).length;
        
        if (parenDepth === 0 && (currentLine.includes('{') || currentLine.includes(';'))) {
          foundSignature = true;
          break;
        }
        tempI++;
        if (!hasComment && tempI > lookAheadLimit) break;
      }

      if (foundSignature) {
        const fullSignature = signatureBuffer.trim();
        const { description, params, returns } = this.parseTags(commentBuffer);
        
        let type: DocEntry['type'] = 'function';
        if (fullSignature.includes('class ')) type = 'class';
        else if (fullSignature.includes('interface ')) type = 'interface';
        else if (fullSignature.includes('enum ')) type = 'enum';
        else if (fullSignature.includes('type ')) type = 'variable';
        else if (scopeStack.length > 0) type = 'method';

        const isPublic = fullSignature.includes('export ');
        const nameMatch = fullSignature.match(/(?:export\s+)?(?:class|interface|enum|function|const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/) 
                       || fullSignature.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]/)
                       || fullSignature.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        
        const name = nameMatch ? nameMatch[1] : 'anonymous';

        entries.push({
          name,
          description: description || (hasComment ? '' : '<em>No documentation provided.</em>'),
          signature: fullSignature.split('{')[0].trim(),
          file: filePath,
          line: sigStartLine,
          type,
          language: 'typescript',
          isPublic,
          params,
          returns,
          parent: scopeStack[scopeStack.length - 1]
        });

        if (type === 'class' || type === 'interface') {
          scopeStack.push(name);
        }
        i = tempI + 1;
      } else {
        if (!hasComment) {
          i++;
        } else {
          i = tempI + 1;
        }
      }

      if (i < lines.length && lines[i-1]?.trim().includes('}')) {
        if (scopeStack.length > 0) scopeStack.pop();
      }
    }
    return entries;
  }
}
