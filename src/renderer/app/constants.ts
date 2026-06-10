import { EXBA } from '../framework/core/exba';
import { updateResult } from './utils';

export const MENU_CATEGORIES = [
  {
    id: 'wasm-demos',
    label: 'WASM Demos',
    items: [
      {
        id: 'wasm-add',
        label: 'Wasm Add',
        icon: '➕',
        code: `await EXBA.callBridge('add', 10, 20)`,
        action: async () => {
          const res = await EXBA.callBridge<number>('add', 10, 20);
          updateResult(
            `[WASM] 10 + 20 = ${res}`,
            `await EXBA.callBridge('add', 10, 20)`,
          );
        },
      },
      {
        id: 'wasm-fibonacci',
        label: 'Wasm Fibonacci',
        icon: '🌀',
        code: `await EXBA.callBridge('fibonacci', 10)`,
        action: async () => {
          const fib = await EXBA.callBridge<number>('fibonacci', 10);
          updateResult(
            `[WASM] Fibonacci(10) = ${fib}`,
            `await EXBA.callBridge('fibonacci', 10)`,
          );
        },
      },
      {
        id: 'wasm-greet',
        label: 'Wasm Greet',
        icon: '👋',
        code: `await EXBA.callBridge('greet', 'Developer')`,
        action: async () => {
          await EXBA.callBridge('greet', 'Developer');
          updateResult(
            '[WASM] Greeted Developer (check alert)',
            `await EXBA.callBridge('greet', 'Developer')`,
          );
        },
      },
      {
        id: 'hello-action',
        label: 'Hello Action',
        icon: '⚡',
        code: `await EXBA.callBridge('process_action', 'hello')`,
        action: async () => {
          await EXBA.callBridge('process_action', 'hello');
          updateResult(
            '[IR] Processed "hello" action — check greeting box',
            `await EXBA.callBridge('process_action', 'hello')`,
          );
        },
      },
      {
        id: 'error-test',
        label: 'Simulate Anomaly',
        icon: '🔥',
        code: `await EXBA.callBridge('process_action', 'error_test')`,
        action: async () => {
          await EXBA.callBridge('process_action', 'error_test');
          updateResult(
            '[IR] Triggered anomaly — check console',
            `await EXBA.callBridge('process_action', 'error_test')`,
          );
        },
      },
      {
        id: 'neofetch',
        label: 'Web Neofetch',
        icon: '🖥️',
        code: `await EXBA.callBridge('process_ir', { type: 'SystemFetch' })`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-neofetch></exba-neofetch>';
        },
      },
    ],
  },
  {
    id: 'component-examples',
    label: 'Component Examples',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: '🛠️',
        code: `// Settings`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-settings></exba-settings>';
        },
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        code: `// Profile`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container) container.innerHTML = '<exba-profile></exba-profile>';
        },
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: '📊',
        code: `// Analytics`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-analytics></exba-analytics>';
        },
      },
      {
        id: 'terminal',
        label: 'Terminal',
        icon: '💻',
        code: `// Terminal`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-terminal></exba-terminal>';
        },
      },
      {
        id: 'kanban',
        label: 'Kanban',
        icon: '📋',
        code: `// Kanban`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-kanban></exba-kanban>';
        },
      },
      {
        id: 'date-picker',
        label: 'Date Picker',
        icon: '📅',
        code: `// Date Picker`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-date-picker></exba-date-picker>';
        },
      },
      {
        id: 'mindmap-cytoscape',
        label: 'Cytoscape Mindmap',
        icon: '🕸️',
        code: `// Cytoscape Mindmap`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-mindmap-cytoscape></exba-mindmap-cytoscape>';
        },
      },
      {
        id: 'mindmap-vis',
        label: 'Vis Network Mindmap',
        icon: '🔗',
        code: `// Vis Network Mindmap`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-mindmap-vis></exba-mindmap-vis>';
        },
      },
      {
        id: 'activity',
        label: 'Activity Feed',
        icon: '🔔',
        code: `// Activity Feed`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-activity-feed></exba-activity-feed>';
        },
      },
      {
        id: 'accordion',
        label: 'Accordion',
        icon: '🗂️',
        code: `// Accordion`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-accordion></exba-accordion>';
        },
      },
      {
        id: 'drawer',
        label: 'Drawer',
        icon: '📥',
        code: `// Drawer`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-drawer></exba-drawer>';
        },
      },
    ],
  },
  {
    id: 'browser-api',
    label: 'Browser API Exploration',
    items: [
      {
        id: 'api-audio',
        label: 'Web Audio',
        icon: '🔊',
        code: `// Audio API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-audio-demo></exba-audio-demo>';
        },
      },
      {
        id: 'api-canvas',
        label: 'Canvas 2D',
        icon: '🎨',
        code: `// Canvas API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-canvas-demo></exba-canvas-demo>';
        },
      },
      {
        id: 'api-storage',
        label: 'Local Storage',
        icon: '💾',
        code: `// Storage API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-storage-demo></exba-storage-demo>';
        },
      },
      {
        id: 'api-geo',
        label: 'Geolocation',
        icon: '📍',
        code: `// Geolocation API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-geo-demo></exba-geo-demo>';
        },
      },
    ],
  },
];

export const MENU_ITEMS = MENU_CATEGORIES.flatMap((c) => c.items);

export const CODE_EXAMPLES = [
  {
    title: 'Rust WASM Export',
    language: 'rust',
    code: `#[wasm_bindgen]\npub fn add(a: i32, b: i32) -> i32 {\n    a + b\n}`,
  },
  {
    title: 'TypeScript Bridge Call',
    language: 'typescript',
    code: `const sum = await EXBA.callBridge<number>('add', 10, 20);\nconst fib = await EXBA.callBridge<number>('fibonacci', 10);`,
  },
  {
    title: 'IR Bundle Processing',
    language: 'typescript',
    code: `const bundle = await EXBA.callBridge('process_action', 'hello');\n// WASM returns IRBundle → IRProcessor executes LLIR`,
  },
];
