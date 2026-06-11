import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ResilienceManager } from '../core/resilience';
import { ContextProvider, provideContext, consumeContext } from '../core/context';
import { ThemeProvider } from '../state/theme';
import { EXBA } from '../core/exba';
import { ExbaComponent } from '../core/component';
import { escapeHtml, HLIRSchema, LLIRSchema, IRBundleSchema } from '../core/schema';

// ─── Resilience Helper ─────────────────────────────────────────
function resetResilienceManager() {
  (ResilienceManager as any).status = 'healthy';
  (ResilienceManager as any).failureCount = 0;
  ResilienceManager.DEBUG_FORCE_FALLBACK = false;
  if ((ResilienceManager as any).recoveryTimer) {
    clearTimeout((ResilienceManager as any).recoveryTimer);
    (ResilienceManager as any).recoveryTimer = null;
  }
}

describe('ResilienceManager', () => {
  beforeEach(() => {
    resetResilienceManager();
    EXBA.wasmModule = null;
  });

  afterEach(() => {
    resetResilienceManager();
  });

  it('should initially be healthy and return wasm tier', () => {
    expect(ResilienceManager.getStatus()).toBe('healthy');
    expect(ResilienceManager.getActiveTier()).toBe('wasm');
    expect(ResilienceManager.isWasmHealthy()).toBe(false); // because wasmModule is null
  });

  it('should respect force fallback setting', () => {
    EXBA.wasmModule = {};
    expect(ResilienceManager.isWasmHealthy()).toBe(true);

    ResilienceManager.DEBUG_FORCE_FALLBACK = true;
    expect(ResilienceManager.getActiveTier()).toBe('ts');
    expect(ResilienceManager.isWasmHealthy()).toBe(false);
  });

  it('should transition to failed after threshold failures and recovery', () => {
    vi.useFakeTimers();
    EXBA.wasmModule = {};

    ResilienceManager.reportFailure('error 1');
    expect(ResilienceManager.getStatus()).toBe('healthy');

    ResilienceManager.reportFailure('error 2');
    expect(ResilienceManager.getStatus()).toBe('healthy');

    // Third failure triggers failed status
    ResilienceManager.reportFailure('error 3');
    expect(ResilienceManager.getStatus()).toBe('failed');
    expect(ResilienceManager.getActiveTier()).toBe('ts');
    expect(ResilienceManager.isWasmHealthy()).toBe(false);

    // Fast-forward 5 seconds to trigger recovery attempt
    vi.advanceTimersByTime(5000);
    expect(ResilienceManager.getStatus()).toBe('recovering');
    expect(ResilienceManager.getActiveTier()).toBe('wasm');

    // Report success transitions back to healthy
    ResilienceManager.reportSuccess();
    expect(ResilienceManager.getStatus()).toBe('healthy');
    expect(ResilienceManager.isWasmHealthy()).toBe(true);

    vi.useRealTimers();
  });
});

describe('Context API', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should provide and consume context in basic DOM tree', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);

    provideContext(parent, 'my-context', { theme: 'dark' });

    const value = consumeContext(child, 'my-context');
    expect(value).toEqual({ theme: 'dark' });
  });

  it('should traverse multiple levels to find context', () => {
    const parent = document.createElement('div');
    const middle = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(middle);
    middle.appendChild(child);

    provideContext(parent, 'multi-context', 'hello');

    const value = consumeContext(child, 'multi-context');
    expect(value).toBe('hello');
  });

  it('should return undefined if context key not found', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);

    const value = consumeContext(child, 'non-existent');
    expect(value).toBeUndefined();
  });

  it('should support declarative ContextProvider component', () => {
    const provider = document.createElement('exba-context-provider') as ContextProvider;
    provider.setAttribute('key', 'test-prop');
    provider.setAttribute('value', JSON.stringify({ active: true }));

    const child = document.createElement('div');
    provider.appendChild(child);

    document.body.appendChild(provider);

    const value = consumeContext(child, 'test-prop');
    expect(value).toEqual({ active: true });

    provider.remove();
  });
});

