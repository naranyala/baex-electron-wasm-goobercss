# EXBA: Extended Browser Api

EXBA is a high-performance framework for building browser-native Web Components powered by WebAssembly compiled from Rust and signal-based reactivity.

The name stands for Extended Browser Api - based on the philosophy that the browser's native capabilities (Custom Elements, Shadow DOM, CSS-in-JS) should be extended with Rust/WebAssembly-backed computation without heavy framework lock-in.

---

## Core Philosophy

1. **Native First:** Leverage standard browser APIs (Custom Elements, Shadow DOM) rather than heavy runtime abstractions.
2. **Rust-Powered:** Offload heavy logic, state management, and template optimization to a high-performance Rust core compiled to WASM.
3. **Signal Reactivity:** Use fine-grained signals and batched effects to perform surgical DOM updates without full tree reconciliations.
4. **Tiered Resilience:** Always provide a TypeScript fallback (Tier 2) to ensure functionality even if the WASM engine (Tier 1) fails to initialize.

---

## Technical Architecture

### 1. Component Specification
All components extend the `ExbaComponent` base class, which provides shadow DOM isolation and reactive life-cycle hooks.

```typescript
import { ExbaComponent, type ComponentProps } from '../framework/core/component';

export class MyComponent extends ExbaComponent {
  // Define observed attributes and their types
  static props: ComponentProps = {
    count: 'number',
    user: 'string'
  };

  // Scoped CSS-in-JS styling
  static styles = {
    card: 'padding: 1rem; border: 1px solid #333; border-radius: 8px;',
    title: 'font-size: 1.25rem; font-weight: bold; color: var(--exba-primary);'
  };

  // Lifecycle hook for initial setup
  protected onMount() {
    console.log('Component mounted');
  }

  // Reactive render method
  render() {
    return `
      <div class="card">
        <h1 class="title">Hello, ${this.state.user}</h1>
        <p>Count: ${this.state.count}</p>
        <button onclick="this.getRootNode().host.setState({ count: this.state.count + 1 })">
          Increment
        </button>
      </div>
    `;
  }
}

customElements.define('my-component', MyComponent);
```

### 2. Signal-based Reactivity
The framework provides an atomic reactivity system for managing both global and local state.

```typescript
import { EXBA } from '../framework/core/exba';

// Create a reactive signal
const count = EXBA.createSignal(0);

// Create a derived computed signal
const double = EXBA.createComputed(() => count.value * 2, [count.key]);

// Register an effect (auto-cleaned up in ExbaComponent)
const unsubscribe = count.subscribe((val) => {
  console.log(`The count is now: ${val}`);
});

// Update the value
count.value += 1;

// Batch multiple updates to prevent intermediate renders
EXBA.batch(() => {
  count.value = 10;
  count.value = 20; // Only one notification will be sent
});
```

### 3. Rust WASM Integration
Heavy lifting and application logic reside in the Rust core.

```rust
use wasm_bindgen::prelude::*;

// High-performance computation in Rust
#[wasm_bindgen]
pub fn fibonacci(n: i32) -> i32 {
    if n <= 1 { return n; }
    let mut a = 0; b = 1;
    for _ in 0..n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    a
}

// Global State mutation through IR (Intermediate Representation)
#[wasm_bindgen]
pub fn wasm_update_app_state(patch_json: &str) -> Result<JsValue, JsValue> {
    // Rust logic to validate and apply state changes
    // ...
}
```

### 4. Typed Bridge Communication
Communication between TypeScript and Rust is handled through a secure, typed bridge.

```typescript
import { EXBA } from '../framework/core/exba';

// Call a WASM function through the bridge
const result = await EXBA.callBridge<number>('fibonacci', 10);

// Use the proxied API for cleaner calls
const state = await EXBA.api.wasm_get_app_state();

// Dispatch a UI action that returns a rendering instruction (IRBundle)
await EXBA.api.process_action('init_dashboard');
```

---

## Directory Structure

```text
.
├── src/
│   ├── app/           # Frontend Application (UI, Styles, Entry)
│   ├── framework/     # EXBA Core Library (DOM, Reactivity, Router)
│   ├── desktop/       # Electron Main and Preload Scripts
│   ├── wasm/          # Rust WebAssembly Engine
│   └── native/        # Native Node.js Addons (SQLite)
├── tools/
│   └── docs/          # Rsbuild-powered API Documentation Generator
├── api-docs-dist/     # Compiled production documentation
└── public/            # Shared static assets
```

---

## Development Workflow

### Requirements
- Node.js (Latest LTS)
- Bun (Optional, for faster tool execution)
- Rust and wasm-pack

### Scripts

| Command | Description |
| :--- | :--- |
| `npm run build:wasm` | Compiles the Rust core into WebAssembly assets. |
| `npm run dev` | Starts the Vite development server in the browser. |
| `npm run dev:electron` | Launches the full Electron application with HMR. |
| `npm run build` | Full production build (WASM -> TSC -> Vite -> Electron Builder). |
| `npm run docs:gen` | Regenerates the optimized API documentation site. |
| `npm run docs:dev` | Starts the documentation site dev server. |

---

## Communication Contract

The framework adheres to a strict JSON-based communication contract:
1. **SSOT:** The Rust layer is the single source of truth for complex application state.
2. **JSON Only:** All cross-boundary calls pass serialized JSON data.
3. **IR Protocol:** Rust returns an IRBundle containing HLIR (High-level semantic effects) and LLIR (Low-level DOM instructions).
