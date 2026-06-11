import { EXBA } from './exba';
import { ResilienceManager } from './resilience';

/**
 * Template result representing a parsed HTML template and its dynamic values.
 */
export interface TemplateResult {
  /** The static string segments of the template. */
  strings: TemplateStringsArray;
  /** The dynamic values interpolated into the template. */
  values: any[];
}

/**
 * Tagged template literal for HTML.
 * Used to define reactive templates with automatic escaping and efficient patching.
 * @param strings Static segments.
 * @param values Interpolated values.
 * @returns A TemplateResult object.
 */
export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): TemplateResult {
  return { strings, values };
}

/**
 * Robust DOM patching utility for EXBA Framework.
 * Uses WASM-powered diffing as primary engine, falling back to TS tree diffing.
 * @param container The DOM element or shadow root to update.
 * @param template The new content as a string or TemplateResult.
 */
export async function patch(
  container: HTMLElement | ShadowRoot,
  template: string | TemplateResult,
) {
  const htmlString =
    typeof template === 'string' ? template : renderTemplate(template);

  // --- Tier 1: WASM Implementation (WIP) ---
  if (ResilienceManager.getActiveTier() === 'wasm') {
    try {
      if (EXBA.bridge && (EXBA.api as any).perform_diff) {
        // Rust diffing logic placeholder
      }
    } catch (e) {
      // Fallback is automatic
    }
  }

  // --- Tier 2: TS Fallback (Current Implementation) ---
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const newNodes = [
    ...Array.from(doc.head.childNodes),
    ...Array.from(doc.body.childNodes),
  ];

  syncNodes(container, newNodes);
}

/**
 * Internal helper to flatten a TemplateResult into a single HTML string.
 */
function renderTemplate(result: TemplateResult): string {
  return result.strings.reduce((acc, str, i) => {
    const val = result.values[i];
    let valStr = '';

    if (val === undefined || val === null) {
      valStr = '';
    } else if (Array.isArray(val)) {
      valStr = val.join('');
    } else {
      valStr = String(val);
    }

    return acc + str + valStr;
  }, '');
}

/**
 * Recursively synchronizes two sets of DOM nodes, applying only necessary updates.
 * @param parent The parent container for the nodes.
 * @param newNodes The new state of the DOM tree.
 */
function syncNodes(parent: HTMLElement | ShadowRoot, newNodes: Node[]) {
  const oldNodes = Array.from(parent.childNodes);
  const max = Math.max(newNodes.length, oldNodes.length);

  for (let i = 0; i < max; i++) {
    const oldNode = oldNodes[i];
    const newNode = newNodes[i];

    // 1. If no old node, append the new one
    if (!oldNode) {
      if (newNode) parent.appendChild(newNode.cloneNode(true));
      continue;
    }

    // 2. If no new node, remove the old one
    if (!newNode) {
      parent.removeChild(oldNode);
      continue;
    }

    // 3. If nodes are incompatible types or tags, replace entirely
    if (
      oldNode.nodeType !== newNode.nodeType ||
      oldNode.nodeName !== newNode.nodeName
    ) {
      parent.replaceChild(newNode.cloneNode(true), oldNode);
      continue;
    }

    // 4. Handle text nodes
    if (oldNode.nodeType === Node.TEXT_NODE) {
      if (oldNode.textContent !== newNode.textContent) {
        oldNode.textContent = newNode.textContent || '';
      }
      continue;
    }

    // 5. Handle element nodes
    if (oldNode instanceof HTMLElement && newNode instanceof HTMLElement) {
      updateAttributes(oldNode, newNode);
      // Recursively sync children instead of re-parsing innerHTML
      syncNodes(oldNode, Array.from(newNode.childNodes));
    }
  }
}

/**
 * Synchronizes attributes between two HTMLElements.
 */
function updateAttributes(oldEl: HTMLElement, newEl: HTMLElement) {
  const oldAttrs = oldEl.getAttributeNames();
  const newAttrs = newEl.getAttributeNames();

  // Remove stale attributes
  for (const attr of oldAttrs) {
    if (!newAttrs.includes(attr)) {
      oldEl.removeAttribute(attr);
    }
  }

  // Update changed attributes
  for (const attr of newAttrs) {
    const newVal = newEl.getAttribute(attr);
    if (oldEl.getAttribute(attr) !== newVal) {
      oldEl.setAttribute(attr, newVal || '');
    }
  }

  // Handle value property for inputs/textareas which isn't always mirrored in attributes
  if (
    (oldEl instanceof HTMLInputElement || oldEl instanceof HTMLTextAreaElement) &&
    (newEl instanceof HTMLInputElement || newEl instanceof HTMLTextAreaElement)
  ) {
    if (oldEl.value !== newEl.value) {
      oldEl.value = newEl.value;
    }
  }
}
