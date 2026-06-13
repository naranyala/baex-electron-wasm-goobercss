import { describe, it, expect, beforeEach } from 'vitest';
import { EXBA } from '../core/exba';
import { defineExbaComponent } from '../core/component';

describe('Non-Decorator Reactivity and Components', () => {
  beforeEach(() => {
    // Reset EXBA state if necessary
    (EXBA as any).subscriptions.clear();
    (EXBA as any).signalValues.clear();
  });

  it('EXBA.reactive should track changes and notify subscribers', () => {
    const data = { count: 0 };
    const reactiveData = EXBA.reactive(data, 'test-reactive');
    
    let updatedValue = 0;
    EXBA.subscribe('test-reactive_count', (val) => {
      updatedValue = val;
    });

    reactiveData.count = 1;
    expect(updatedValue).toBe(1);
    expect(data.count).toBe(1);
  });

  it('defineExbaComponent should create a functional component', async () => {
    const ComponentClass = defineExbaComponent({
      tagName: 'test-component',
      props: { name: 'string' },
      state: { count: 0 },
      listeners: [
        {
          selector: '#btn',
          eventName: 'click',
          handler: function(this: any) {
            this.setState({ count: this.state.count + 1 });
          }
        }
      ],
      render: function(this: any) {
        return `<div>${this.state.name} ${this.state.count}</div><button id="btn">Add</button>`;
      }
    });

    const el = document.createElement('test-component');
    (el as any).setState({ name: 'Test' });
    
    // Trigger initial render and wait for it to complete
    await (el as any).safeUpdate();
    
    let html = el.shadowRoot?.innerHTML || '';
    expect(html).toContain('Test 0');

    // Simulate click
    const btn = el.shadowRoot?.querySelector('#btn');
    btn?.dispatchEvent(new Event('click'));
    
    // setState calls safeUpdate, which is async. We need to wait for the state change.
    // Since setState is synchronous in updating this.state but safeUpdate is async,
    // the state should already be updated.
    expect((el as any).state.count).toBe(1);
  });
});
