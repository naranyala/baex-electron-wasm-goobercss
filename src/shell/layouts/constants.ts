import { getMenuCategories } from '../../showcase/registry';

/**
 * Categorized menu structure for the application dashboard.
 * Dynamically derived from the Example Registry.
 */
export const MENU_CATEGORIES = getMenuCategories();

/** Flattened array of all available menu items. */
export const MENU_ITEMS = MENU_CATEGORIES.flatMap((c) => c.items);

/**
 * Curated list of code snippets for the framework documentation landing page.
 */
export const CODE_EXAMPLES = [
  {
    title: 'Rust WASM Export',
    language: 'rust',
    code: `#[wasm_bindgen]\npub fn add(a: i32, b: i32) -> i32 {\n    a + b\n}`,
  },
  {
    title: 'TypeScript Bridge Call',
    language: 'typescript',
    code: `const sum = await EXBA.callBridge<number>('add', 10, 20);\nconst fib = await EXBA.callBridge<number>('fibonacci', 10);`,
  },
  {
    title: 'IR Bundle Processing',
    language: 'typescript',
    code: `const bundle = await EXBA.callBridge('process_action', 'hello');\n// WASM returns IRBundle → IRProcessor executes LLIR`,
  },
];
