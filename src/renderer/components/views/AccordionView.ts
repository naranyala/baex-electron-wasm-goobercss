import { css } from 'goober';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 750px;
    margin: 0 auto;
    color: #c9d1d9;
    animation: fadeIn 0.5s ease-out;
  `,
  header: css`
    text-align: center;
    margin-bottom: 48px;
  `,
  title: css`
    font-size: 32px;
    font-weight: 800;
    color: #f0f6fc;
    margin-bottom: 12px;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #fff 0%, #8b949e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  subtitle: css`
    font-size: 16px;
    color: #8b949e;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.5;
  `,
  item: css`
    margin-bottom: 16px;
    border: 1px solid #30363d;
    border-radius: 16px;
    overflow: hidden;
    background: #161b22;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover {
      border-color: #58a6ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
  `,
  accordionHeader: css`
    padding: 20px 24px;
    background: #161b22;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
    user-select: none;
    transition: background 0.2s;
    &:hover { background: #1c2128; }
  `,
  content: css`
    padding: 0 24px 24px 24px;
    font-size: 15px;
    line-height: 1.7;
    color: #8b949e;
    animation: expand 0.3s ease-out;
  `,
  icon: css`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #21262d;
    color: #58a6ff;
    font-size: 12px;
    transition: all 0.3s ease;
    &.open { 
      transform: rotate(180deg);
      background: #58a6ff;
      color: #fff;
    }
  `
};

interface AccordionState {
  openIndex: number | null;
  items: { title: string; content: string }[];
}

export const AccordionView = {
  name: 'accordion-view',
  initialState: {
    openIndex: null,
    items: [
      { title: 'What is EXBA?', content: 'EXBA is a high-performance framework utilizing WASM and a Worker-Bridge for efficient data processing. It bypasses the main thread for heavy computations, ensuring a fluid user interface regardless of data volume.' },
      { title: 'How does the Reactivity work?', content: 'The framework uses a signal-based reactivity system. By wrapping state in signals, it can automatically detect changes and trigger targeted DOM updates, minimizing expensive re-renders.' },
      { title: 'Why Electron?', content: 'Electron allows us to combine the power of a native desktop environment (like direct filesystem access and multi-process architecture) with the flexibility and rich ecosystem of modern web technologies.' },
    ]
  },
  render: (state) => {
    return `
      <style>
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes expand { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 200px; } }
        :host { display: block; }
      </style>
      <div class="${styles.container}">
        <div class="${styles.header}">
          <h2 class="${styles.title}">FAQ Guide</h2>
          <p class="${styles.subtitle}">Everything you need to know about the EXBA architecture and design philosophy.</p>
        </div>
        ${state.items.map((item, idx) => `
          <div class="${styles.item}">
            <div class="${styles.accordionHeader}" onclick="this.getRootNode().host.toggleItem(${idx})">
              ${item.title}
              <span class="${styles.icon} ${state.openIndex === idx ? 'open' : ''}">▾</span>
            </div>
            ${state.openIndex === idx ? `
              <div class="${styles.content}">
                ${item.content}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },
  mounted: (el, state) => {
    (el as any).toggleItem = (idx: number) => {
      el.setState((s: any) => ({ openIndex: s.openIndex === idx ? null : idx }));
    };
  }
};
