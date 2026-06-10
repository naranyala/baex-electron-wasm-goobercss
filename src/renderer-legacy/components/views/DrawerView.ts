import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: ${theme.subtitleColor};
  `,
  trigger: css`
    padding: 14px 28px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
      filter: brightness(1.1);
    }
    &:active { transform: translateY(0); }
  `,
  overlay: css`
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(11, 14, 20, 0.7); backdrop-filter: blur(8px);
    z-index: 1000; display: flex; align-items: flex-end;
  `,
  drawer: css`
    width: 100%; max-width: 600px; margin: 0 auto;
    background: ${theme.backgroundColor};
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border: 1px solid ${theme.borderColor};
    border-bottom: none;
    padding: 0 24px 40px 24px;
    box-shadow: 0 -20px 60px rgba(0,0,0,0.6);
    position: relative;
  `,
  handle: css`
    width: 48px; height: 5px; background: ${theme.borderColor};
    border-radius: 10px; margin: 16px auto 32px auto;
    cursor: pointer; transition: all 0.2s;
    &:hover { background: ${theme.accentColor}; width: 60px; }
  `,
  title: css`
    font-size: 20px; font-weight: 700; color: ${theme.textColor};
    text-align: center; margin-bottom: 32px; letter-spacing: -0.02em;
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 16px; margin-bottom: 20px;
  `,
  card: css`
    background: ${theme.backgroundColor}; border: 1px solid ${theme.borderColor};
    border-radius: 8px; padding: 24px 16px;
    text-align: center; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover {
      border-color: ${theme.accentColor}; background: ${theme.hoverColor};
      transform: translateY(-6px); box-shadow: 0 12px 24px rgba(0,0,0,0.4);
    }
  `,
  cardIcon: css`
    font-size: 28px; margin-bottom: 12px; display: block;
    transition: all 0.3s ease; color: ${theme.subtitleColor};
  `,
  cardLabel: css`
    font-size: 14px; font-weight: 500; color: ${theme.subtitleColor};
    transition: color 0.3s;
  `
};

export const DrawerView = defineComponent({
  name: 'drawer-view',
  useShadow: false,
  initialState: {
    isOpen: false
  },
  render: (state) => {
    const items = [
      { label: 'Settings', icon: '⚙️' },
      { label: 'Profile', icon: '👤' },
      { label: 'Notifications', icon: '🔔' },
      { label: 'Analytics', icon: '📈' },
      { label: 'Database', icon: '🗄️' },
      { label: 'Cloud Sync', icon: '☁️' },
      { label: 'API Keys', icon: '🔑' },
      { label: 'Help', icon: '❓' },
    ];

    return html`
      <div class="${styles.container}">
        <button class="${styles.trigger}" data-action="toggle">
          Open System Menu
        </button>

        ${state.isOpen ? html`
          <div class="${styles.overlay}" data-action="close">
            <div class="${styles.drawer}" data-action="stop">
              <div class="${styles.handle}" data-action="close"></div>
              <h3 class="${styles.title}">Quick Actions</h3>
              <div class="${styles.grid}">
                ${items.map(item => html`
                  <div class="${styles.card}" data-action="action" data-label="${item.label}">
                    <span class="${styles.cardIcon}">${item.icon}</span>
                    <span class="${styles.cardLabel}">${item.label}</span>
                  </div>
                `)}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },
  events: {
    'click [data-action="toggle"]': (_e, { setState }) => {
      setState(s => ({ isOpen: !s.isOpen }));
    },
    'click [data-action="close"]': (_e, { setState }) => {
      setState(() => ({ isOpen: false }));
    },
    'click [data-action="stop"]': (e) => {
      e.stopPropagation();
    },
    'click [data-action="action"]': (_e, { setState, target }) => {
      const label = target.getAttribute('data-label');
      alert(`Action Triggered: ${label}`);
      setState(() => ({ isOpen: false }));
    }
  },
  mounted: (el) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        (el as any).setState(() => ({ isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    (el as any)._cleanups.push(() => window.removeEventListener('keydown', handleKeyDown));
  }
});
