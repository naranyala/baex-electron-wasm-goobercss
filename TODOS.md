# 📝 EXBA Development Roadmap

## ✅ Completed: The Meta-Framework Layer
- [x] **Reactivity Engine**: Atomic signals, computed values, and effects.
- [x] **WASM Bridge**: Proxy-based communication with Rust.
- [x] **Meta-Extension System**:
    - [x] Plugin Architecture (`EXBA.use`).
    - [x] Dependency Graph resolution.
    - [x] Unified Interceptor Pipelines (Bridge, Events, Signals, IR).
    - [x] Isolated Plugin States.
- [x] **Bi-directional Integration**:
    - [x] `MetaCommand` support in `IRBundle`.
    - [x] Rust-triggered TS Meta-Events.
- [x] **Structural Primitives**:
    - [x] `createContext` / `useContext` (Scoped State).
    - [x] `createResource` (Async State Management).
    - [x] `createStore` (Centralized Logic/Actions).
    - [x] `createResizeSignal` (DOM $\rightarrow$ State bridge).

---

## 🏗️ In Progress: Structural Rendering
- [ ] **Declarative Template Engine**: Move from `LLIR` (ID-based) to Template-based diffing.
- [ ] **List Reconciliation**: Implement "Keyed" updates for high-performance lists.
- [ ] **WASM Diff Engine**: Move DOM diffing logic into Rust for maximum speed.
- [ ] **Svelte-like Compilation**: Pre-compile components to avoid runtime overhead.

---

## 🧪 Showcase & Integrations
- [ ] **IDE Demo**: Implement a multi-pane editor using `createStore` and `createContext`.
- [ ] **Real-time Dashboard**: Use `createResource` for high-frequency WASM data streams.
- [ ] **Visual Node Editor**: Integrate Cytoscape with `DOMObserverSignals`.

---

## 🛠️ Tooling & DX
- [ ] **DevTools Extension**: A browser plugin to inspect the `EXBA` Signal Graph in real-time.
- [ ] **TypeScript Type-Safety**: Generate TS interfaces automatically from Rust structs.
- [ ] **Hot-Reload Rust**: Seamless WASM module swapping without full page refresh.
