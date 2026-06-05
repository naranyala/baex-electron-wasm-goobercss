import './style.css'

const MENU_ITEMS = [
  { 
    id: 'zig-backend', 
    label: 'Native Engine', 
    icon: '⚙️', 
    action: async () => {
      const version = await (window as any).ipcRenderer.invoke('zig-engine:version');
      const sum = await (window as any).ipcRenderer.invoke('zig-engine:add', [10, 20]);
      updateResult(`[Native Zig] Version: ${version}\nCalculation: 10 + 20 = ${sum}`);
    } 
  },
  { 
    id: 'wasm-math', 
    label: 'Wasm Math', 
    icon: '⚡', 
    action: () => {
      const res = (window as any).add(10, 32);
      const fib = (window as any).fibonacci(7);
      updateResult(`[Wasm] 10 + 32 = ${res}\nFibonacci(7) = ${fib}`);
    } 
  },
  { 
    id: 'wasm-extended', 
    label: 'Extended API', 
    icon: '🌐', 
    action: () => {
      (window as any).wasmGreet('Developer');
      updateResult(`[Wasm Extended] Check the browser tab title and console!`);
    } 
  },
  { id: 'settings', label: 'Settings', icon: '🛠️', action: () => alert('Settings Clicked!') },
  { id: 'profile', label: 'Profile', icon: '👤', action: () => alert('Profile Clicked!') },
  { id: 'analytics', label: 'Analytics', icon: '📊', action: () => alert('Analytics Clicked!') },
  { id: 'messages', label: 'Messages', icon: '✉️', action: () => alert('Messages Clicked!') },
  { id: 'cloud', label: 'Cloud Storage', icon: '☁️', action: () => alert('Cloud Clicked!') },
  { id: 'security', label: 'Security', icon: '🛡️', action: () => alert('Security Clicked!') },
  { id: 'help', label: 'Help Center', icon: '❓', action: () => alert('Help Clicked!') },
  { id: 'terminal', label: 'Terminal', icon: '💻', action: () => alert('Terminal Clicked!') },
  { id: 'network', label: 'Network', icon: '🌐', action: () => alert('Network Clicked!') },
  { id: 'files', label: 'File Manager', icon: '📂', action: () => alert('Files Clicked!') },
  { id: 'database', label: 'Database', icon: '🗄️', action: () => alert('Database Clicked!') },
];

const CODE_EXAMPLES = [
  { 
    title: 'Zig Wasm Export', 
    language: 'zig', 
    code: `export fn add(a: i32, b: i32) i32 {\n    return a + b;\n}` 
  },
  { 
    title: 'Wasm Fetch & Instantiate', 
    language: 'typescript', 
    code: `const response = await fetch('./main.wasm');\nconst bytes = await response.arrayBuffer();\nconst { instance } = await WebAssembly.instantiate(bytes);` 
  },
  { 
    title: 'Tailwind Grid', 
    language: 'html', 
    code: `<div class="grid grid-cols-4 gap-4">\n  <div class="bg-zinc-800 p-4">Item</div>\n</div>` 
  },
];

function updateResult(text: string) {
  const el = document.querySelector<HTMLDivElement>('#execution-log');
  if (el) {
    el.innerText = text;
    el.classList.remove('opacity-50');
    el.classList.add('opacity-100');
  }
}

function fuzzySearch(query: string, items: typeof MENU_ITEMS) {
  const q = query.toLowerCase();
  return items.filter(item => {
    const label = item.label.toLowerCase();
    if (label.includes(q)) return true;
    let i = 0, j = 0;
    while (i < q.length && j < label.length) {
      if (q[i] === label[j]) i++;
      j++;
    }
    return i === q.length;
  });
}

function renderMenu(items: typeof MENU_ITEMS) {
  const grid = document.querySelector<HTMLDivElement>('#menu-grid');
  if (!grid) return;
  grid.innerHTML = items.map(item => `
    <div class="group flex flex-col items-center justify-center aspect-square p-6 bg-zinc-800 border border-zinc-700 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:bg-zinc-700 hover:border-indigo-500 hover:shadow-xl" onclick="window.dispatchMenuAction('${item.id}')">
      <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">${item.icon}</div>
      <div class="text-sm font-medium text-zinc-300 group-hover:text-white">${item.label}</div>
    </div>
  `).join('');
}

