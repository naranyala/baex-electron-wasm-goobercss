# Roadmap & TODOs

Tracking the evolution of the BAEX framework.

## Phase 1: Foundation (Core Abstractions)
- [x] Create `src/framework/BaseComponent.ts`
- [x] Implement automatic Shadow DOM attachment.
- [x] Standardize the `update()` loop.
- [x] Create a base `render()` method to be overridden by children.
- [x] Implement `ServiceRegistry` for dependency injection.
- [x] Implement `EventBus` for decoupled communication.
- [x] Implement `Router` for component-based navigation.

## Phase 2: The Bridge (WASM Synergy)
- [x] Create `src/framework/WasmBridge.ts`
- [x] Implement `WorkerBridge` and `WasmWorker` for multi-threaded execution.
- [x] Implement the Compiler API (Rust $\rightarrow$ Binary Bytecode $\rightarrow$ WASM Executor).
- [x] Add type definitions for WASM exports to ensure TS safety.

## Phase 3: Database & Storage (Hybrid SQLite)
- [x] Implement Native SQLite (napi-rs) for Electron Main process.
- [x] Implement Frontend SQLite (WASM) for Renderer/Browser process.
- [x] Create a unified `FrontendDatabase` wrapper with bootstrapping logic.
- [x] Implement OPFS (Origin Private File System) for persistent browser storage.

## Phase 4: Reactivity & Performance (The Scaling Phase)
- [ ] **Fine-Grained Reactivity**:
    - [x] Implement `Signal` primitives for targeted DOM updates.
    - [ ] Implement a DOM-diffing engine to replace `innerHTML` updates.
- [ ] **Execution Optimization**:
    - [ ] Implement `SharedArrayBuffer` for zero-copy data transfer.
    - [ ] Optimize Wasm memory heap management.
- [ ] **State Optimization**:
    - [ ] Introduce selective observables to reduce proxy trap overhead.

## Phase 5: Hardening & Synchronization
- [ ] **Schema Sync**: Implement `ts-rs` to synchronize Rust structs and TypeScript interfaces.
- [ ] **DB Synchronization**: Create a sync layer between Renderer (WASM) and Main (Native) SQLite.
- [ ] **Memory Profiling**: Audit linear memory usage to prevent WASM heap overflows.

## Testing & Quality
- [x] Implement `FrontendDatabase.test.ts` and validate SQLite WASM.
- [x] Verify full build pipeline (wasm-pack + Vite).
- [ ] Increase frontend coverage in `src/main.test.ts`.
- [ ] Implement integration tests for the `WasmBridge` and `WorkerBridge`.
- [ ] Implement E2E tests using Playwright for the Rust-to-DOM pipeline.
