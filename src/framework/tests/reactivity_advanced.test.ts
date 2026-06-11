import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EXBA } from '../core/exba';
import { ExbaComponent } from '../core/component';

class ReactiveTestComponent extends ExbaComponent {
  static props = {};
  static styles = {};

  public mountCount = 0;
  public updateCount = 0;
  public unmountCount = 0;
  public lastChangedProps: string[] = [];

  render() {
    return `<div>${this.state.val || 'none'}</div>`;
  }

  protected onMount() {
    this.mountCount++;
  }

  protected onUpdate(changedProps: string[]) {
    this.updateCount++;
    this.lastChangedProps = changedProps;
  }

  protected onUnmount() {
    this.unmountCount++;
  }

  // Expose createEffect for testing
  public testEffect(key: string, cb: (v: any) => void) {
    return this.createEffect(key, cb);
  }
}

customElements.define('reactive-test-comp', ReactiveTestComponent);

describe('Framework Reactivity & Lifecycle (Advanced)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    EXBA.subscriptions.clear();
  });

  describe('ExbaComponent Lifecycle', () => {
    it('should trigger hooks in correct order', () => {
      const el = document.createElement('reactive-test-comp') as ReactiveTestComponent;
      
      expect(el.mountCount).toBe(0);
      
      document.body.appendChild(el);
      expect(el.mountCount).toBe(1);
      
      el.setState({ val: 'updated' });
      expect(el.updateCount).toBe(1);
      expect(el.lastChangedProps).toContain('val');
      
      el.remove();
      expect(el.unmountCount).toBe(1);
    });

    it('should not re-render if state is identical', () => {
      const el = document.createElement('reactive-test-comp') as ReactiveTestComponent;
      document.body.appendChild(el);
      el.setState({ val: 'test' });
      expect(el.updateCount).toBe(1);
      
      el.setState({ val: 'test' });
      expect(el.updateCount).toBe(1); // Should not increase
    });
  });

  describe('Signal System (createSignal)', () => {
    it('should maintain value and notify on change', () => {
      const sig = EXBA.createSignal(10, 'my-signal');
      expect(sig.value).toBe(10);
      
      const spy = vi.fn();
      sig.subscribe(spy);
      
      sig.value = 20;
      expect(spy).toHaveBeenCalledWith(20);
      expect(sig.value).toBe(20);
    });

    it('should not notify if value is same', () => {
      const sig = EXBA.createSignal(10);
      const spy = vi.fn();
      sig.subscribe(spy);
      
      sig.value = 10;
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Automated Cleanup (createEffect)', () => {
    it('should automatically cleanup effects on unmount', () => {
      const el = document.createElement('reactive-test-comp') as ReactiveTestComponent;
      document.body.appendChild(el);
      
      const spy = vi.fn();
      el.testEffect('global-key', spy);
      
      EXBA.notify('global-key', 'active');
      expect(spy).toHaveBeenCalledWith('active');
      
      el.remove(); // Triggers disconnectedCallback
      
      EXBA.notify('global-key', 'dead');
      expect(spy).not.toHaveBeenCalledWith('dead');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Computed Signals (createComputed)', () => {
    it('should update automatically when dependencies change', () => {
      const a = EXBA.createSignal(1, 'sig-a');
      const b = EXBA.createSignal(2, 'sig-b');
      
      const sum = EXBA.createComputed(() => a.value + b.value, ['sig-a', 'sig-b']);
      expect(sum.value).toBe(3);
      
      a.value = 5;
      expect(sum.value).toBe(7);
      
      b.value = 10;
      expect(sum.value).toBe(15);
    });
  });

  describe('Batch Updates (batch)', () => {
    it('should notify only once per key after batch is complete', () => {
      const sig = EXBA.createSignal(0, 'batch-sig');
      const spy = vi.fn();
      sig.subscribe(spy);
      
      EXBA.batch(() => {
        sig.value = 1;
        sig.value = 2;
        sig.value = 3;
        expect(spy).not.toHaveBeenCalled();
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Style Preservation & Patching', () => {
    it('should correctly apply and update styles from static object', () => {
      class StyledComp extends ExbaComponent {
        static styles = { red: 'color: red;', blue: 'color: blue;' };
        render() {
          const cls = this.state.isRed ? 'red' : 'blue';
          return `<div class="${cls}">Text</div>`;
        }
      }
      customElements.define('styled-comp', StyledComp);
      const el = document.createElement('styled-comp') as any;
      document.body.appendChild(el);

      const root = el.shadowRoot!;
      const style = root.querySelector('style')!;
      expect(style.textContent).toContain('.red { color: red; }');
      expect(style.textContent).toContain('.blue { color: blue; }');

      const div = root.querySelector('div')!;
      expect(div.className).toBe('blue');
      
      el.setState({ isRed: true });
      expect(div.className).toBe('red');
      // Ensure style tag wasn't deleted or moved incorrectly
      expect(root.querySelector('style')).toBeDefined();
    });
  });
});
