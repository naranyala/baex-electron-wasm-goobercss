# ⚡ EXBA (Extended Browser API) Framework

EXBA is a high-performance, hybrid framework that blends **Rust-powered WebAssembly** with a **Reactive TypeScript Kernel**. It is designed for complex, data-intensive applications that require near-native performance without sacrificing the flexibility of a modern web UI.

## 🏗️ Core Architecture

EXBA moves beyond the traditional "Frontend $\rightarrow$ Backend" split. It implements a **Bi-directional Meta-Bus** where both the TypeScript Kernel and the Rust Engine can orchestrate the application lifecycle.

### 1. The Hybrid Loop
- **TS $\rightarrow$ Rust**: High-level method calls via a proxied API $\rightarrow$ Interceptor Pipeline $\rightarrow$ WASM Execution.
- **Rust $\rightarrow$ TS**: `IRBundle` (Intermediate Representation) $\rightarrow$ Meta-Commands $\rightarrow$ HLIR/LLIR Processing $\rightarrow$ Signal Updates $\rightarrow$ DOM Hydration.

### 2. The Meta-Extension Layer
The framework is entirely pluggable. Through the `EXBA.use()` system, developers can inject cross-cutting concerns without touching the kernel:
- **Interceptors**: Middleware for Bridge calls, Signal notifications, Event emissions, and IR dispatching.
- **Plugins**: Encapsulated features with their own isolated reactive state and lifecycle hooks (`onInit`, `onReady`).
- **Dependency Resolution**: Automatic topological sorting of plugins to ensure correct initialization order.

---

## 🛠️ Structural Meta-Primitives

Unlike atomic frameworks, EXBA provides structural primitives to handle complex UI architectures:

### 📦 State Management
- **`createSignal`**: Atomic reactive units.
- **`createComputed`**: Derived, auto-tracking state.
- **`createStore`**: Encapsulated state + Actions (Atomic transactions).
- **`createContext` / `useContext`**: Scoped state sharing to eliminate prop-drilling.

### ⏳ Async & Physicality
- **`createResource`**: Managed async lifecycles (`loading`, `error`, `value`).
- **`createResizeSignal`**: Direct bridge between DOM measurements and the signal system.

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Basic Usage
```typescript
import { EXBA } from './kernel/core/exba';

// 1. Define a Store
const UserStore = EXBA.createStore({ name: 'Guest', role: 'User' }, {
  setName: (state, newName) => ({ name: newName })
});

// 2. Use in a Component
class UserProfile extends ExbaComponent {
  render() {
    return `<div>Hello, ${UserStore.state.name}</div>`;
  }
}

EXBA.register('user-profile', UserProfile);
```

## 🧩 Plugin Example
```typescript
EXBA.use({
  name: 'logger',
  bridgeInterceptors: [{
    name: 'api-log',
    intercept: async ({ args, next }) => {
      console.log('Calling WASM...', args);
      return next(args);
    }
  }]
});
```
