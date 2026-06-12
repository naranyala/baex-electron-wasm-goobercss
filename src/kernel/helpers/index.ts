/**
 * Collection of high-utility TypeScript helpers.
 */

export const Collection = {
  /**
   * Deeply clones an object or array.
   */
  clone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Returns a unique value from an array based on a key.
   */
  uniqueBy: <T>(arr: T[], key: keyof T) => {
    return Array.from(new Map(arr.map((item) => [item[key], item])).values());
  },

  /**
   * Groups an array of objects by a specific key.
   */
  groupBy: <T>(arr: T[], key: keyof T) => {
    return arr.reduce(
      (acc, item) => {
        const group = String(item[key]);
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  },

  /**
   * Shuffles an array in place.
   */
  shuffle: <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * Flattens a nested array.
   */
  flatten: <T>(arr: any[]): T[] => {
    return arr.reduce(
      (acc, val) =>
        Array.isArray(val)
          ? acc.concat(Collection.flatten(val))
          : acc.concat(val),
      [],
    );
  },
};

export const Async = {
  /**
   * Debounces a function.
   */
  debounce: <T extends (...args: any[]) => any>(fn: T, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Throttles a function.
   */
  throttle: <T extends (...args: any[]) => any>(fn: T, limit: number) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Retries an async operation.
   */
  retry: async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return Async.retry(fn, retries - 1, delay);
    }
  },

  /**
   * Runs an async function after a delay.
   */
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

export const DOM = {
  /**
   * Safely queries an element and casts it.
   */
  query: <T extends HTMLElement>(selector: string): T | null => {
    return document.querySelector(selector) as T | null;
  },

  /**
   * Toggles a class on an element.
   */
  toggle: (el: HTMLElement, className: string, force?: boolean) => {
    el.classList.toggle(className, force);
  },

  /**
   * Checks if an element is visible in the viewport.
   */
  isVisible: (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
};

export const MathUtils = {
  /**
   * Clamps a number between a minimum and maximum value.
   */
  clamp: (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val)),

  /**
   * Linear interpolation between two values.
   */
  lerp: (start: number, end: number, t: number) => start * (1 - t) + end * t,

  /**
   * Returns a random integer between min and max (inclusive).
   */
  randomInt: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
};

export const DateUtils = {
  /**
   * Formats a date to a human-readable string (YYYY-MM-DD).
   */
  format: (date: Date = new Date()) => date.toISOString().split('T')[0],

  /**
   * Returns a relative time string (e.g., "2 hours ago").
   */
  timeAgo: (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    return 'just now';
  },
};

export * from './reactivity';
