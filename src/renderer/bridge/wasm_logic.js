/**
 * WASM Mockup for EXBA Framework
 */

export default async function init() {
  console.log('[WASM Mock] Initializing...');
  return {
    greet: (name) => alert(`[WASM Mock] Hello, ${name}!`),
    process_action: (id) => {
      console.log(`[WASM Mock] Processing action: ${id}`);
      return {
        version: '1.0.0-mock',
        hlir: [{ type: 'Notify', payload: { level: 'info', msg: `Action ${id} processed by Mock WASM` } }],
        llir: []
      };
    },
    process_ir: (json) => {
      const cmd = JSON.parse(json);
      console.log('[WASM Mock] Processing IR:', cmd);
      if (cmd.type === 'KanbanFetch') {
        return {
          type: 'KanbanData',
          payload: [
            { id: '1', title: 'Task from Mock WASM', col: 'todo', tags: ['wasm', 'rust'], priority: 'High' }
          ]
        };
      }
      return { version: '1.0.0-mock', hlir: [], llir: [] };
    },
    add: (a, b) => a + b,
    fibonacci: (n) => {
      if (n <= 1) return n;
      return 55; // Mock value for fib(10)
    },
    wasm_get_app_state: () => ({ counter: 0 }),
    wasm_update_app_state: (patch) => console.log('[WASM Mock] Updating state:', patch)
  };
}
