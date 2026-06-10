# Roadmap & TODOs

Tracking the evolution of the EXBA (Extended Browser API) framework.

## Phase 1: Core Reactivity (Completed)
Established signal-based state and basic component lifecycle.
- [x] ~~Proxy-based `ReactiveState`~~ — replaced by pure signals.
- [x] Signal primitives: `createSignal`, `createEffect`, `createDerived`.
- [x] `BaseComponent.update()` driven by `createEffect` with automatic dependency tracking.

## Phase 2: WASM Bridge & Data Flow (Completed)
Implemented worker-based IR communication and typed API categories.
- [x] `WorkerBridge` with request-response protocol.
- [x] Intermediate Representation (IR) command/result pipeline.
- [x] Bytecode compiler/executor in Rust for optimized execution.
- [x] Aligned Rust/TS schemas (camelCase serialization).

## Phase 3: Framework Professionalization (Completed)
Added Slot support, Context API, and standard lifecycle hooks.
- [x] **Slot Support**: Composition via `<slot>`.
- [x] **Context API**: `provide`/`inject` for deep state sharing.
- [x] **Lifecycle Hooks**: `mounted`, `updated`, `unmounted`.
- [x] **Error Boundaries**: Component-level render error catching.
- [x] **Props Reactivity**: `observedAttributes` integration.

## Phase 4: Performance & Ergonomics (Completed)
Maximized rendering speed and developer experience.
- [x] **Tiered Rendering**: Rust-based `UIBlueprint` for $O(1)$ updates with TS fallback.
- [x] **Deep-Reactive Stores**: Proxy-based state mapping to signals.
- [x] **Recursive Templates**: Nested `html` tagged templates and array flattening.
- [x] **Inline Events**: `@click=${handler}` syntax with automatic delegation.
- [x] **Async Batching**: Update collapsing via `requestAnimationFrame`.
- [x] **Windows Support**: Build scripts for NSIS/Portable and Wine execution.
- [x] **Diagnostics**: Built-in "Web-Fetch" system information tool.

## Phase 5: Production Readiness (Active)
Focusing on scaling, testing, and native integration.
- [ ] **E2E Testing**: Implement Playwright suite for full Rust-to-DOM validation.
- [ ] **Native Hybridization**: Explore Node-Native Addons (napi-rs) for direct hardware access in Electron main.
- [ ] **WASM Memory Pooling**: Pre-allocate and reuse WASM linear memory to reduce GC pressure.
- [ ] **SharedArrayBuffer Bridge**: Zero-copy data transfer between JS and WASM Worker.
- [ ] **Developer Tools**: Dedicated Chrome Extension or side-panel for signal/effect debugging.

## Known Challenges & Technical Debt
- **Vitest Environment**: Some WASM tests require heavy mocking in JSDOM due to `Web Worker` and `fetch` limitations.
- **Style Injection**: Goober's global injection works great for Light DOM, but Shadow DOM components require manual `adoptedStyleSheets` management.
- **Proxy Overhead**: Ensure large datasets are handled via "Shallow Stores" to avoid Proxy recursion.

---

## Current Build Status
| Target | Status | Notes |
| :--- | :--- | :--- |
| **Linux (AppImage)** | ✅ Stable | Primary development target. |
| **Windows (Setup/Portable)** | ✅ Stable | Build via `npm run build:win`. |
| **WASM (Web)** | ✅ Stable | Standard web target supported. |
| **Testing** | ⚠️ Partial | Unit tests pass; E2E pending. |
