# Roadmap & TODOs

Tracking the evolution of the BAEX framework.

## Phase 1: Foundation (Core Abstractions)
- [x] Create `src/framework/BaseComponent.ts`
    - [x] Implement automatic Shadow DOM attachment.
    - [x] Standardize the `update()` loop.
    - [x] Create a base `render()` method to be overridden by children.
- [ ] Refactor existing components (e.g., `TabBar`) to extend `BaseComponent`.

## Phase 2: The Bridge (WASM Synergy)
- [ ] Create `src/framework/WasmBridge.ts`
    - [ ] Implement a Proxy-based gateway to eliminate `(window as any)` casts.
    - [ ] Automate memory management for strings (handling `alloc` and `free` inside the bridge).
    - [ ] Add type definitions for WASM exports to ensure TS safety.

## Phase 3: Reactivity (Clean Components)
- [ ] Implement `ReactiveState` in `BaseComponent`
    - [ ] Use JS Proxies to detect state changes.
    - [ ] Link state mutations to the `update()` cycle.
- [ ] Remove manual `this.render()` calls from all components.

## Phase 4: Optimization (Performance)
- [ ] Implement Smarter Rendering
    - [ ] Move away from `innerHTML` for updates.
    - [ ] Explore tagged template literals for targeted DOM diffing.
- [ ] Optimize WASM memory growth and heap management.

## Testing & Quality
- [ ] Increase frontend coverage in `src/main.test.ts`.
- [ ] Implement integration tests for the `WasmBridge`.
