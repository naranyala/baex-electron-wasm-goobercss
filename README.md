# EXBA: Extended Browser API

EXBA is a framework for building browser-native Web Components powered by
Rust/WASM computation and fine-grained signal reactivity. The name stands for
Extended Browser API -- the idea that the browser's native capabilities
(Custom Elements, Shadow DOM, CSS-in-JS) can be extended with WASM-backed
computation without framework lock-in.

This repository serves as both a prototype and a reference implementation for
the EXBA architecture.

---

## Philosophy

### Browser-Native First

EXBA does not ship a runtime library. Components are standard `HTMLElement`
subclasses registered via `customElements.define`. Shadow DOM provides
encapsulation. The platform's native lifecycle callbacks
(`connectedCallback`, `disconnectedCallback`) drive the application. There is
no virtual DOM, no JSX, and no framework-specific component model. Every
component is a valid web component that works in any browser environment.

### WASM as a First-Class Citizen

WebAssembly is not treated as an external plugin or an afterthought. The
architecture is built around a dedicated Bridge Layer that manages a Web Worker
lifecycle, serializes commands via Intermediate Representation (IR), and
returns results through typed promises or reactive signals. Calling a Rust
function from a component template is syntactically and conceptually
indistinguishable from calling a local JavaScript function.

### Signals over Virtual DOM

Instead of diffing a virtual tree against the DOM, EXBA uses fine-grained
signal primitives (`createSignal` / `createEffect`) that track dependencies at
the level of individual values. When a signal changes, only the effects that
explicitly read that signal are re-executed. This avoids the overhead of
tree reconciliation and enables targeted DOM updates via `bindSignal` without
component-wide re-renders.

### Low Ceremony

A component definition is a plain object with three required fields
(`name`, `initialState`, `render`) and two optional ones (`events`,
`mounted`). There are no base classes to extend (unless building a custom
component), no decorators, no injection annotations. The `defineComponent`
factory handles registration, state management, effect wiring, event
delegation, and lifecycle.

### Layered Separation

The architecture is divided into four independent layers that communicate
through narrow, typed interfaces:

- WASM Layer (Rust, compiled to wasm32)
- Bridge Layer (Worker orchestrator and typed API surface)
- Reactivity Layer (signals and effects)
- View Layer (Custom Elements and goober styles)

Each layer can be tested, modified, or replaced independently as long as the
interface contract is maintained.

---

## Architecture

```
  View Layer        Custom Elements + Shadow DOM + goober CSS-in-JS
  Reactivity Layer  createSignal / createEffect / bindSignal
  Bridge Layer      WorkerBridge + WasmWorker + typed IR commands
  WASM Layer        Rust compiled to wasm32-unknown-unknown
```

### WASM Layer

Written in Rust and compiled to `wasm32-unknown-unknown` via wasm-pack. The
layer exposes three core functions:

- `process_ir(command_json)` -- parses a JSON Intermediate Representation
  string, dispatches to the appropriate handler (Add, Fibonacci, Factorial,
  ReverseString, PalindromeCheck, Greet, ReportAnomaly, RulesQuery), and
  returns a JSON-serialized `IRResult`.
- `compile_ir(command_json)` -- compiles a JSON IR command into a compact
  binary bytecode format (8 opcodes: 0x01 through 0x08) for optimized
  execution paths.
- `execute_bytecode(bytecode)` -- executes a pre-compiled bytecode blob and
  returns the result.

The WASM binary is built from `core/rust/` and output to `core/rust/pkg/` as
an ES module with TypeScript declarations.

### Bridge Layer

The Bridge Layer provides a transparent proxy between the UI thread and the
WASM Worker:

- `WasmWorker` is a Web Worker that imports the WASM module, calls `init()`,
  and listens for `postMessage` commands. Incoming messages are decoded from
  `ArrayBuffer` to JSON string, dispatched to `process_ir`, and the result is
  posted back.
- `WorkerBridge` manages the Worker lifecycle and implements a request-response
  protocol using unique correlation IDs. Commands are serialized to JSON,
  encoded as `Uint8Array`, and transferred to the Worker as `ArrayBuffer` to
  avoid copying.
- `WasmBridge` is the high-level typed API surface. It groups operations into
  three categories: `compute` (add, fibonacci, factorial), `text` (reverse,
  isPalindrome), and `system` (greet, reportAnomaly, getRules). Each method
  returns a `Promise` that resolves to the typed result.
- `Compiler` provides direct access to the Rust bytecode pipeline, bypassing
  the Worker for synchronous compilation and execution.

### Reactivity Layer

The reactivity system is implemented in a single file (`Reactivity.ts`) with
no external dependencies:

