import { css } from 'goober';

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #c9d1d9;
  `,
  trigger: css`
    padding: 14px 28px;
    background: linear-gradient(135deg, #58a6ff 0%, #3b82f6 100%);
    color: #fff;
    border: none;
    border-radius: 16px;
    font-weight: 600;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(88, 166, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &:hover { 
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(88, 166, 255, 0.4);
      filter: brightness(1.1);
    }
    &:active { transform: translateY(0); }
  `,
  overlay: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(13, 17, 23, 0.7);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    animation: fadeIn 0.3s ease-out;
  `,
  drawer: css`
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    background: #161b22;
    border-top-left-radius: 32px;
    border-top-right-radius: 32px;
    border: 1px solid #30363d;
    border-bottom: none;
    padding: 0 24px 40px 24px;
    box-shadow: 0 -20px 60px rgba(0,0,0,0.6);
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
  `,
  handle: css`
    width: 48px;
    height: 5px;
    background: #30363d;
    border-radius: 10px;
    margin: 16px auto 32px auto;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { background: #58a6ff; width: 60px; }
  `,
  title: css`
    font-size: 20px;
    font-weight: 700;
    color: #f0f6fc;
    text-align: center;
    margin-bottom: 32px;
    letter-spacing: -0.02em;
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  `,
  card: css`
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 20px;
    padding: 24px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover {
      border-color: #58a6ff;
      background: #1c2128;
      transform: translateY(-6px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.4);
    }
    &:hover .cardIcon { transform: scale(1.2); color: #58a6ff; }
    &:hover .cardLabel { color: #fff; }
  `,
  cardIcon: css`
    font-size: 28px;
    margin-bottom: 12px;
    display: block;
    transition: all 0.3s ease;
    color: #8b949e;
  `,
  cardLabel: css`
    font-size: 14px;
    font-weight: 500;
    color: #c9d1d9;
    transition: color 0.3s;
  `
};

export const DrawerView = {
  name: 'drawer-view',
  initialState: {
    isOpen: false
  },
  render: (state: any) => {
    return `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        :host { display: block; }
      </style>
      <div class="${styles.container}">
        <button class="${styles.trigger}" data-action="toggle-drawer">
          Open System Menu
        </button>
        
        ${state.isOpen ? `
          <div class="${styles.overlay}" data-action="close-backdrop">
            <div class="${styles.drawer}" data-action="no-close">
              <div class="${styles.handle}" data-action="toggle-drawer"></div>
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
        ` : ''}
      </div>
    `;
  },
  events: {
    'click [data-action="toggle-drawer"]': (_e: Event, { setState }: any) => {
      setState((s: any) => ({ isOpen: !s.isOpen }));
    },
    'click [data-action="close-backdrop"]': (e: Event, { setState }: any) => {
      if ((e.target as HTMLElement).dataset.action === 'close-backdrop') {
        setState(() => ({ isOpen: false }));
      }
    },
    'click [data-action="handle-action"]': (e: Event, { setState }: any) => {
      alert(`Action Triggered: ${(e.target as HTMLElement).closest('[data-label]') && ((e.target as HTMLElement).closest('[data-label]') as HTMLElement).dataset.label}`);
      setState(() => ({ isOpen: false }));
    },
  },
  mounted: (el: any, state: any) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isOpen) {
        el.setState(() => ({ isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    el._cleanups.push(() => window.removeEventListener('keydown', handleKeyDown));
  }
};
