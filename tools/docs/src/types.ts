export type DocType = 'function' | 'class' | 'struct' | 'trait' | 'variable' | 'enum' | 'interface' | 'method';

export interface DocParam {
  name: string;
  description: string;
  type?: string;
}

export interface DocEntry {
  name: string;
  description: string;
  signature: string;
  file: string;
  line: number;
  type: DocType;
  language: 'typescript' | 'rust';
  isPublic: boolean;
  params: DocParam[];
  returns?: string;
  parent?: string; // For methods inside classes/structs
}

export interface Parser {
  canParse(filePath: string): boolean;
  parse(filePath: string, content: string): DocEntry[];
}

export interface ValidationIssue {
  file: string;
  line: number;
  name: string;
  message: string;
  severity: 'error' | 'warning';
}