- `createSignal(initialValue)` returns `{ get, set, peek }`. The internal
  `SignalInternal` class maintains a `Set` of subscriber functions. When a
  signal's value is read via `.get()` inside an active effect, the effect is
  automatically added as a subscriber.
- `createEffect(fn)` executes `fn` immediately while tracking which signals
  are read. If any of those signals change, the effect is re-executed. Returns
  a cleanup function that removes the effect from all tracked signal
  subscriber sets.
- `createDerived(signal, transform)` returns a read-only signal whose value
  is computed by applying `transform` to the source signal's current value.
- `bindSignal(element, signal, property)` creates an effect that sets a DOM
  property (textContent, value, or className) to the signal's value. This
  enables targeted DOM updates without touching any other part of the tree.

### View Layer

Components are standard Custom Elements with open Shadow DOM:

- `BaseComponent` is an abstract class extending `HTMLElement`. It attaches a
  Shadow Root in the constructor and wires a `createEffect` to `update()` in
  `connectedCallback`. The `update()` method calls the abstract `render()`
  method, swaps `shadow.innerHTML`, then converts any inline `<style>` element
  to an `adoptedStyleSheet` for improved encapsulation. `disconnectedCallback`
  cleans up the effect and any registered cleanup hooks.
- `defineComponent(config)` is the component factory. It takes a definition
  object with `name`, `initialState`, `render`, and optional `events` and
  `mounted`. It calls `customElements.define` with a class that extends
  `BaseComponent`. State is stored in a `createSignal` and exposed via a
  reactive `state` getter. Mutations go through `setState(updateFn)` which
  merges the partial patch into the current state through the signal.
- The `events` system uses event delegation on the Shadow Root. Each entry
  maps a descriptor string (e.g. `"click [data-action='add']"`) to a handler
  function that receives the event and an `EventContext` object containing
  `state` and `setState`. Because the listener is on the root, it survives
  `innerHTML` replacements.
- `mounted` is called once after the first render. It receives the element
  instance and the current state. Use for one-time setup that cannot be
  expressed declaratively, such as initializing a third-party library or
  attaching global event listeners (with cleanup via `_cleanups`).

Styles are written with `goober`'s `css` tagged template, which generates
unique, collision-resistant class names and injects them into a global
stylesheet. Component-specific styles from inline `<style>` elements are
extracted and converted to `CSSStyleSheet` objects for adoption into the
Shadow Root.

---

## Framework Contracts

### TypeScript Side (Renderer)

| Module | File | Responsibility |
|--------|------|----------------|
| `createSignal` / `createEffect` | `core/reactivity/Reactivity.ts` | Reactive primitives. Signals track subscribers via `globalThis.__currentEffect`. Effects auto-subscribe to signals read during execution. |
| `BaseComponent` | `core/ui/BaseComponent.ts` | Abstract custom element base. Attaches Shadow DOM. Wires `createEffect` to `update()` in `connectedCallback`. `disconnectedCallback` cleans up effects and registered hooks. |
| `defineComponent` | `core/ui/Component.ts` | Factory: creates a `customElements.define()` class extending `BaseComponent`. State is signal-backed. Exposes `setState()` mutation API. Wires `events` via shadow-root delegation. |
| `WasmBridge` | `core/bridge/WasmBridge.ts` | Typed high-level API (`compute`, `text`, `system`). Sends IR commands to WorkerBridge, returns `Promise<any>`. |
| `WorkerBridge` | `core/bridge/WorkerBridge.ts` | Manages Web Worker lifecycle. Request-response protocol with unique correlation IDs. |
| `WasmWorker` | `core/bridge/WasmWorker.ts` | Web Worker that imports WASM binary, calls `init()`, listens for `postMessage`, dispatches to `process_ir`. |
| `Compiler` | `core/bridge/Compiler.ts` | Compiles JSON IR to binary bytecode via Rust `compile_ir` and `execute_bytecode`. |
| View Components | `components/views/*.ts` | Component definitions. Declare `initialState`, `render(state, helpers)`, optional `events` and `mounted`. |
| `ServiceRegistry` | `core/routing/ServiceRegistry.ts` | DI container. Registered: `db`, `wasm`, `compiler`. |
| `Router` | `core/routing/Router.ts` | Client-side router using `history.pushState` and `popstate`. |
| `EventBus` | `core/routing/EventBus.ts` | Pub/sub for decoupled communication. Returns unsubscribe function. |
| `TabManager` | `core/routing/TabManager.ts` | Persists tab state to `localStorage`. |

### Rust/WASM Side (Core)

