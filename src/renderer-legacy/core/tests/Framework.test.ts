import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSignal, getEffectCount } from '../reactivity/Reactivity';
import { defineComponent } from '../ui/Component';
import { html } from '../ui/Templates';

describe('EXBA Framework Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.useFakeTimers();
  });

  describe('Async Batched Updates', () => {
    it('should batch multiple signal updates into a single render', async () => {
      const count = createSignal(0);
      const renderSpy = vi.fn();

      defineComponent({
        name: 'batch-test',
        initialState: {},
        render: () => {
          renderSpy(count.get());
          return html`<div>${count.get()}</div>`;
        }
      });

      const el = document.createElement('batch-test');
      document.getElementById('app')?.appendChild(el);

      // Initial render is sync
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy).toHaveBeenCalledWith(0);

      // Update signal multiple times
      count.set(1);
      count.set(2);
      count.set(3);

      // Should not have rendered yet (async)
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Flush microtasks and requestAnimationFrame
      await vi.runAllTimersAsync();

      // Should have rendered only once with the final value
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy).toHaveBeenCalledWith(3);
    });
  });

  describe('Recursive Template Nesting', () => {
    it('should correctly render nested html templates and arrays', () => {
      defineComponent({
        name: 'nest-test',
        initialState: {
          items: ['A', 'B']
        },
        render: (state) => html`
          <ul>
            ${state.items.map(item => html`<li>${item}</li>`)}
          </ul>
        `
      });

      const el = document.createElement('nest-test') as any;
      document.getElementById('app')?.appendChild(el);

      const htmlContent = el.shadow.innerHTML;
      expect(htmlContent).toContain('<li>A</li>');
      expect(htmlContent).toContain('<li>B</li>');
      expect(htmlContent).not.toContain('[object Object]');
    });
  });

  describe('DOM Mode (Shadow vs Light)', () => {
    it('should use Shadow DOM by default', () => {
      defineComponent({
        name: 'shadow-comp',
        initialState: {},
        render: () => 'Shadow'
      });
      const el = document.createElement('shadow-comp') as any;
      expect(el.shadowRoot).toBeDefined();
      expect(el.shadow).toBe(el.shadowRoot);
    });

    it('should use Light DOM when useShadow is false', () => {
      defineComponent({
        name: 'light-comp',
        initialState: {},
        useShadow: false,
        render: () => 'Light'
      });
      const el = document.createElement('light-comp') as any;
      expect(el.shadowRoot).toBeNull();
      expect(el.shadow).toBe(el);
    });
  });

  describe('Lifecycle and Cleanup', () => {
    it('should call mounted and updated hooks', async () => {
      const mounted = vi.fn();
      const updated = vi.fn();
      const count = createSignal(0);

      defineComponent({
        name: 'lifecycle-test',
        initialState: {},
        mounted,
        updated,
        render: () => html`<div>${count.get()}</div>`
      });

      const el = document.createElement('lifecycle-test');
      document.getElementById('app')?.appendChild(el);

      expect(mounted).toHaveBeenCalledTimes(1);
      expect(updated).toHaveBeenCalledTimes(0); // Initial render doesn't call updated

      count.set(1);
      await vi.runAllTimersAsync();

      expect(updated).toHaveBeenCalledTimes(1);
    });

    it('should cleanup effects when component is unmounted', () => {
      const count = createSignal(0);
      const initialEffects = getEffectCount();

      defineComponent({
        name: 'cleanup-test',
        initialState: {},
        render: () => {
          count.get();
          return 'Test';
        }
      });

      const el = document.createElement('cleanup-test');
      document.getElementById('app')?.appendChild(el);

      expect(getEffectCount()).toBe(initialEffects + 1);

      el.remove();
      expect(getEffectCount()).toBe(initialEffects);
    });
  });
});
