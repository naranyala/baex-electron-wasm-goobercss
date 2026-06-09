# Roadmap & TODOs

Tracking the evolution of the EXBA (Extended Browser API) framework.

## Phase 1: Unified Reactivity & Signal-Driven Components (Core Rewire)

The Proxy-based reactivity system is replaced with native `createSignal` /
`createEffect` primitives. Component state becomes signal-backed, and the
`WasmBridge` outputs are wired into signals for a seamless reactive pipeline.

- [x] ~~Proxy-based `ReactiveState`~~ — removed in favour of signals
- [x] `defineComponent` uses `createSignal` instead of `createReactiveState`
- [x] `BaseComponent.update()` driven by `createEffect` tracking signal reads
- [x] Component `mounted` callbacks use `el.setState()` instead of direct mutation
- [x] `main.ts` state mutations use `setState()` instead of direct property set
- [x] Example components fixed: import paths `framework/` → `core/ui/`
- [x] Examples migrated from Proxy to signal-based state
- [x] All `baex-*` renamed to `exba-*` (element tags, storage keys, log strings)
- [x] `ReactiveState.test.ts` removed; remaining tests updated
- [x] WasmBridge signal variants (types added, ready for Phase 2 use)

## Phase 2: Targeted DOM & WASM Pipeline Optimization

### Completed

- [x] **Events system wired**: `defineComponent` now processes `events`
      config via shadow-root event delegation. Handlers receive
      `(e, { state, setState })`. Survives innerHTML re-renders.
- [x] **disconnectedCallback**: `BaseComponent` cleans up effects on
      disconnect. Custom cleanup hooks via `this._cleanups[]`.
- [x] **Effect dependency tracking**: `createEffect` now tracks which
      signals each effect subscribes to, enabling proper cleanup on
      dispose.
- [x] **adoptedStyleSheets**: `update()` converts inline `<style>` to
      `CSSStyleSheet` and adopts it, improving encapsulation.
- [x] **WASM→Signal→DOM demo**: `WasmDemo` example uses `createSignal`
      + `bindSignal` to show targeted DOM updates from WASM results.
- [x] **View component cleanup**: `DrawerView` uses `events` delegation
      + `_cleanups` for global keydown listener. `TableView` uses
      `events` pattern with `setState`.

### Remaining

- [ ] **Targeted DOM patching**: Replace innerHTML swaps with a template
      engine (lit-html / uhtml) that patches only changed nodes.
- [ ] **Shadow-scoped goober**: Override goober's stylesheet target to
      inject into `adoptedStyleSheets` per shadow root instead of global
      `<head>`. Requires per-component `setup()` call.
- [ ] **SharedArrayBuffer zero-copy bridge**: Replace JSON serialization
      with binary SharedArrayBuffer transfer between JS and WASM Worker.
- [ ] **Event system enhancement**: add `data-action` shorthand to the
      events config so views can bind without writing selectors.
- [ ] **E2E tests**: Playwright tests for the Rust-to-DOM pipeline.

## Future Improvements

### Engine (High Priority)
- **Template engine / lit-html integration**: Replace innerHTML with
  `html` tagged template that diffs/patches only changed DOM nodes.
  This fixes the event-listener-loss problem once and for all.
- **Signal-based component state (deep signals)**: Instead of a single
  signal for the entire state object, create signals for individual
  properties so mutations to nested state don't trigger full re-renders.
- **WasmBridge signal-first API**: Bridge methods return `{ get, peek }`
  signals natively, so consumers can `bindSignal` directly without
  manual Promise→signal wiring

### DX (Medium Priority)
- **Hot Module Replacement**: Wire Vite HMR for custom elements so
  component edits reflect instantly.
- **Developer Tools panel**: Enhance the existing EXBA DevTools modal
  with live signal inspection, effect graph, and WASM call tracing.
- **Component generator**: CLI or scaffold script to generate a new view
  component skeleton.

### Performance (Lower Priority)
- **SharedArrayBuffer zero-copy**: Replace JSON stringify/parse with
  structured clone or SAB transfer for large WASM payloads.
- **WASM memory pooling**: Pre-allocate WASM linear memory to avoid
  repeated growth.
- **Selective signal subscriptions**: Avoid re-running effects when
  the signal value hasn't semantically changed (deep equality check).

### Testing & Quality
- [ ] Frontend coverage: integration tests for WasmBridge + WorkerBridge
- [ ] E2E tests with Playwright (full Rust→WASM→DOM pipeline)
- [ ] Rust-side: property-based testing for IR command roundtrips
- [ ] Memory profiling for WASM linear memory heap

## Current Test Status

```
 Test Files:  8 passed | 3 failed (pre-existing)
      Tests: 19 passed |  5 failed (pre-existing)
```

Known pre-existing failures:
- `Advanced.test.ts` — WASM binary not loadable in jsdom/vitest
- `WasmBridge.test.ts` — Worker mock timing issue
- `TodoList.test.ts` — `should delete` — innerHTML loses event listeners
  (solved by `events` system for new views)
