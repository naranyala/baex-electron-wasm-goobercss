# 📋 Development Roadmap & TODOs

Tracking the evolution of the **Zig-Element Framework**.

## 🟢 Phase 1: Foundation (Core Abstractions)
- [ ] Create `src/framework/BaseComponent.ts`
    - [ ] Implement automatic Shadow DOM attachment.
    - [ ] Standardize the `update()` loop.
    - [ ] Create a base `render()` method to be overridden by children.
- [ ] Refactor existing components (e.g., `TabBar`) to extend `BaseComponent`.

## 🔵 Phase 2: The Bridge (WASM Synergy)
- [ ] Create `src/framework/WasmBridge.ts`
    - [ ] Implement a `Proxy` based gateway to eliminate `(window as any)` casts.
    - [ ] Automate memory management for strings (handling `alloc` and `free` inside the bridge).
    - [ ] Add type definitions for WASM exports to ensure TS safety.

## 🟡 Phase 3: Reactivity (Clean Components)
- [ ] Implement `ReactiveState` in `BaseComponent`
    - [ ] Use JS Proxies to detect state changes.
    - [ ] Link state mutations to the `update()` cycle.
- [ ] Remove manual `this.render()` calls from all components.

## 🔴 Phase 4: Optimization (Performance)
- [ ] Implement "Smarter Rendering"
    - [ ] Move away from `innerHTML` for updates.
    - [ ] Explore tagged template literals for targeted DOM diffing.
- [ ] Optimize WASM memory growth and heap management.

## 🧪 Testing & Quality
- [ ] Expand `wasm/math.zig` tests to cover edge cases.
- [ ] Increase frontend coverage in `src/main.test.ts`.
- [ ] Implement integration tests for the `WasmBridge`.
