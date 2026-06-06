export function createReactiveState<T extends object>(target: T, onMutation: () => void): T {
  const handler: ProxyHandler<T> = {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      // Deep reactivity: if the value is an object, wrap it in a proxy too
      if (value !== null && typeof value === 'object') {
        return createReactiveState(value, onMutation);
      }
      return value;
    },
    set(obj, prop, value) {
      const result = Reflect.set(obj, prop, value);
      onMutation();
      return result;
    },
    deleteProperty(obj, prop) {
      const result = Reflect.deleteProperty(obj, prop);
      onMutation();
      return result;
    }
  };
  return new Proxy(target, handler);
}
