type Handler<T = any> = (payload: T) => void;

export interface EventBus {
  publish<T>(event: string, payload: T): void;
  subscribe<T>(event: string, handler: Handler<T>): () => void;
}

class EventBusImpl implements EventBus {
  private listeners = new Map<string, Set<Handler>>();

  publish<T>(event: string, payload: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  subscribe<T>(event: string, handler: Handler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }
}

export const eventBus = new EventBusImpl();
