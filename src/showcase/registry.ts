/**
 * Interface defining a self-registering example.
 */
export interface ExamplePlugin {
  id: string;
  label: string;
  icon: string;
  path: string;
  component: string;
  category: 'ui' | 'integration' | 'browser' | 'miniapp';
  /** The code snippet to display in the dev log or landing page. */
  code?: string;
  /** Function to render the component into the container. */
  action: (container: HTMLElement) => void;
}

/**
 * Registry of all available examples.
 * Adding a new demo only requires adding an entry here.
 */
export const EXAMPLE_REGISTRY: ExamplePlugin[] = [
  // --- Mini Apps Lab ---
  {
    id: 'lab-coming-soon',
    label: 'Coming Soon',
    icon: '🧪',
    path: '/lab-coming-soon',
    component: 'div',
    category: 'miniapp',
    action: (c) => c.innerHTML = '<div style="padding: 2rem; text-align: center; color: #a1a1aa;">Mini Apps Lab experiments coming soon...</div>'
  },
  
  // --- UI Components ---
  {
    id: 'code-block',
    label: 'Code Block',
    icon: '📄',
    path: '/code-block',
    component: 'exba-code-block-demo',
    category: 'ui',
    action: (c) => {
        const tsCode = `import { EXBA, ExbaComponent } from '@framework';

/**
 * A reactive user greeting component.
 */
@customElement('user-greeting')
export class UserGreeting extends ExbaComponent {
  private count = EXBA.signal(0);

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
        c.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 2rem; width: 100%;">
            <exba-code-block-demo title="UserGreeting.ts" lang="typescript" code="${tsCode.replace(/"/g, '&quot;')}"></exba-code-block-demo>
            <exba-code-block-demo title="lib.rs" lang="rust" code="${rsCode.replace(/"/g, '&quot;')}"></exba-code-block-demo>
          </div>
        `;
    }
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '🛠️',
    path: '/settings',
    component: 'exba-settings',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-settings></exba-settings>'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    path: '/profile',
    component: 'exba-profile',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-profile></exba-profile>'
  },
  {
    id: 'kanban',
    label: 'Kanban',
    icon: '📋',
    path: '/kanban',
    component: 'exba-kanban',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-kanban></exba-kanban>'
  },
  {
    id: 'date-picker',
    label: 'Date Picker',
    icon: '📅',
    path: '/date-picker',
    component: 'exba-date-picker',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-date-picker></exba-date-picker>'
  },
  {
    id: 'activity',
    label: 'Activity Feed',
    icon: '🔔',
    path: '/activity',
    component: 'exba-activity-feed',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-activity-feed></exba-activity-feed>'
  },
  {
    id: 'accordion',
    label: 'Accordion',
    icon: '🗂️',
    path: '/accordion',
    component: 'exba-accordion',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-accordion></exba-accordion>'
  },
  {
    id: 'drawer',
    label: 'Drawer',
    icon: '📥',
    path: '/drawer',
    component: 'exba-drawer',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-drawer></exba-drawer>'
  },
  {
    id: 'neofetch',
    label: 'Web Neofetch',
    icon: '🖥️',
    path: '/neofetch',
    component: 'exba-neofetch',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-neofetch></exba-neofetch>'
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: '💻',
    path: '/terminal',
    component: 'exba-terminal',
    category: 'ui',
    action: (c) => c.innerHTML = '<exba-terminal></exba-terminal>'
  },

  // --- Integrations ---
  {
    id: 'leaflet-turf',
    label: 'Leaflet.js Example',
    icon: '🌍',
    path: '/leaflet-turf',
    component: 'exba-leaflet-turf',
    category: 'integration',
    action: (c) => c.innerHTML = '<exba-leaflet-turf></exba-leaflet-turf>'
  },
  {
    id: 'mindmap-cytoscape',
    label: 'Cytoscape Mindmap',
    icon: '🕸️',
    path: '/mindmap-cytoscape',
    component: 'exba-mindmap-cytoscape',
    category: 'integration',
    action: (c) => c.innerHTML = '<exba-mindmap-cytoscape></exba-mindmap-cytoscape>'
  },
  {
    id: 'mindmap-vis',
    label: 'vis-network example (mindmap)',
    icon: '🔗',
    path: '/mindmap-vis',
    component: 'exba-mindmap-vis',
    category: 'integration',
    action: (c) => c.innerHTML = '<exba-mindmap-vis></exba-mindmap-vis>'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    path: '/analytics',
    component: 'exba-analytics',
    category: 'integration',
    action: (c) => c.innerHTML = '<exba-analytics></exba-analytics>'
  },
  {
    id: 'vega-charts',
    label: 'Vega Charts (Pie, Radar, Bar)',
    icon: '📈',
    path: '/vega-charts',
    component: 'exba-vega-charts',
    category: 'integration',
    action: (c) => c.innerHTML = '<exba-vega-charts></exba-vega-charts>'
  },
  {
    id: 'audio-waveform',
    label: 'Audio Waveform Player',
    icon: '🎵',
    path: '/audio-waveform',
    component: 'exba-audio-waveform',
    category: 'integration',
    action: (c) => c.innerHTML = '<exba-audio-waveform></exba-audio-waveform>'
  },

  // --- Browser APIs ---
  {
    id: 'api-audio',
    label: 'Web Audio',
    icon: '🔊',
    path: '/api-audio',
    component: 'exba-audio-demo',
    category: 'browser',
    action: (c) => c.innerHTML = '<exba-audio-demo></exba-audio-demo>'
  },
  {
    id: 'api-canvas',
    label: 'Canvas 2D',
    icon: '🎨',
    path: '/api-canvas',
    component: 'exba-canvas-demo',
    category: 'browser',
    action: (c) => c.innerHTML = '<exba-canvas-demo></exba-canvas-demo>'
  },
  {
    id: 'api-storage',
    label: 'Local Storage',
    icon: '💾',
    path: '/api-storage',
    component: 'exba-storage-demo',
    category: 'browser',
    action: (c) => c.innerHTML = '<exba-storage-demo></exba-storage-demo>'
  },
  {
    id: 'api-geo',
    label: 'Geolocation',
    icon: '📍',
    path: '/api-geo',
    component: 'exba-geo-demo',
    category: 'browser',
    action: (c) => c.innerHTML = '<exba-geo-demo></exba-geo-demo>'
  },
  {
    id: 'api-notifications',
    label: 'Notifications',
    icon: '🔔',
    path: '/api-notifications',
    component: 'exba-notifications-demo',
    category: 'browser',
    action: (c) => c.innerHTML = '<exba-notifications-demo></exba-notifications-demo>'
  },
  {
    id: 'api-fullscreen',
    label: 'Fullscreen',
    icon: '🖥️',
    path: '/api-fullscreen',
    component: 'exba-fullscreen-demo',
    category: 'browser',
    action: (c) => c.innerHTML = '<exba-fullscreen-demo></exba-fullscreen-demo>'
  },
  {
    id: 'api-clipboard',
    label: 'Clipboard',
    icon: '📋',
    path: '/api-clipboard',
    component: 'exba-clipboard-demo',
    category: 'browser',
    action: (c) => c.innerHTML = '<exba-clipboard-demo></exba-clipboard-demo>'
  },
  {
    id: 'sqlite-browser',
    label: 'SQLite Browser',
    icon: '🗄️',
    path: '/sqlite-browser',
    component: 'exba-sqlite-demo',
    category: 'integration',
    action: (c) => c.innerHTML = '<exba-sqlite-demo></exba-sqlite-demo>'
  },
];

/**
 * Returns grouped categories for the menu.
 */
export function getMenuCategories() {
  return [
    {
      id: 'mini-apps-lab',
      label: 'Mini Apps Lab',
      items: EXAMPLE_REGISTRY.filter(e => e.category === 'miniapp')
    },
    {
      id: 'component-integration',
      label: 'Component Integration',
      items: EXAMPLE_REGISTRY.filter(e => e.category === 'integration')
    },
    {
      id: 'component-examples',
      label: 'Component Examples',
      items: EXAMPLE_REGISTRY.filter(e => e.category === 'ui')
    },
    {
      id: 'browser-api',
      label: 'Browser API Exploration',
      items: EXAMPLE_REGISTRY.filter(e => e.category === 'browser')
    }
  ];
}
