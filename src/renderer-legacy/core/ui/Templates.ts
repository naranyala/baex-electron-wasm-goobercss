import { TemplateNode } from '../bridge/types';

export const eventHandlers = new Map<string, (e: Event) => void>();

/**
 * Normalizes values for DOM injection.
 * Recursively handles arrays and evaluated dynamic nodes.
 */
export function stringifyValue(value: any, state?: any): string {
  if (Array.isArray(value)) {
    return value.map(v => stringifyValue(v, state)).join('');
  }
  
  if (value && typeof value === 'object') {
    if ('type' in value) {
      if (value.type === 'static') return value.content;
      if (value.type === 'dynamic' && state) {
        return stringifyValue(value.content(state), state);
      }
    }
    // Fallback for objects that aren't TemplateNodes
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
  }
  
  return value === undefined || value === null ? '' : String(value);
}

export function html(strings: TemplateStringsArray, ...values: any[]): TemplateNode[] {
  const nodes: TemplateNode[] = [];

  for (let i = 0; i < strings.length; i++) {
    let str = strings[i];
    
    // Check if this string ends with an @event binding
    const eventMatch = str.match(/@(\w+)=$/);
    if (eventMatch && i < values.length) {
      const eventName = eventMatch[1];
      const handler = values[i];
      if (typeof handler === 'function') {
        const id = `exba-evt-${Math.random().toString(36).slice(2, 9)}`;
        eventHandlers.set(id, handler);
        // Replace the @event= with a data attribute that BaseComponent will find
        str = str.replace(/@\w+=$/, `data-exba-evt-${eventName}="${id}"`);
        nodes.push({ type: 'static', content: str });
        continue;
      }
    }

    // Static part
    if (str) {
      nodes.push({
        type: 'static',
        content: str,
      });
    }

    // Dynamic part
    if (i < values.length) {
      const value = values[i];
      
      // If it's a function, it's a reactive binding
      if (typeof value === 'function') {
        nodes.push({
          type: 'dynamic',
          content: (state: any) => stringifyValue(value(state), state),
        });
      } else {
        // Otherwise it's a static value (constant for this render cycle)
        nodes.push({
          type: 'static',
          content: stringifyValue(value),
        });
      }
    }
  }

  return nodes;
}

/**
 * Ergonomic CSS helper.
 * If useShadow is true, this can be passed to the component definition.
 * If useShadow is false, it behaves like goober's global inject.
 */
export function css(strings: TemplateStringsArray, ...values: any[]): string {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += String(values[i]);
    }
  }
  return result;
}