// ─── ExbaComponent Context Integration ─────────────────────────
class ContextConsumer extends ExbaComponent {
  render() {
    const ctx = this.useContext<{ value: string }>('theme-name');
    return `<span>Theme is ${ctx ? ctx.value : 'none'}</span>`;
  }
}
customElements.define('context-consumer', ContextConsumer);

describe('ExbaComponent Context Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should consume context inside ExbaComponent', () => {
    const parent = document.createElement('div');
    provideContext(parent, 'theme-name', { value: 'forest' });

    const consumer = document.createElement('context-consumer') as ContextConsumer;
    parent.appendChild(consumer);
    document.body.appendChild(parent);

    expect(consumer.shadowRoot?.innerHTML).toContain('Theme is forest');

    parent.remove();
  });
});

// ─── ThemeProvider Tests ───────────────────────────────────────
describe('ThemeProvider', () => {
  let originalMatchMedia: any;

  function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    const colors = ['background', 'foreground', 'primary', 'secondary', 'accent', 'border', 'muted'];
    colors.forEach(c => {
      document.documentElement.style.removeProperty(`--exba-${c}`);
    });
  });

  it('should apply theme colors as CSS custom properties on documentElement', () => {
    mockMatchMedia(false);

    const provider = document.createElement('exba-theme-provider') as any;
    expect(provider instanceof ThemeProvider).toBe(true);
    provider.setAttribute('initialMode', 'dark');
    document.body.appendChild(provider);

    expect(document.documentElement.style.getPropertyValue('--exba-background')).toBe('#0f172a');
    expect(document.documentElement.style.getPropertyValue('--exba-foreground')).toBe('#f8fafc');

    provider.remove();
  });

  it('should resolve system theme to light if prefers-color-scheme is light', () => {
    mockMatchMedia(false);

    const provider = document.createElement('exba-theme-provider') as any;
    document.body.appendChild(provider);

    expect(document.documentElement.style.getPropertyValue('--exba-background')).toBe('#ffffff');
    expect(document.documentElement.style.getPropertyValue('--exba-foreground')).toBe('#1a1a1a');

    provider.remove();
  });

  it('should resolve system theme to dark if prefers-color-scheme is dark', () => {
    mockMatchMedia(true);

    const provider = document.createElement('exba-theme-provider') as any;
    document.body.appendChild(provider);

    expect(document.documentElement.style.getPropertyValue('--exba-background')).toBe('#0f172a');

    provider.remove();
  });

  it('should provide the theme context and support setMode', () => {
    mockMatchMedia(false);

    const provider = document.createElement('exba-theme-provider') as any;
    document.body.appendChild(provider);

    const child = document.createElement('div');
    provider.appendChild(child);

    const themeContext = consumeContext<any>(child, 'theme');
    expect(themeContext).toBeDefined();
    expect(themeContext.mode).toBe('light');

    themeContext.setMode('dark');
    expect(document.documentElement.style.getPropertyValue('--exba-background')).toBe('#0f172a');

    const updatedContext = consumeContext<any>(child, 'theme');
    expect(updatedContext.mode).toBe('dark');

    provider.remove();
  });
});

