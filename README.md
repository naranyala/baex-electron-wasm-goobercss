# Rust-WASM Electron Framework (BAEX)

![bee-holding-axe](./bee-holding-axe.jpg)

A high-performance desktop application integrating **Rust WASM**, **Electron**, and **Web Components**. This project serves as a playground and a foundation for the **BAEX** (Browser API Extended) framework.

## 🎯 Purpose
The goal is to create a seamless, type-safe, and reactive bridge between low-level native performance (Rust/WASM) and modern web UI (Custom Elements) with component-based styling.

## 🏗️ Framework Vision
We are evolving a custom framework that minimizes boilerplate and maximizes the synergy between WASM and the DOM.

### Architectural Boundaries
- **WASM Layer (The Brain):** Handles heavy computation, complex state transitions, and native system interop. Written in Rust.
- **Bridge Layer (The Nerve):** A transparent proxy that manages memory and maps WASM exports to JavaScript calls.
- **View Layer (The Face):** Standard-compliant Custom Elements, styled with **goober** (CSS-in-JS), that react to state changes and render UI efficiently.

### Core Principles
1. **Low Definition:** New components should require minimal setup.
2. **Transparent Connectivity:** Calling WASM functions feels like calling local JS methods.
3. **Componentized Styling:** CSS-in-JS using `goober` for modular, type-safe styles.

## 🚀 Tech Stack
- **Language:** Rust (WASM), TypeScript
- **Runtime:** Electron
- **Build Tool:** Vite
- **UI:** Web Components (Custom Elements), `goober` (CSS-in-JS), `clsx`

## ✨ Feature List
- **Rust-WASM Integration:** High-performance mathematical functions and browser interop (console logging, document manipulation).
- **Custom Web Components:** Tab-bar and other components built using native Web Component standards.
- **CSS-in-JS Styling:** Modular, component-based styling using `goober`.
- **Intelligent Search:** Fuzzy search implementation for navigating feature modules.
- **Dynamic Module Loader:** WASM-powered engine capable of extending browser capabilities.

## 🚧 Upcoming Features (In-Development)
- **WASM Component Lifecycle Hooks:** Native integration to link WASM module lifecycle with Web Component `connectedCallback`/`disconnectedCallback`.
- **Advanced State Management:** WASM-driven global state management for reactive UI updates across complex component trees.
- **Serialization Bridge:** Automated, high-performance data serialization between Rust/WASM and JavaScript.
- **Theme Engine:** Dynamic, WASM-driven theme switching via `goober`.

## 🛠️ Development
- `npm run dev:electron`: Start the development environment.
- `npm run build:wasm`: Compile Rust code to WASM (`wasm-pack`).
- `npm run test:frontend`: Run TypeScript unit tests.
