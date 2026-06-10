import { styles } from '../styles';

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

export function toggleSection(id: string) {
  const content = document.getElementById(id);
  const arrow = document.getElementById(`arrow-${id}`);
  if (content && arrow) {
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? '' : 'none';
    arrow.style.transform = isHidden ? '' : 'rotate(180deg)';
  }
}
