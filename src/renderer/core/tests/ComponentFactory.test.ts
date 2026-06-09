import { describe, it, expect, vi } from 'vitest';
import { ComponentFactory } from '../ui/ComponentFactory';

describe('ComponentFactory', () => {
  it('should create a component definition from config', () => {
    const config: any = {
      tag: 'dynamic-test',
      title: 'Dynamic Title',
      initialState: { name: 'Initial' },
      renderSchema: [
        { type: 'text', label: 'Name', binding: 'name' }
      ]
    };
    
    const definition = ComponentFactory.createFromConfig(config);
    expect(definition.name).toBe('dynamic-test');
    expect(definition.initialState.name).toBe('Initial');
    
    // Test render
    const nodes = definition.render({ name: 'Updated' }, {}, {} as any) as any[];
    const htmlOutput = nodes.map(n => n.type === 'static' ? n.content : '').join('');
    
    expect(htmlOutput).toContain('Dynamic Title');
    expect(htmlOutput).toContain('Name: Updated');
  });

  it('should handle update-state event', () => {
    const config: any = {
      tag: 'dynamic-event-test',
      title: 'Test',
      renderSchema: [{ type: 'input', label: 'Input', binding: 'val' }]
    };
    
    const definition = ComponentFactory.createFromConfig(config);
    const setState = vi.fn();
    
    definition.events!['update-state']({ detail: { key: 'val', value: 'new-val' } } as any, { setState } as any);
    
    expect(setState).toHaveBeenCalled();
    const updateFn = setState.mock.calls[0][0];
    expect(updateFn({})).toEqual({ val: 'new-val' });
  });
});
