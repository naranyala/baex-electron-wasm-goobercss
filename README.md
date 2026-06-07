# BAEX: Rust-WASM Electron Framework

![bee-holding-axe](./bee-holding-axe.jpg)

BAEX is a high-performance desktop application framework integrating Rust WASM, Electron, and Web Components. It serves as a playground and a foundation for the Browser API Extended (BAEX) framework.

## Purpose

The goal is to create a seamless, type-safe, and reactive bridge between low-level native performance (Rust/WASM) and modern web UI (Custom Elements) with component-based styling.

## Framework Vision

We are evolving a custom framework that minimizes boilerplate and maximizes the synergy between WASM and the DOM.

### The Layered Architecture

BAEX is designed as a multi-layered pipeline to eliminate the "impedance mismatch" between high-performance Rust and the flexible Web DOM.

- **WASM Layer (The Brain)**: Written in Rust, compiled to `wasm32-unknown-unknown`. It implements a custom Binary Bytecode Executor. Instead of calling a myriad of small WASM functions, BAEX sends compact IR (Intermediate Representation) commands to reduce boundary-crossing overhead.
- **Bridge Layer (The Nerve)**: A transparent proxy and Worker Orchestrator. All WASM execution is offloaded to a `WasmWorker` via the `WorkerBridge` to ensure the UI thread never blocks.
- **Reactivity Layer (The Pulse)**: A fine-grained system using `createSignal` and `createEffect`. It allows for targeted DOM updates (via `bindSignal`) bypassing the need for full-component re-renders.
- **View Layer (The Face)**: Standard-compliant Custom Elements extending `BaseComponent`, styled with `goober` (CSS-in-JS).

### How it Works: The Request Lifecycle

To understand BAEX, follow the path of a single user interaction:

1.  **The Trigger**: A user interacts with a `BaseComponent`. The component calls a method on the `WasmBridge` (e.g., `WasmBridge.compute.fibonacci(10)`).
2.  **The Dispatch**: The Bridge creates an **IR command**, serializes it into an `ArrayBuffer`, and sends it via `postMessage` to the `WasmWorker`.
3.  **The Execution**: The `WasmWorker` decodes the buffer and passes the IR string to the Rust function `process_ir`, which executes the native logic.
4.  **The Reactive Loop**: The result flows back to the component, which updates a **Signal**.
5.  **The Atomic Update**: The state change triggers a targeted update in the DOM, reflecting the result instantly.

### Core Principles

1. **Low Definition:** New components should require minimal setup.
2. **Transparent Connectivity:** Calling WASM functions feels like calling local JS methods.
3. **Componentized Styling:** CSS-in-JS using goober for modular, type-safe styles.

## Tech Stack

- **Languages:** Rust (WASM), TypeScript
- **Runtime:** Electron / Browser
- **Build Tool:** Vite
- **UI:** Web Components (Custom Elements), goober (CSS-in-JS), clsx
- **Storage:** SQLite (Frontend WASM / Backend Native)

## Features

- **Hybrid SQLite Integration:** Dual-mode SQLite engine. Native napi-rs for Electron main process and official WASM build for the renderer/browser.
- **WASM-based Compiler API:** A binary bytecode pipeline that compiles JSON-IR scripts into compact binary formats for optimized execution.
- **Orchestration Primitives:**
    - **Worker Orchestrator**: Offloads WASM computation to separate threads.
    - **Service Registry**: Centralized dependency injection for shared services.
    - **Event Bus**: Decoupled pub/sub communication.
    - **Custom Router**: Path-to-component mapping and history management.
- **Custom Web Components**: Tab-bar and other components built using native Web Component standards.
- **CSS-in-JS Styling**: Modular, component-based styling using goober.
- **Intelligent Search**: Fuzzy search implementation for navigating feature modules.

## Roadmap

- **Fine-Grained Reactivity**: Transition from proxy-based `innerHTML` updates to a Signal-based rendering system.
- **OPFS Persistence**: Integrate Origin Private File System for high-performance, persistent SQLite storage in the browser.
- **Zero-Copy Bridge**: Implement `SharedArrayBuffer` for zero-copy data transfer between JS and WASM Workers.
- **Advanced State Management**: WASM-driven global state management for reactive UI updates across complex component trees.
- **Theme Engine**: Dynamic, WASM-driven theme switching via goober.

## Development

- `npm run dev:electron`: Start the development environment.
- `npm run build:wasm`: Compile Rust code to WASM (using wasm-pack).
- `npm run test:frontend`: Run TypeScript unit tests.
