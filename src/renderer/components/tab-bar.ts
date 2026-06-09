import { defineComponent } from '../core/ui/Component.js';
import { html } from '../core/ui/Templates.js';
import { theme } from '../styles/theme.ts';
import { css } from 'goober';

const styles = {
  host: css`
    display: flex;
    min-width: 0;
    flex: 1;
    -webkit-app-region: no-drag;
  `,
  bar: css`
    display: flex;
    min-width: 0;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  `,
  button: css`
    flex: none;
    width: 150px;
    height: 100%;
    border: none;
    background: transparent;
    color: ${theme.subtitleColor};
    font-size: 12px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    cursor: pointer;
    user-select: none;
    padding: 16px 12px;
    transition: background 0.12s, color 0.12s;
    -webkit-app-region: no-drag;
    display: flex;
    align-items: center;
    gap: 8px;
    &:hover {
      color: ${theme.textColor};
      background: rgba(255,255,255,0.04);
    }
    &.active {
      color: #fafafa;
      background: rgba(255,255,255,0.07);
    }
  `,
  label: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  `,
  close: css`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    font-size: 14px;
    line-height: 1;
    color: inherit;
    opacity: 0.5;
    transition: opacity 0.1s, background 0.1s;
    margin: 0 -2px;
    &:hover { opacity: 1; background: rgba(255,255,255,0.1); }
  `
};

export const TabBar = defineComponent({
  name: 'tab-bar',
  initialState: {
    tabs: [] as Array<{ id: string; label: string }>,
    activeId: null as string | null,
  },
  observedAttributes: ['tabs', 'active'],
  render: (state) => html`
    <div class="${styles.bar}">
      ${state.tabs.map((t: any) => `
        <button class="${styles.button} ${t.id === state.activeId ? 'active' : ''}" data-id="${t.id}">
          <span class="${styles.label}">${t.label}</span>
          ${t.id !== 'home' ? `<span class="${styles.close}" data-close="${t.id}">&times;</span>` : ''}
        </button>
      `).join('')}
    </div>
  `,
  events: {
    'click button': (e, _ctx) => {
      const target = e.currentTarget as HTMLElement;
      const closeBtn = target.closest(`.${styles.close}`);
      
      if (closeBtn) {
        const id = closeBtn.getAttribute('data-close');
        // Accessing via dispatchEvent on the component instance
        (target.getRootNode() as any).dispatchEvent(new CustomEvent('tab-close', {
          detail: id,
          bubbles: true,
          composed: true,
        }));
        return;
      }
      
      const btn = target.closest('button') as HTMLElement;
      const id = btn?.dataset.id;
      if (id) {
        (target.getRootNode() as any).dispatchEvent(new CustomEvent('tab-click', {
          detail: id,
          bubbles: true,
          composed: true,
        }));
      }
    }
  },
  mounted: (el: any) => {
    const observer = new MutationObserver(() => {
      const tabs = el.getAttribute('tabs');
      const active = el.getAttribute('active');
      if (tabs) el.setState({ tabs: JSON.parse(tabs) });
      if (active) el.setState({ activeId: active });
    });
    observer.observe(el, { attributes: true });
    (el as any)._cleanups.push(() => observer.disconnect());
  }
});
