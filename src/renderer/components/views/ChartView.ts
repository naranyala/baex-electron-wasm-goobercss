import embed from 'vega-embed';

/**
 * A data visualization component that utilizes Vega-Lite to render charts.
 * Integrates with the reactive state to visualize system performance metrics.
 */
export const ChartView = {
  /** Unique identifier for the component. */
  name: 'chart-view',
  /** Initial state for the chart visualization. */
  initialState: {
    /** The type of chart to render (e.g., 'bar', 'line'). */
    chartType: 'bar',
    /** The data points to be visualized. */
    data: [
      { category: 'Wasm', value: 45 },
      { category: 'Rust', value: 80 },
      { category: 'TS', value: 60 },
      { category: 'C++', value: 30 },
    ]
  },
  /**
   * Renders the chart container and header.
   * The actual chart is injected into the #vega-chart div during the mounted hook.
   */
  render: () => `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 1.5rem 0;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <h2 style="margin: 0; font-size: 1.125rem; font-weight: 600; letter-spacing: -0.01em; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">BAEX Performance Metrics</h2>
        <span style="font-size: 0.75rem; color: #6b6b7b; background: #1f1f23; padding: 0.125rem 0.5rem; border-radius: 0.25rem; border: 1px solid #2a2a30;">Vega-Lite</span>
      </div>
      <div id="vega-chart" style="width: 100%; max-width: 600px; background: #18181b; padding: 1rem; border-radius: 0.875rem; border: 1px solid #2a2a30;"></div>
      <div style="font-size: 0.8125rem; color: #6b6b7b; text-align: center;">
        Data rendered from WasmBridge reactive state
      </div>
    </div>
  `,
  /**
   * Lifecycle hook: configures the Vega-Lite specification and embeds the chart.
   * @param {HTMLElement} el - The root element of the component.
   * @param {any} state - The current state containing the data to visualize.
   */
  mounted: (el: any, state: any) => {
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
};
