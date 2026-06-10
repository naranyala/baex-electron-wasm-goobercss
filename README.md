# EXBA: Extended Browser API

EXBA is a high-performance framework for building browser-native Web Components powered by WebAssembly compiled from Rust and signal-based reactivity.

The name stands for Extended Browser API - based on the philosophy that the browser's native capabilities (Custom Elements, Shadow DOM, CSS-in-JS) should be extended with Rust/WebAssembly-backed computation without heavy framework lock-in.

---

## Key Features

### 1. Tiered Rendering Architecture
EXBA utilizes a dual-tier rendering engine to maximize performance:
* **Tier 1 (Rust-WASM):** Automatically generates UIBlueprints by parsing templates in Rust. This enables high-performance direct DOM updates and pre-compiled event wiring.
* **Tier 2 (TypeScript Fallback):** A JavaScript-based engine that ensures the application renders correctly even during WASM initialization or in restricted browser environments.

### 2. Deep-Reactive Proxy Stores
EXBA components use a Proxy-based state mapping directly to fine-grained signals.
* **Declarative Mutation:** State changes automatically trigger batched, high-performance re-renders.
* **Automatic Dependency Tracking:** Components only re-render when the specific properties they access are modified.

### 3. Unified Custom Component Specification
Components extend the base `ExbaComponent` class, providing:
* **Static Scoped Styling:** Scoped CSS styles defined as key-value objects or strings using Tailwind-compatible variables.
* **Observed Attributes:** Reactively bound inputs mapped to class properties.
* **Unified Event Delegation:** Clean handling of element events directly inside templates.

### 4. Interactive Graph & Component Demos
The framework includes implementation demonstrations for complex UI controls:
* **Cytoscape.js Mindmap:** Explores hierarchical structures using layout algorithms, node selection details, and base64 PNG exports.
* **Vis-network Mindmap:** Displays bouncing nodes utilizing dynamic physics options, live toggles, and canvas image generation.
* **DatePicker Component:** A monthly viewed date picker featuring custom navigation controls and event emitting.

### 5. Native Diagnostics
Includes a built-in system fetch tool. It gathers raw hardware data from Electron and processes it through the Rust WebAssembly engine to generate detailed system reports.

---

## Architecture

```
  View Layer        Custom Elements + Optional Shadow DOM + CSS-in-JS
  Reactivity Layer  createStore (Proxy) + createSignal + createEffect (Batched)
  Bridge Layer      WASM Bridge + Typed Command Dispatcher
  WASM Layer        Rust Core (AppState + UIBlueprint + Optimization Engine)
```

---

## Development

Install the project dependencies first, then execute the required scripts:

```bash
# Start Vite development server (browser only)
npm run dev

# Start Vite + Electron wrapper
npm run dev:electron

# Compile Rust core to WebAssembly
npm run build:wasm

# Full production build (TypeScript compile + Vite build + Electron package)
npm run build

# Run frontend test suite
npm run test:frontend
```

---

## Framework Contract

| Feature | Pattern | Benefit |
| :--- | :--- | :--- |
| **State** | `createStore(initialState)` | Proxy-based, intuitive, deep reactivity. |
| **Events** | Class-method or DOM actions | Scoped event handlers, self-contained. |
| **Styles** | Scoped class mappings | Theme integration and styling encapsulation. |
| **Performance** | Tiered Rendering | WebAssembly execution speeds with JS fallbacks. |
