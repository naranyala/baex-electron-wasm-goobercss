import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { createEffect } from '../../core/reactivity/Reactivity.js';
import { createPortal } from '../../core/ui/Primitives.js';
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
    animation: fadeIn 0.3s ease-out;
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
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
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
    .card:hover & { transform: scale(1.2); color: ${theme.accentColor}; }
  `,
  cardLabel: css`
    font-size: 14px; font-weight: 500; color: ${theme.subtitleColor};
    transition: color 0.3s;
    .card:hover & { color: ${theme.textColor}; }
  `
};

export const DrawerView = defineComponent({
  name: 'drawer-view',
  initialState: {
    isOpen: false
  },
  render: (_state) => html`
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      :host { display: block; }
    </style>
    <div class="${styles.container}">
      <button class="${styles.trigger}" data-action="toggle-drawer">
        Open System Menu
      </button>
    </div>
  `,
  events: {
    'click [data-action="toggle-drawer"]': (_e, { setState }) => {
      setState(s => ({ isOpen: !s.isOpen }));
    },
  },
  mounted: (el, _state) => {
    const _el = el as any;
    const updatePortal = () => {
      const existing = document.getElementById('exba-drawer-portal');
      if (existing) existing.remove();
      
      if (_el.state.isOpen) {
        const portalRoot = document.createElement('div');
        portalRoot.id = 'exba-drawer-portal';
        portalRoot.innerHTML = `
          <div class="${styles.overlay}" id="drawer-overlay">
            <div class="${styles.drawer}">
              <div class="${styles.handle}" id="drawer-handle"></div>
              <h3 class="${styles.title}">Quick Actions</h3>
              <div class="${styles.grid}">
                ${[
                  { label: 'Settings', icon: '⚙️' },
                  { label: 'Profile', icon: '👤' },
                  { label: 'Notifications', icon: '🔔' },
                  { label: 'Analytics', icon: '📈' },
                  { label: 'Database', icon: '🗄️' },
                  { label: 'Cloud Sync', icon: '☁️' },
                  { label: 'API Keys', icon: '🔑' },
                  { label: 'Help', icon: '❓' },
                ].map(item => `
                  <div class="${styles.card}" data-action="handle-action" data-label="${item.label}">
                    <span class="${styles.cardIcon}">${item.icon}</span>
                    <span class="${styles.cardLabel}">${item.label}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        createPortal(document.body, portalRoot.innerHTML);
      }
    };

    createEffect(() => {
      if (_el.state.isOpen !== undefined) {
        updatePortal();
      }
    });

    const handlePortalClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.id === 'drawer-overlay' || target.id === 'drawer-handle') {
        _el.setState(() => ({ isOpen: false }));
      } else {
        const card = target.closest('.card');
        if (card) {
          const label = card.getAttribute('data-label');
          alert(`Action Triggered: ${label}`);
          _el.setState(() => ({ isOpen: false }));
        }
      }
    };

    document.addEventListener('click', handlePortalClick);
    _el._cleanups.push(() => document.removeEventListener('click', handlePortalClick));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && _el.state.isOpen) {
        _el.setState(() => ({ isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    _el._cleanups.push(() => window.removeEventListener('keydown', handleKeyDown));
  }
});
