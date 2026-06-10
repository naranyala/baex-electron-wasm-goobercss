import { BaseComponent } from './BaseComponent';
import { Signal } from '../reactivity/Reactivity';

/**
 * Core: Binding Primitives
 */
export function bindText<T>(el: HTMLElement | null, signal: Signal<T>): void {
  if (!el) return;
  const update = () => {
    el.textContent = String(signal.get());
  };
  update();
}

export function bindAttr<T>(el: HTMLElement | null, attr: string, signal: Signal<T>): void {
  if (!el) return;
  const update = () => {
    el.setAttribute(attr, String(signal.get()));
  };
  update();
}

export function bindClass<T extends boolean>(el: HTMLElement | null, className: string, signal: Signal<T>): void {
  if (!el) return;
  const update = () => {
    if (signal.get()) el.classList.add(className);
    else el.classList.remove(className);
  };
  update();
}

/**
 * Core: Portal Primitives
 */
export function createPortal(
  target: HTMLElement,
  content: string | HTMLElement,
  options: { cleanup?: () => void } = {}
): void {
  if (typeof content === 'string') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = content;
    const node = wrapper.firstElementChild as HTMLElement;
    if (node) target.appendChild(node);
    if (options.cleanup) options.cleanup();
  } else {
    target.appendChild(content);
    if (options.cleanup) options.cleanup();
  }
}

/**
 * Core: Interaction Primitives
 */
export function useIntersectionObserver(
  component: BaseComponent,
  selector: string,
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
): void {
  const observer = new IntersectionObserver(callback, options);
  const el = component.shadow.querySelector(selector);
  if (el) {
    observer.observe(el);
  }
  component._cleanups.push(() => observer.disconnect());
}

export function useFocus(
  component: BaseComponent,
  selector: string,
  options: { initial?: boolean; onFocus?: (el: HTMLElement) => void } = {}
): void {
  if (options.initial) {
    setTimeout(() => {
      const el = component.shadow.querySelector(selector) as HTMLElement;
      el?.focus();
    }, 0);
  }
  
  const el = component.shadow.querySelector(selector) as HTMLElement;
  if (el && options.onFocus) {
    el.addEventListener('focus', () => options.onFocus!(el));
  }
}

export function createFocusTrap(
  component: BaseComponent,
  selector: string
): { activate: () => void; deactivate: () => void } {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let active = false;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !active) return;

    const el = component.shadow.querySelector(selector);
    if (!el) return;

    const focusables = Array.from(el.querySelectorAll(focusableElements)) as HTMLElement[];
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  component._cleanups.push(() => window.removeEventListener('keydown', handleKeyDown));

  return {
    activate: () => { active = true; },
    deactivate: () => { active = false; }
  };
}

export function bindEvent(
  component: BaseComponent,
  selector: string,
  event: string,
  handler: (e: Event) => void
): void {
  const el = component.shadow.querySelector(selector);
  if (el) {
    el.addEventListener(event, handler);
    component._cleanups.push(() => el.removeEventListener(event, handler));
  }
}
