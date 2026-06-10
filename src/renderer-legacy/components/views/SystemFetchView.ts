import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';
import { services } from '../../core/routing/ServiceRegistry.js';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Fira Code', 'Courier New', monospace;
    max-width: 800px;
    margin: 0 auto;
    color: #00ff00;
  `,
  terminal: css`
    background: #000000;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    white-space: pre;
    font-size: 0.9rem;
    line-height: 1.5;
    position: relative;
    overflow-x: auto;
    
    &::before {
      content: "system_fetch --full";
      position: absolute;
      top: 5px;
      left: 10px;
      color: #666;
      font-size: 0.7rem;
    }
  `,
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `,
  title: css`
    margin: 0;
    font-size: 1.5rem;
    color: ${theme.textColor};
  `,
  refreshBtn: css`
    background: transparent;
    border: 1px solid #00ff00;
    color: #00ff00;
    padding: 5px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-family: monospace;
    transition: all 0.2s;
    &:hover {
      background: rgba(0, 255, 0, 0.1);
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    }
  `
};

export const SystemFetchView = defineComponent({
  name: 'system-fetch-view',
  useShadow: false,
  initialState: {
    report: 'Initializing fetch...',
    loading: true
  },
  mounted: async (el: any) => {
    const bridge = services.get('wasm') as any;
    try {
      const report = await bridge.system.systemFetch();
      el.setState({ report, loading: false });
    } catch (e: any) {
      el.setState({ report: `Error: ${e.message}`, loading: false });
    }
  },
  render: (state) => html`
    <div class="${styles.container}">
      <div class="${styles.header}">
        <h1 class="${styles.title}">Web-Fetch (WASM Core)</h1>
        <button class="${styles.refreshBtn}" data-action="refresh">REFRESH</button>
      </div>
      <div class="${styles.terminal}">
${state.report}
      </div>
    </div>
  `,
  events: {
    'click [data-action="refresh"]': async (_e, { setState }) => {
      setState(() => ({ report: 'Fetching snapshot...', loading: true }));
      const bridge = services.get('wasm') as any;
      try {
        const report = await bridge.system.systemFetch();
        setState(() => ({ report, loading: false }));
      } catch (e: any) {
        setState(() => ({ report: `Error: ${e.message}`, loading: false }));
      }
    }
  }
});
