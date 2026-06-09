export function fuzzySearch(query: string, items: any[]) {
  const q = query.toLowerCase().split('').filter(c => c !== ' ');
  return items.filter(item => {
    const label = item.label.toLowerCase();
    let i = 0;
    for (const char of q) {
      i = label.indexOf(char, i);
      if (i === -1) return false;
      i++;
    }
    return true;
  });
}

export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalize(text: string): string {
  if (text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeWords(text: string): string {
  return text.split(' ').map(capitalize).join(' ');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function camelCase(text: string): string {
  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\s+(.)/g, (_, c) => (c as string).toUpperCase())
    .replace(/^\s*/, '')
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

export function pascalCase(text: string): string {
  return capitalize(camelCase(text));
}

export function kebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function snakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural ?? singular + 's';
}

export function ellipsis(text: string, maxLength: number): string {
  return truncate(text, maxLength, '…');
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export function padStart(text: string, length: number, char: string = ' '): string {
  return text.padStart(length, char);
}

export function padEnd(text: string, length: number, char: string = ' '): string {
  return text.padEnd(length, char);
}

export function reverse(text: string): string {
  return [...text].reverse().join('');
}

export function countOccurrences(text: string, substring: string): number {
  if (substring.length === 0) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(substring, pos)) !== -1) {
    count++;
    pos += substring.length;
  }
  return count;
}

export function template(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function indent(text: string, level: number, char: string = '  '): string {
  const prefix = char.repeat(level);
  return text.split('\n').map(line => prefix + line).join('\n');
}

export function isBlank(text: string | null | undefined): boolean {
  return text == null || text.trim().length === 0;
}

export function isNotBlank(text: string | null | undefined): text is string {
  return !isBlank(text);
}
