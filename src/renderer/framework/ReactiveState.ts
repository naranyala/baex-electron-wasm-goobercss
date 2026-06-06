export function createReactiveState<T extends object>(target: T, onMutation: () => void): T {
  return new Proxy(target, {
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
  });
}
