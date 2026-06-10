import { defineComponent } from '../core/ui/Component.js';
import { html } from '../core/ui/Templates.js';
import { theme } from '../styles/theme.ts';
import { openTabs, activeTabId } from '../state/appState.js';
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
  useShadow: false,
  initialState: {
    // We'll use external signals for reactivity
  },
  mounted: (el) => {
    el.classList.add(styles.host);
  },
  render: () => {
    const tabs = openTabs.get();
    const activeId = activeTabId.get();
    
    // Return empty if no tabs to keep the navbar clean
    if (tabs.length === 0) {
      return '';
    }
    
    return html`
      <div class="${styles.bar}">
        ${tabs.map((t: any) => html`
          <button class="${styles.button} ${t.id === activeId ? 'active' : ''}" 
                  data-action="tab-click" data-id="${t.id}">
            <span class="${styles.label}">${t.label}</span>
            ${t.id !== 'home' ? html`<span class="${styles.close}" data-action="tab-close" data-id="${t.id}">&times;</span>` : ''}
          </button>
        `)}
      </div>
    `;
  },
  events: {
    'click [data-action="tab-close"]': (e, _ctx) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const id = target.dataset.id;
      if (id) {
        window.dispatchEvent(new CustomEvent('tab-close', { detail: id }));
      }
    },
    'click [data-action="tab-click"]': (e, _ctx) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-action="tab-click"]') as HTMLElement;
      const id = btn?.dataset.id;
      if (id) {
        window.dispatchEvent(new CustomEvent('tab-click', { detail: id }));
      }
    }
  }
});