| Export | File | Responsibility |
|--------|------|----------------|
| `process_ir(command_json)` | `core/rust/src/lib.rs` | Parses JSON IR string, dispatches to handler (Add, Fibonacci, Factorial, ReverseString, PalindromeCheck, Greet, ReportAnomaly, RulesQuery). Returns IRResult as JSON. |
| `compile_ir(command_json)` | `core/rust/src/lib.rs` | Compiles JSON IR into binary bytecode (8 opcodes: 0x01-0x08). Returns `Uint8Array`. |
| `execute_bytecode(bytecode)` | `core/rust/src/lib.rs` | Executes pre-compiled bytecode. Returns result. |
| `add(a, b)` | `core/rust/src/lib.rs` | Direct WASM export for addition. |
| `fibonacci(n)` | `core/rust/src/lib.rs` | Direct WASM export for Fibonacci sequence. |

### Data Flow

```
User interaction
  -> component event handler (shadow-root delegation or mounted listener)
    -> setState(updateFn)
      -> createSignal.set(newState)
        -> createEffect re-executes
          -> update() -> render() -> innerHTML swap
            OR (targeted):
              bindSignal() -> DOM property update (no re-render)

WASM invocation
  -> WasmBridge.fibonacci(10)
    -> WorkerBridge.execute('Fibonacci', { n: 10 })
      -> JSON.stringify -> TextEncoder -> ArrayBuffer -> postMessage
        -> WasmWorker receives
          -> TextDecoder -> JSON.parse
            -> Rust process_ir(json)
              -> compute -> return IRResult
        -> postMessage back
      -> WorkerBridge resolves promise
    -> WasmBridge returns typed result
  -> setState / signal.set with result
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Rust (WASM), TypeScript |
| Runtime | Electron 30 / Browser |
| Build | Vite 5 + wasm-pack + tsc |
| UI | Web Components (Custom Elements), goober 2, clsx |
| Storage | SQLite (WASM/OPFS in renderer, napi-rs native in main) |
| Visualization | Leaflet, Vega-Lite, Canvas API |
| Testing | Vitest 4 + jsdom |
| Packaging | electron-builder |

---

## Project Structure

```
src/
  main/              Electron main process (IPC, native SQLite, window)
    main.ts          BrowserWindow setup, IPC handlers
    preload.ts       contextBridge exposure
  renderer/          Web application
    main.ts          App entry, component registration, tab system
    core/
      reactivity/    Signal primitives (createSignal, createEffect)
      bridge/        WASM bridge (WorkerBridge, WasmWorker, WasmBridge, Compiler)
      db/            Frontend SQLite wrapper (OPFS + WASM)
      ui/            Component framework (BaseComponent, defineComponent, Functional)
      routing/       DI container, Router, EventBus, TabManager
      tests/         Unit tests for core modules
    components/
      views/         10 view components (Table, Chart, Map, Accordion, etc.)
      tab-bar.ts     Standalone tab-bar custom element
    services/        DbService (imperative + functional APIs)
    state/           Global signals (openTabs, activeTabId)
    styles/          goober theme, design tokens, component CSS
  types/             TypeScript declarations
core/rust/           Rust crate (Cargo.toml, src/lib.rs, pkg/)
examples/            6 example components (basic, counter, todo, parent-child, async, wasm)
native/              napi-rs native SQLite module
tools/api-doc-gen/   API documentation generator (Bun)
```

---

## Development

```
npm run dev                  Start Vite dev server (browser only)
npm run dev:electron         Start Vite + Electron
npm run build:wasm           Compile Rust to WASM (wasm-pack build --target web)
npm run build                Full build: tsc + vite + electron-builder
npm run test:frontend        Run Vitest unit tests
npm run docs:gen             Generate API documentation
```

---

## Roadmap

### Phase 1 -- Unified Reactivity and Signal-Driven Components

The Proxy-based reactivity system was replaced with native `createSignal` and
`createEffect` primitives. Component state is now signal-backed, and the
`WasmBridge` outputs can be wired into signals for a seamless reactive
pipeline.

Completed: ReactiveState removed, defineComponent uses createSignal,
BaseComponent.update() driven by createEffect, all components use setState(),
examples migrated, baex- prefix renamed to exba-.

### Phase 2 -- Targeted DOM and WASM Pipeline Optimization

The events system was wired using shadow-root delegation (surviving re-renders),
disconnectedCallback and effect cleanup were added, adoptedStyleSheets provide
better encapsulation, and a WASM-to-signal-to-DOM demonstration was implemented
using bindSignal.

Completed: Events delegation, effect dependency tracking, lifecycle cleanup,
adoptedStyleSheets, WasmDemo signal binding.

### Future

See [TODOS.md](./TODOS.md) for detailed tracking of remaining items: template
engine integration, shadow-scoped goober, SharedArrayBuffer zero-copy bridge,
E2E tests, developer tools, and performance optimizations.
