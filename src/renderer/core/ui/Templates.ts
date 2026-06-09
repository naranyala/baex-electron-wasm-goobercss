import { TemplateNode } from '../bridge/types';

export function html(strings: TemplateStringsArray, ...values: any[]): TemplateNode[] {
  const nodes: TemplateNode[] = [];

  for (let i = 0; i < strings.length; i++) {
    // Static part
    if (strings[i]) {
      nodes.push({
        type: 'static',
        content: strings[i],
      });
    }

    // Dynamic part
    if (i < values.length) {
      const value = values[i];
      
      // If it's a function, it's a reactive binding
      if (typeof value === 'function') {
        nodes.push({
          type: 'dynamic',
          content: (state: any) => String(value(state)),
        });
      } else {
        // Otherwise it's a static value (constant for this render cycle)
        nodes.push({
          type: 'static',
          content: String(value),
        });
      }
    }
  }

  return nodes;
}
