import { styles } from '../styles';

/**
 * Updates the 'Execution Log' UI with a success message and optional code snippet.
 * @param text The descriptive result text.
 * @param code Optional code example to display.
 */
export function updateResult(text: string, code?: string) {
  const el = document.querySelector<HTMLDivElement>('#execution-log');
  if (el) {
    el.innerHTML = `
      <div class="${styles.resultText}">${text.replace(/\n/g, '<br>')}</div>
      ${code ? `<pre class="${styles.resultCode}">${code}</pre>` : ''}
    `;
    el.style.opacity = '1';
  }
}

/**
 * Performs a fuzzy search on a list of items based on their label.
 * @param query The search string.
 * @param items The array of objects with 'label' property.
 * @returns Filtered array of matching items.
 */
export function fuzzySearch<T extends { label: string }>(
  query: string,
  items: T[],
): T[] {
  const q = query.toLowerCase();
  return items.filter((item) => {
    const label = item.label.toLowerCase();
    if (label.includes(q)) return true;
    let i = 0,
      j = 0;
    while (i < q.length && j < label.length) {
      if (q[i] === label[j]) i++;
      j++;
    }
    return i === q.length;
  });
}

/**
 * Toggles the visibility of a DOM section and rotates its arrow indicator.
 * @param id The ID of the content element to toggle.
 */
export function toggleSection(id: string) {
  const content = document.getElementById(id);
  const arrow = document.getElementById(`arrow-${id}`);
  if (content && arrow) {
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? '' : 'none';
    arrow.style.transform = isHidden ? '' : 'rotate(180deg)';
  }
}
