/**
 * Categorized menu structure for the application dashboard.
 * Each item defines a unique ID, label, icon, and the action to perform when clicked.
 */
export const MENU_CATEGORIES = [
  {
    id: 'component-examples',
    label: 'Component Examples',
    items: [
      {
        id: 'code-block',
        label: 'Code Block',
        icon: '📄',
        code: `// Code Block`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container) {
            const tsCode = `import { EXBA, ExbaComponent } from '@framework';

      /**
      * A reactive user greeting component.
      */
      @customElement('user-greeting')
      export class UserGreeting extends ExbaComponent {
      private count = EXBA.createSignal(0);

      render() {
      return html\`
      <div class="card">
        <h1>Hello, \${this.state.name || 'Guest'}!</h1>
        <p>You have clicked \${this.count.value} times.</p>
        <button onclick="\${() => this.count.value++}">
          Click Me
        </button>
      </div>
      \`;
      }
      }`;
            const rsCode = `use wasm_bindgen::prelude::*;

      #[wasm_bindgen]
      pub struct AppState {
      pub counter: i32,
      }

      #[wasm_bindgen]
      pub fn fibonacci(n: i32) -> i32 {
      // High-performance computation in Rust
      if n <= 1 { return n; }
      let (mut a, mut b) = (0, 1);
      for _ in 0..n {
        let temp = a + b;
        a = b;
        b = temp;
      }
      a
      }`;
            container.innerHTML = `
              <div style="display: flex; flex-direction: column; gap: 2rem; width: 100%;">
                <exba-code-block-demo 
                  title="UserGreeting.ts" 
                  lang="typescript" 
                  code="${tsCode.replace(/"/g, '&quot;')}"
                ></exba-code-block-demo>

                <exba-code-block-demo 
                  title="lib.rs" 
                  lang="rust" 
                  code="${rsCode.replace(/"/g, '&quot;')}"
                ></exba-code-block-demo>
              </div>
            `;
          }
        },
      },
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
      {
        id: 'api-notifications',
        label: 'Notifications',
        icon: '🔔',
        code: `// Notifications API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-notifications-demo></exba-notifications-demo>';
        },
      },
      {
        id: 'api-fullscreen',
        label: 'Fullscreen',
        icon: '🖥️',
        code: `// Fullscreen API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-fullscreen-demo></exba-fullscreen-demo>';
        },
      },
      {
        id: 'api-clipboard',
        label: 'Clipboard',
        icon: '📋',
        code: `// Clipboard API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-clipboard-demo></exba-clipboard-demo>';
        },
      },
    ],
  },
];

/** Flattened array of all available menu items. */
export const MENU_ITEMS = MENU_CATEGORIES.flatMap((c) => c.items);

/**
 * Curated list of code snippets for the framework documentation landing page.
 */
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
