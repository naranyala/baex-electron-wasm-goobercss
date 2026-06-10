import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExbaComponent } from '../core/component';
import { EXBA } from '../core/exba';
import { IRProcessor } from '../core/processor';
import { Router } from '../core/router';
import { ReactiveStateProxy } from '../state/proxy';

// ─── Mock Components ──────────────────────────────────────────
class IntegrationComp extends ExbaComponent {
  static props = { name: 'string', count: 'number' } as const;
  static styles = {
    container: 'padding: 10px; border: 1px solid blue;',
    text: 'color: green;',
  };

  render() {
    return `
      <div class="container" id="container">
        <span class="text" id="name-display">${this.state.name || 'Guest'}</span>
        <span id="count-display">${this.state.count || 0}</span>
      </div>
    `;
  }
}
EXBA.register('integration-comp', IntegrationComp);

describe('EXBA Integration Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    EXBA.subscriptions.clear();
    EXBA.eventListeners.clear();
    EXBA.DEBUG = false;
    EXBA.wasmModule = null;
  });

  describe('EXBA Core System', () => {
    it('should handle subscriptions and notifications', () => {
      const spy = vi.fn();
      const unsub = EXBA.subscribe('test-key', spy);

      EXBA.notify('test-key', 'hello');
      expect(spy).toHaveBeenCalledWith('hello');

      unsub();
      EXBA.notify('test-key', 'world');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should handle event system', () => {
      const spy = vi.fn();
      const unsub = EXBA.addEventListener('custom-event', spy);

      EXBA.emit('custom-event', { detail: 123 });
      expect(spy).toHaveBeenCalledWith({ detail: 123 });

      unsub();
      EXBA.emit('custom-event');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should initialize WASM and track module', async () => {
      const mockModule = { wasm_get_app_state: () => ({ v: 1 }) };
      const initFn = async () => mockModule;

      const result = await EXBA.initWasm(initFn);
      expect(result).toBe(mockModule);
      expect(EXBA.wasmModule).toBe(mockModule);
    });
  });

  describe('ReactiveStateProxy', () => {
    it('should trigger EXBA notification on property change', () => {
      const state = new ReactiveStateProxy({ counter: 0 });
      const spy = vi.fn();
      EXBA.subscribe('counter', spy);

      state.value.counter = 10;
      expect(spy).toHaveBeenCalledWith(10);
      expect(state.value.counter).toBe(10);
    });

    it('should support deep reactivity', () => {
      const state = new ReactiveStateProxy({
        user: { profile: { name: 'John' } },
      });
      const spy = vi.fn();
      EXBA.subscribe('name', spy); // Note: Current implementation notifies by prop name

      state.value.user.profile.name = 'Jane';
      expect(spy).toHaveBeenCalledWith('Jane');
      expect(state.value.user.profile.name).toBe('Jane');
    });

    it('should execute callbacks provided in options', () => {
      const onUpdate = vi.fn();
      const onPropertyUpdate = vi.fn();
      const state = new ReactiveStateProxy(
        { a: 1 },
        { onUpdate, onPropertyUpdate },
      );

      state.value.a = 2;
      expect(onPropertyUpdate).toHaveBeenCalledWith('a', 2, 1);
      expect(onUpdate).toHaveBeenCalledWith({ a: 2 });
    });
  });

  describe('ExbaComponent', () => {
    it('should render and update state', () => {
      const el = document.createElement('integration-comp') as IntegrationComp;
      document.body.appendChild(el);

      expect(el.shadowRoot?.innerHTML).toContain('Guest');

      el.setState({ name: 'Alice' });
      expect(el.shadowRoot?.innerHTML).toContain('Alice');
    });

    it('should react to attribute changes', () => {
      const el = document.createElement('integration-comp') as IntegrationComp;
      document.body.appendChild(el);

      el.setAttribute('count', '42');
      expect(el.shadowRoot?.innerHTML).toContain('42');
    });

    it('should auto-subscribe to EXBA state if requested', async () => {
      const el = document.createElement('integration-comp') as any;
      document.body.appendChild(el);

      el.subscribeToState('name');
      EXBA.notify('name', 'ReactiveName');

      expect(el.shadowRoot?.innerHTML).toContain('ReactiveName');
    });
  });

  describe('IRProcessor', () => {
    it('should execute LLIR instructions (UpdateText, SetStyle, etc)', () => {
      const el = document.createElement('integration-comp') as IntegrationComp;
      el.id = 'my-comp';
      document.body.appendChild(el);

      // We need to wait for shadow DOM to be accessible or use IDs inside shadow root
      // IRProcessor.resolveElement searches shadow roots.

      IRProcessor.process({
        version: '1.0.0',
        hlir: [],
        llir: [
          { type: 'UpdateText', id: 'name-display', text: 'IR-Updated' },
          {
            type: 'SetStyle',
            id: 'container',
            prop: 'backgroundColor',
            value: 'red',
          },
        ],
      });

      const nameDisplay = el.shadowRoot?.getElementById('name-display');
      const container = el.shadowRoot?.getElementById('container');

      expect(nameDisplay?.textContent).toBe('IR-Updated');
      expect(container?.style.backgroundColor).toBe('red');
    });

    it('should handle HLIR effects (Navigate, Notify)', () => {
      const navSpy = vi.fn();
      (window as any).appRouter = { navigate: navSpy };
      const logSpy = vi.spyOn(console, 'log');

      IRProcessor.process({
        version: '1.0.0',
        hlir: [
          { type: 'Navigate', payload: { path: '/dashboard' } },
          { type: 'Notify', payload: { level: 'info', msg: 'Hello' } },
        ],
        llir: [],
      });

      expect(navSpy).toHaveBeenCalledWith('/dashboard');
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('EXBA-NOTIFY'),
        expect.anything(),
      );
    });

    it('should retry failed instructions if element is missing initially', async () => {
      vi.useFakeTimers();

      IRProcessor.process({
        version: '1.0.0',
        hlir: null,
        llir: [{ type: 'UpdateText', id: 'delayed-el', text: 'Found you!' }],
      });

      // Element doesn't exist yet
      expect(document.getElementById('delayed-el')).toBeNull();

      // Create element later
      const delayed = document.createElement('div');
      delayed.id = 'delayed-el';
      document.body.appendChild(delayed);

      // Trigger retries
      vi.advanceTimersByTime(100);

      expect(delayed.textContent).toBe('Found you!');

      vi.useRealTimers();
    });
  });

  describe('Router', () => {
    it('should manage routes and navigation', () => {
      const container = document.createElement('div');
      container.id = 'view-container';
      document.body.appendChild(container);

      const router = new Router('view-container');
      router.register({ path: '/', component: 'div' });
      router.register({ path: '/test', component: 'integration-comp' });

      router.navigate('/test');
      expect(container.querySelector('integration-comp')).toBeDefined();
    });
  });
});
