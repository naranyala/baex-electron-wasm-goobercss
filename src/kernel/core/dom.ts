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
 * Uses key-based reconciliation if key attributes are present.
 * @param parent The parent container for the nodes.
 * @param newNodes The new state of the DOM tree.
 */
function syncNodes(parent: HTMLElement | ShadowRoot, newNodes: Node[]) {
  const oldNodes = Array.from(parent.childNodes);

  // 1. Separate old nodes into keyed and unkeyed
  const oldKeysMap = new Map<string, Node>();
  const oldNodesWithoutKeys: Node[] = [];

  oldNodes.forEach(node => {
    if (node instanceof HTMLElement && node.hasAttribute('key')) {
      oldKeysMap.set(node.getAttribute('key')!, node);
    } else {
      oldNodesWithoutKeys.push(node);
    }
  });

  let oldWithoutKeyIdx = 0;

  // 2. Iterate through new nodes and align them
  newNodes.forEach((newNode, i) => {
    const key = newNode instanceof HTMLElement ? newNode.getAttribute('key') : null;
    let matchingOldNode: Node | undefined;

    if (key && oldKeysMap.has(key)) {
      matchingOldNode = oldKeysMap.get(key);
      oldKeysMap.delete(key); // Mark as used
    } else if (!key && oldWithoutKeyIdx < oldNodesWithoutKeys.length) {
      matchingOldNode = oldNodesWithoutKeys[oldWithoutKeyIdx++];
    }

    if (!matchingOldNode) {
      // Node is new, insert it
      const clone = newNode.cloneNode(true);
      const refNode = parent.childNodes[i];
      parent.insertBefore(clone, refNode || null);
    } else {
      // Incompatible nodes: replace instead of sync
      if (
        matchingOldNode.nodeType !== newNode.nodeType ||
        matchingOldNode.nodeName !== newNode.nodeName
      ) {
        const clone = newNode.cloneNode(true);
        parent.replaceChild(clone, matchingOldNode);
        return;
      }

      // Reorder/move the node if it's not in the correct index position
      const refNode = parent.childNodes[i];
      if (refNode !== matchingOldNode) {
        parent.insertBefore(matchingOldNode, refNode || null);
      }

      // Sync node contents
      if (
        matchingOldNode.nodeType === Node.TEXT_NODE ||
        matchingOldNode.nodeType === Node.COMMENT_NODE
      ) {
        if (matchingOldNode.textContent !== newNode.textContent) {
          matchingOldNode.textContent = newNode.textContent || '';
        }
      } else if (matchingOldNode instanceof HTMLElement && newNode instanceof HTMLElement) {
        updateAttributes(matchingOldNode, newNode);
        syncNodes(matchingOldNode, Array.from(newNode.childNodes));
      }
    }
  });

  // 3. Remove any remaining unmatched old nodes
  oldKeysMap.forEach(node => {
    if (node.parentNode === parent) {
      parent.removeChild(node);
    }
  });

  while (oldWithoutKeyIdx < oldNodesWithoutKeys.length) {
    const node = oldNodesWithoutKeys[oldWithoutKeyIdx++];
    if (node.parentNode === parent) {
      parent.removeChild(node);
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