function renderExamples() {
  const container = document.querySelector<HTMLDivElement>('#examples-container');
  if (!container) return;
  container.innerHTML = CODE_EXAMPLES.map(ex => `
    <div class="mb-6 bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
      <div class="px-4 py-2 bg-zinc-700 text-xs font-mono text-zinc-400 flex justify-between items-center">
        <span>${ex.title}</span>
        <span class="uppercase">${ex.language}</span>
      </div>
      <pre class="p-4 overflow-x-auto text-sm font-mono text-indigo-300 bg-zinc-900"><code>${ex.code}</code></pre>
    </div>
  `).join('');
}

function toggleSection(id: string) {
  const content = document.getElementById(id);
  const arrow = document.getElementById(`arrow-${id}`);
  if (content && arrow) {
    content.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');
  }
}

function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = `
    <div class="min-h-screen bg-zinc-900 text-zinc-100 p-0">
      <div class="w-full max-w-5xl mx-auto p-8">
        <div class="mb-8 flex flex-col items-center gap-4">
          <input 
            type="text" 
            id="menu-search" 
            class="w-full max-w-md px-4 py-3 text-lg rounded-xl border-2 border-zinc-700 bg-zinc-800 focus:border-indigo-500 outline-none transition-all placeholder-zinc-500" 
            placeholder="Search tools..." 
            autofocus 
          />
          <div id="execution-log" class="text-sm font-mono text-indigo-400 opacity-50 transition-opacity min-h-[1.5rem]">
            Click a module to see output here
          </div>
        </div>

        <div class="space-y-4">
          <div class="border border-zinc-700 rounded-2xl overflow-hidden bg-zinc-800/50">
            <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors" onclick="window.toggleSection('wasm-section')">
              <h2 class="text-xl font-semibold flex items-center gap-2"><span class="text-indigo-400">⚡</span> Wasm & Native Modules</h2>
              <span id="arrow-wasm-section" class="transition-transform duration-200 text-zinc-500">▼</span>
            </div>
            <div id="wasm-section" class="p-6 border-t border-zinc-700">
              <div id="menu-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"></div>
            </div>
          </div>

          <div class="border border-zinc-700 rounded-2xl overflow-hidden bg-zinc-800/50">
            <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors" onclick="window.toggleSection('examples-section')">
              <h2 class="text-xl font-semibold flex items-center gap-2"><span class="text-emerald-400">📄</span> Code Examples</h2>
              <span id="arrow-examples-section" class="transition-transform duration-200 text-zinc-500">▼</span>
            </div>
            <div id="examples-section" class="p-6 border-t border-zinc-700 hidden">
              <div id="examples-container" class="space-y-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  (window as any).dispatchMenuAction = (id: string) => {
    const item = MENU_ITEMS.find(i => i.id === id);
    if (item) item.action();
  };

  (window as any).toggleSection = toggleSection;

  const searchInput = document.querySelector<HTMLInputElement>('#menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      const filtered = fuzzySearch(query, MENU_ITEMS);
      renderMenu(filtered);
    });
  }

  renderMenu(MENU_ITEMS);
  renderExamples();
}

async function loadWasm() {
  try {
    const response = await fetch('./wasm/main.wasm');
    const bytes = await response.arrayBuffer();
    const importObject = {
      env: {
        host_log: (ptr: number, len: number) => {
          const memory = (window as any).wasmMemory.buffer;
          const view = new Uint8Array(memory, ptr, len);
          console.log('%c[Wasm Log]:', 'color: #646cff; font-weight: bold', new TextDecoder().decode(view));
        },
        host_set_document_title: (ptr: number, len: number) => {
          const memory = (window as any).wasmMemory.buffer;
          const view = new Uint8Array(memory, ptr, len);
          document.title = new TextDecoder().decode(view);
        }
      }
    };
    const { instance } = await WebAssembly.instantiate(bytes, importObject);
    const exports = instance.exports as any;
    (window as any).wasmMemory = exports.memory;

    const numericFunctions = ['add', 'factorial', 'gcd', 'isPrime', 'fibonacci'];
    numericFunctions.forEach(fnName => {
      if (exports[fnName]) (window as any)[fnName] = exports[fnName];
    });

    (window as any).wasmGreet = (name: string) => {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(name);
      const ptr = exports.alloc(encoded.length);
      const heap = new Uint8Array(exports.memory.buffer);
      heap.set(encoded, ptr);
      exports.extended_greet(ptr, encoded.length);
      exports.free(ptr, encoded.length);
    };

    console.log('Wasm Engine initialized');
  } catch (e) {
    console.error('Wasm load error:', e);
  }
}

initApp();
loadWasm();

window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