// ─── Schema and Utility Tests ─────────────────────────────────
describe('Schema and Utility', () => {
  it('should escape HTML to prevent XSS', () => {
    const raw = '<div>Hello & "Welcome"\'s World!</div>';
    const expected = '&lt;div&gt;Hello &amp; &quot;Welcome&quot;&#39;s World!&lt;/div&gt;';
    expect(escapeHtml(raw)).toBe(expected);
  });

  it('should validate valid HLIR schemas', () => {
    const validNavigate = { type: 'Navigate', payload: { path: '/home' } };
    const parsed = HLIRSchema.safeParse(validNavigate);
    expect(parsed.success).toBe(true);

    const invalidNavigate = { type: 'Navigate', payload: { url: '/home' } };
    const parsedInvalid = HLIRSchema.safeParse(invalidNavigate);
    expect(parsedInvalid.success).toBe(false);
  });

  it('should validate valid LLIR schemas', () => {
    const validUpdateText = { type: 'UpdateText', id: 'title', text: 'New Title' };
    const parsed = LLIRSchema.safeParse(validUpdateText);
    expect(parsed.success).toBe(true);

    const invalidUpdateText = { type: 'UpdateText', text: 'New Title' };
    const parsedInvalid = LLIRSchema.safeParse(invalidUpdateText);
    expect(parsedInvalid.success).toBe(false);
  });

  it('should validate full IRBundle schemas', () => {
    const bundle = {
      version: '1.0.0',
      hlir: [
        { type: 'Navigate', payload: { path: '/home' } }
      ],
      llir: [
        { type: 'UpdateText', id: 'title', text: 'New Title' }
      ]
    };
    const parsed = IRBundleSchema.safeParse(bundle);
    expect(parsed.success).toBe(true);
  });
});

// ─── ExbaComponent Advanced Behaviors ─────────────────────────
class AdvancedComp extends ExbaComponent {
  static props = {
    num: 'number',
    bool: 'boolean',
    data: 'json',
  } as const;

  render() {
    if (this.state.triggerError) {
      throw new Error('Render Crash!');
    }
    return `
      <div id="num-val">${this.state.num}</div>
      <div id="bool-val">${this.state.bool}</div>
      <div id="json-val">${JSON.stringify(this.state.data)}</div>
      <slot name="header">Fallback Header</slot>
    `;
  }

  public triggerCustomEvent() {
    this.emit('custom-act', { detail: 'fired' });
  }

  public getHeaderSlot() {
    return this.getSlotContent('header');
  }
}
customElements.define('advanced-comp', AdvancedComp);

describe('ExbaComponent Advanced Behaviors', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should parse observedAttributes correctly based on type definition', () => {
    const el = document.createElement('advanced-comp') as any;
    document.body.appendChild(el);

    // Number conversion
    el.setAttribute('num', '42');
    expect(el.shadowRoot?.querySelector('#num-val')?.textContent).toBe('42');

    // Boolean conversion
    el.setAttribute('bool', 'true');
    expect(el.shadowRoot?.querySelector('#bool-val')?.textContent).toBe('true');
    el.setAttribute('bool', '');
    expect(el.shadowRoot?.querySelector('#bool-val')?.textContent).toBe('true');
    el.setAttribute('bool', 'false');
    expect(el.shadowRoot?.querySelector('#bool-val')?.textContent).toBe('false');

    // JSON conversion
    el.setAttribute('data', '{"a": 1}');
    expect(el.shadowRoot?.querySelector('#json-val')?.textContent).toBe('{"a":1}');
    el.setAttribute('data', 'invalid-json');
    expect(el.shadowRoot?.querySelector('#json-val')?.textContent).toBe('null');

    el.remove();
  });

  it('should catch render errors and display error boundary fallback', () => {
    const el = document.createElement('advanced-comp') as any;
    document.body.appendChild(el);

    el.setState({ triggerError: true });
    expect(el.shadowRoot?.innerHTML).toContain('Render error: Render Crash!');

    el.remove();
  });

  it('should emit custom events with detail', () => {
    const el = document.createElement('advanced-comp') as any;
    document.body.appendChild(el);

    const spy = vi.fn();
    el.addEventListener('custom-act', spy);

    el.triggerCustomEvent();

    expect(spy).toHaveBeenCalled();
    const eventObj = spy.mock.calls[0][0];
    expect(eventObj.detail).toEqual({ detail: 'fired' });

    el.remove();
  });

  it('should return fallback content when Slot is empty using getSlotContent', () => {
    const el = document.createElement('advanced-comp') as any;
    document.body.appendChild(el);

    expect(el.getHeaderSlot()).toContain('Fallback Header');

    el.remove();
  });
});
