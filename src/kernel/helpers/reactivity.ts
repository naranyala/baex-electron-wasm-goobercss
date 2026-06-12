import { EXBA } from '../core/exba';

/**
 * A boolean signal with helper methods for common toggle logic.
 * @param initial Value to start with.
 */
export function createToggle(initial = false) {
  const [get, set, meta] = EXBA.createSignal(initial);
  return {
    get value() { return get(); },
    set value(v: boolean) { set(v); },
    on: () => set(true),
    off: () => set(false),
    toggle: () => set(v => !v),
    key: meta.key
  };
}

/**
 * A reactive array with built-in mutation methods that trigger updates.
 * @param initial Initial array elements.
 */
export function createArray<T>(initial: T[] = []) {
  const [get, set, meta] = EXBA.createSignal([...initial]);
  
  return {
    get value() { return get(); },
    push: (item: T) => set(prev => [...prev, item]),
    pop: () => {
      let item: T | undefined;
      set(prev => {
        const next = [...prev];
        item = next.pop();
        return next;
      });
      return item;
    },
    remove: (predicate: (item: T) => boolean) => {
      set(prev => prev.filter(i => !predicate(i)));
    },
    clear: () => set([]),
    replace: (index: number, item: T) => {
      set(prev => {
        const next = [...prev];
        next[index] = item;
        return next;
      });
    },
    key: meta.key
  };
}

/**
 * A signal that persists its value in localStorage.
 * @param key LocalStorage key.
 * @param defaultValue Fallback value if nothing is stored.
 */
export function createStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key);
  const initial = stored ? JSON.parse(stored) : defaultValue;
  const [get, set, meta] = EXBA.createSignal<T>(initial);

  // Sync back to storage on change
  EXBA.createEffect(() => {
    localStorage.setItem(key, JSON.stringify(get()));
  });

  return [get, set, meta] as const;
}

/**
 * A reactive timer that increments or updates on an interval.
 * @param ms Interval duration in milliseconds.
 * @param autoStart Whether to start the timer immediately.
 */
export function createTimer(ms: number, autoStart = true) {
  const [count, setCount] = EXBA.createSignal(0);
  let interval: any = null;

  const start = () => {
    if (interval) return;
    interval = setInterval(() => setCount(c => c + 1), ms);
  };

  const stop = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  const reset = () => {
    setCount(0);
  };

  if (autoStart) start();

  return {
    get value() { return count(); },
    start,
    stop,
    reset,
    dispose: stop
  };
}

/**
 * A signal that debounces updates to its value.
 * @param initialValue Starting value.
 * @param delay Delay in milliseconds.
 */
export function createDebounced<T>(initialValue: T, delay: number) {
  const [get, set, meta] = EXBA.createSignal(initialValue);
  const [debouncedGet, setDebounced] = EXBA.createSignal(initialValue);
  
  let timeout: any = null;

  EXBA.createEffect(() => {
    const val = get();
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      setDebounced(val);
    }, delay);
  });

  return {
    get value() { return get(); },
    set value(v: T) { set(v); },
    get debounced() { return debouncedGet(); },
    key: meta.key
  };
}

/**
 * Tracks the mouse position as a reactive signal.
 */
export function createMousePosition() {
  const [pos, setPos] = EXBA.createSignal({ x: 0, y: 0 });

  const handler = (e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  window.addEventListener('mousemove', handler);

  return {
    get value() { return pos(); },
    dispose: () => window.removeEventListener('mousemove', handler)
  };
}

/**
 * Tracks if a media query matches (e.g., '(prefers-color-scheme: dark)').
 */
export function createMediaQuery(query: string) {
  const mql = window.matchMedia(query);
  const [matches, setMatches] = EXBA.createSignal(mql.matches);

  const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
  mql.addEventListener('change', handler);

  return {
    get value() { return matches(); },
    dispose: () => mql.removeEventListener('change', handler)
  };
}

/**
 * Tracks the scroll position of the window.
 */
export function createScrollPosition() {
  const [pos, setPos] = EXBA.createSignal({ x: window.scrollX, y: window.scrollY });

  const handler = () => {
    setPos({ x: window.scrollX, y: window.scrollY });
  };

  window.addEventListener('scroll', handler, { passive: true });

  return {
    get value() { return pos(); },
    dispose: () => window.removeEventListener('scroll', handler)
  };
}

/**
 * Tracks the intersection of an element with its parent or viewport.
 * @param target The element to observe.
 * @param options IntersectionObserver options.
 */
export function createIntersectionObserver(target: HTMLElement, options?: IntersectionObserverInit) {
  const [entry, setEntry] = EXBA.createSignal<IntersectionObserverEntry | null>(null);

  const observer = new IntersectionObserver(([first]) => {
    setEntry(first);
  }, options);

  observer.observe(target);

  return {
    get entry() { return entry(); },
    get isIntersecting() { return entry()?.isIntersecting ?? false; },
    dispose: () => observer.disconnect()
  };
}

/**
 * Tracks the online status of the browser.
 */
export function createOnlineStatus() {
  const [isOnline, setIsOnline] = EXBA.createSignal(navigator.onLine);

  const onlineHandler = () => setIsOnline(true);
  const offlineHandler = () => setIsOnline(false);

  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);

  return {
    get value() { return isOnline(); },
    dispose: () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    }
  };
}

/**
 * Tracks the battery status of the device.
 */
export function createBatteryStatus() {
  const [status, setStatus] = EXBA.createSignal({ level: 1, charging: true });
  let battery: any = null;

  const update = () => {
    if (battery) {
      setStatus({ level: battery.level, charging: battery.charging });
    }
  };

  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((b: any) => {
      battery = b;
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
    });
  }

  return {
    get value() { return status(); },
    dispose: () => {
      if (battery) {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
      }
    }
  };
}
