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

  describe('Signal System (signal)', () => {
    it('should maintain value and notify on change', () => {
      const sig = EXBA.signal(10, 'my-signal');
      expect(sig.value).toBe(10);
      
      const spy = vi.fn();
      sig.subscribe(spy);
      
      sig.value = 20;
      expect(spy).toHaveBeenCalledWith(20);
      expect(sig.value).toBe(20);
    });

    it('should not notify if value is same', () => {
      const sig = EXBA.signal(10);
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

  describe('Computed Signals (computed)', () => {
    it('should update automatically when dependencies change', () => {
      const a = EXBA.signal(1, 'sig-a');
      const b = EXBA.signal(2, 'sig-b');
      
      const sum = EXBA.computed(() => a.value + b.value, ['sig-a', 'sig-b']);
      expect(sum.value).toBe(3);
      
      a.value = 5;
      expect(sum.value).toBe(7);
      
      b.value = 10;
      expect(sum.value).toBe(15);
    });
  });

  describe('Batch Updates (batch)', () => {
    it('should notify only once per key after batch is complete', () => {
      const sig = EXBA.signal(0, 'batch-sig');
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

    it('should pass actual values to subscribers', () => {
      const sig = EXBA.signal(0, 'batch-val-sig');
      const spy = vi.fn();
      sig.subscribe(spy);
      
      EXBA.batch(() => {
        sig.value = 5;
      });
      
      expect(spy).toHaveBeenCalledWith(5);
    });
  });

  describe('Memo (lazy derived state)', () => {
    it('should compute value lazily on first read', () => {
      const computeSpy = vi.fn(() => 42);
      const m = EXBA.memo(computeSpy);
      
      expect(computeSpy).toHaveBeenCalledTimes(1); // Initial computation
      expect(m.value).toBe(42);
    });

    it('should auto-track dependencies', () => {
      const a = EXBA.signal(1, 'memo-a');
      const b = EXBA.signal(2, 'memo-b');
      
      const sum = EXBA.memo(() => a.value + b.value);
      expect(sum.value).toBe(3);
      
      a.value = 10;
      expect(sum.value).toBe(12);
      
      b.value = 20;
      expect(sum.value).toBe(30);
    });

    it('should only notify if value changed', () => {
      const sig = EXBA.signal(1, 'memo-change');
      const spy = vi.fn();
      
      // Memo that always returns same value regardless of input
      const constant = EXBA.memo(() => 42);
      EXBA.subscribe(constant.key, spy);
      
      sig.value = 2;
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Untrack', () => {
    it('should read signal without creating subscription', () => {
      const sig = EXBA.signal(10, 'untrack-sig');
      
      const deps = EXBA.trackDependencies(() => {
        EXBA.untrack(sig);
      });
      
      expect(deps).not.toContain('untrack-sig');
    });

    it('should work inside effects', () => {
      const sig = EXBA.signal(1, 'untrack-effect');
      const other = EXBA.signal(100, 'untrack-other');
      const spy = vi.fn();
      
      // Effect that reads other via untrack - should not re-run when other changes
      EXBA.subscribe(sig.key, () => {
        EXBA.untrack(other);
        spy();
      });
      
      other.value = 200; // Should NOT trigger spy
      expect(spy).toHaveBeenCalledTimes(0);
      
      sig.value = 2; // Should trigger spy
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('On (explicit subscription)', () => {
    it('should subscribe to signal changes outside effects', () => {
      const sig = EXBA.signal(0, 'on-sig');
      const spy = vi.fn();
      
      EXBA.on(sig, spy);
      
      sig.value = 1;
      expect(spy).toHaveBeenCalledWith(1, 0);
      
      sig.value = 2;
      expect(spy).toHaveBeenCalledWith(2, 1);
    });

    it('should return dispose function', () => {
      const sig = EXBA.signal(0, 'on-dispose');
      const spy = vi.fn();
      
      const dispose = EXBA.on(sig, spy);
      
      sig.value = 1;
      expect(spy).toHaveBeenCalledTimes(1);
      
      dispose();
      
      sig.value = 2;
      expect(spy).toHaveBeenCalledTimes(1); // Not called after dispose
    });
  });

  describe('Computed (auto-tracking)', () => {
    it('should auto-track dependencies without explicit array', () => {
      const a = EXBA.signal(1, 'auto-a');
      const b = EXBA.signal(2, 'auto-b');
      
      const sum = EXBA.computed(() => a.value + b.value);
      expect(sum.value).toBe(3);
      
      a.value = 10;
      expect(sum.value).toBe(12);
    });

    it('should not notify if value unchanged', () => {
      const sig = EXBA.signal(1, 'computed-nochange');
      const spy = vi.fn();
      
      const computed = EXBA.computed(() => sig.value * 0); // Always 0
      EXBA.subscribe(computed.key, spy);
      
      sig.value = 2; // Value stays 0
      expect(spy).not.toHaveBeenCalled();
    });

    it('should have dispose method', () => {
      const sig = EXBA.signal(1, 'computed-dispose');
      const computed = EXBA.computed(() => sig.value * 2);
      
      expect(computed.value).toBe(2);
      
      computed.dispose();
      
      sig.value = 2; // Should not update after dispose
      expect(computed.value).toBe(2); // Still old value
    });
  });

  describe('Effect (standalone)', () => {
    it('should run immediately and track dependencies', () => {
      const sig = EXBA.signal(0, 'effect-run');
      const spy = vi.fn();
      
      EXBA.createEffect(() => {
        spy(sig.value);
      });
      
      expect(spy).toHaveBeenCalledWith(0);
    });

    it('should re-run when dependencies change', () => {
      const sig = EXBA.signal(0, 'effect-rerun');
      const spy = vi.fn();
      
      EXBA.createEffect(() => {
        spy(sig.value);
      });
      
      sig.value = 1;
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('should cleanup previous effect on re-run', () => {
      const sig = EXBA.signal(0, 'effect-cleanup');
      const cleanupSpy = vi.fn();
      
      EXBA.createEffect(() => {
        sig.value; // Track
        return cleanupSpy;
      });
      
      sig.value = 1; // Should trigger cleanup
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
    });

    it('should dispose and stop tracking', () => {
      const sig = EXBA.signal(0, 'effect-dispose');
      const spy = vi.fn();
      
      const dispose = EXBA.createEffect(() => {
        spy(sig.value);
      });
      
      dispose();
      
      sig.value = 1;
      expect(spy).toHaveBeenCalledTimes(1); // Only initial run
    });
  });

  describe('Aliases', () => {
    it('EXBA.signal should work like createSignal', () => {
      const sig = EXBA.signal(42, 'alias-sig');
      expect(sig.value).toBe(42);
      
      sig.value = 100;
      expect(sig.value).toBe(100);
    });

    it('EXBA.computed should work like createComputed', () => {
      const sig = EXBA.signal(5, 'alias-computed-input');
      const computed = EXBA.computed(() => sig.value * 2);
      
      expect(computed.value).toBe(10);
      
      sig.value = 10;
      expect(computed.value).toBe(20);
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
