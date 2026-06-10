# EXBA: Extended Browser API

<div><img src="./x-sword-humanoid-bee.png" width="40%"/></div>

EXBA is a high-performance framework for building browser-native Web Components powered by **Rust/WASM computation** and **Hybrid Signal Reactivity**. 

The name stands for **Extended Browser API** — the philosophy that the browser's native capabilities (Custom Elements, Light/Shadow DOM, CSS-in-JS) should be extended with WASM-backed logic without heavy framework lock-in.

---

## 🚀 Key Features (Modernized)

### 1. Tiered Rendering Architecture
EXBA utilizes a dual-tier rendering engine to maximize performance:
- **Tier 1 (Rust-WASM)**: Automatically generates `UIBlueprints` by parsing templates in Rust. This enables **$O(1)$ direct DOM updates** and pre-compiled event wiring.
- **Tier 2 (TypeScript Fallback)**: A robust JS-based engine that ensures the app renders perfectly even during WASM initialization or in restricted environments.

### 2. Deep-Reactive Proxy Stores
No more manual `setState` or partial patching. EXBA components use a **Proxy-based state** that maps directly to fine-grained signals.
- **Declarative Mutation**: `state.count++` automatically triggers a batched, high-performance re-render.
- **Automatic Dependency Tracking**: Components only re-render when the specific properties they access are modified.

### 3. Recursive Template Engine
A powerful, recursive `html` tagged template system that handles:
- **Deep Nesting**: Nest `html` templates inside maps and conditionals without `[object Object]` errors.
- **Implicit Event Binding**: Use `@click=${handler}` syntax directly in templates. The framework handles the delegation and cleanup automatically.
- **Array Flattening**: Maps and lists are rendered efficiently without manual `.join('')`.

### 4. Professionalized Component Lifecycle
- **Unified `setup` Hook**: A persistent context for side effects, timers, and specialized logic that survives re-renders.
- **Batched Updates**: Multiple state changes are automatically collapsed into a single `requestAnimationFrame` cycle.
- **DOM Mode Flexibility**: Easily toggle between **Shadow DOM** (for encapsulation) and **Light DOM** (for global CSS/Goober integration) via the `useShadow` flag.

### 5. WASM-Native Diagnostics (Web-Fetch)
Includes a built-in **"Neofetch for the browser"** tool. It gathers raw hardware data from Electron and processes it through a Rust-WASM engine to generate stylized system reports.

---

## 🏗️ Architecture

```
  View Layer        Custom Elements + Optional Shadow DOM + goober CSS
  Reactivity Layer  createStore (Proxy) + createSignal + createEffect (Batched)
  Bridge Layer      WorkerBridge + WasmWorker + Typed Command Dispatcher
  WASM Layer        Rust Core (AppState + UIBlueprint + Optimization Engine)
```

### WASM Optimization Layer
The Rust core is no longer just for "heavy math". It now acts as a **UI Optimizer**:
- **`OptimizeUI`**: A Rust command that scans HTML templates to identify dynamic slots and event handlers.
- **`UIBlueprint`**: A serialized structure returned by Rust that allows the TS layer to cache DOM references for instant updates.

---

## 🛠️ Development

```bash
npm run dev                  # Start Vite dev server (browser only)
npm run dev:electron         # Start Vite + Electron
npm run build:wasm           # Compile Rust to WASM (wasm-pack build --target web)
npm run build                # Full build: tsc + vite + electron-builder
npm run build:win            # Build for Windows (Installer + Portable)
npm run run:win              # Run Windows Portable binary via Wine
npm run test:frontend        # Run Vitest integration suite
```

---

## 📈 Roadmap

### Phase 1: Core Reactivity (Completed)
Established signal-based state and basic component lifecycle.

### Phase 2: WASM Bridge (Completed)
Implemented worker-based IR communication and typed API categories.

### Phase 3: Professionalization (Completed)
Added Slot support, Context API (`provide`/`inject`), and Props reactivity.

### Phase 4: Performance & Ergonomics (Completed)
Implemented Tiered Rendering (Rust), Proxy-based Stores, recursive templates, and `@event` syntax.

### Phase 5: Production Readiness (Active)
Focusing on E2E testing, advanced WASM memory pooling, and Native Hybridization (Node-Native Addons).

---

## 📜 Framework Contract

| Feature | Pattern | Benefit |
| :--- | :--- | :--- |
| **State** | `createStore(initialState)` | Proxy-based, intuitive, deep reactivity. |
| **Events** | `@click=${handler}` | Template-native, auto-delegated, clean. |
| **Lifecycle** | `setup`, `mounted`, `updated` | Predictable, batched, standard-compliant. |
| **Styles** | `useShadow: false` + `goober` | Perfect theme integration and style inheritance. |
| **Performance** | Tiered Rendering | Rust-speed UI updates with JS reliability. |
