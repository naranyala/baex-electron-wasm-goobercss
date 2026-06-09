import { css } from 'goober';
import embed from 'vega-embed';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem 0;
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `,
  title: css`
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  badge: css`
    font-size: 0.75rem;
    color: ${theme.subtitleColor};
    background: #1f1f23;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid ${theme.borderColor};
  `,
  chartContainer: css`
    width: 100%;
    max-width: 600px;
    background: #18181b;
    padding: 1rem;
    border-radius: 0.875rem;
    border: 1px solid ${theme.borderColor};
  `,
  footer: css`
    font-size: 0.8125rem;
    color: ${theme.subtitleColor};
    text-align: center;
  `
};

export const ChartView = defineComponent({
  name: 'chart-view',
  initialState: {
    chartType: 'bar',
    data: [
      { category: 'Wasm', value: 45 },
      { category: 'Rust', value: 80 },
      { category: 'TS', value: 60 },
      { category: 'C++', value: 30 },
    ]
  },
  render: () => html`
    <div class="${styles.wrapper}">
      <div class="${styles.header}">
        <h2 class="${styles.title}">EXBA Performance Metrics</h2>
        <span class="${styles.badge}">Vega-Lite</span>
      </div>
      <div id="vega-chart" class="${styles.chartContainer}"></div>
      <div class="${styles.footer}">
        Data rendered from WasmBridge reactive state
      </div>
    </div>
  `,
  mounted: (el, state) => {
    const chartSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'A simple bar chart with embedded data.',
      data: { values: state.data },
      mark: 'bar' as const,
      encoding: {
        x: { field: 'category', type: 'nominal' as const, axis: { labelColor: 'white', titleColor: 'white' } },
        y: { field: 'value', type: 'quantitative' as const, axis: { labelColor: 'white', titleColor: 'white' } },
        color: { value: '#6366f1' }
      },
      config: {
        background: 'transparent',
        axis: { gridColor: '#3f3f46' }
      }
    };
    
    const chartEl = el.shadowRoot?.getElementById('vega-chart');
    if (chartEl) {
      embed(chartEl, chartSpec, { actions: false }).catch(console.error);
    }
  }
});
