# Codebase Cleanup Plan

## Dead/Legacy Files and Folders
The following resources are currently unused or represent obsolete versions of the framework logic:

1.  **`examples/` (Root Directory):** Legacy standalone components that reference a non-existent `src/renderer/core/ui` path. All current examples live in `src/renderer/components/examples/`.
2.  **`src/renderer/bridge/wasm_logic.js`:** An old mock WASM implementation. The active bridge logic is managed in `src/renderer/bridge/manager.ts`.
3.  **`debug-native.cjs`:** A temporary debug script for testing the native SQLite module.
4.  **`LEGACY_RENDERER_ARCHITECTURE.md`:** Obsolete documentation that has been superseded by the current architectural implementation.
5.  **`thirdparty/`:** Empty directory with no active dependencies or usage.
6.  **`x-sword-humanoid-bee.png`:** Unused image asset in the root directory.

## Unused Code (Rust Layer)
- **`core/rust/src/utils.rs`:** Several utility modules (`math_utils`, `str_utils`, `coll_utils`) are defined but not called anywhere in the Rust core or through the WASM bridge.

## Proposed Actions
1.  **Delete** the root `examples/` directory.
2.  **Delete** `src/renderer/bridge/wasm_logic.js`.
3.  **Delete** `debug-native.cjs`.
4.  **Delete** `LEGACY_RENDERER_ARCHITECTURE.md`.
5.  **Delete** `thirdparty/` directory.
6.  **Delete** `x-sword-humanoid-bee.png`.
7.  **Prune** `core/rust/src/utils.rs` to remove unused modules, or keep them if they are intended for future use (though they currently count as dead code).

## Verification
- Run `bun run build:wasm` to ensure Rust core still compiles.
- Run `npm run build` to ensure the Electron app still packages correctly.
- Run `bun run docs:gen` to update the API docs (coverage will increase slightly as dead code is removed).
