import { ExbaComponent, type ComponentProps } from '../../kernel/core/component';
import { ease, t } from '../../shell/styles';

const STYLES = `
  .container {
    padding: 2rem;
    color: ${t.zinc100};
    font-family: inherit;
  }
  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: ${t.zinc200};
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  .stat-card {
    background: ${t.zinc800a};
    border: 1px solid ${t.zinc700};
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .stat-label {
    font-size: 0.875rem;
    color: ${t.zinc400};
  }
  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: ${t.indigo400};
  }
  .chart-mock {
    margin-top: 2rem;
    height: 200px;
    background: ${t.zinc900a};
    border: 1px solid ${t.zinc800a};
    border-radius: 1rem;
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    padding: 1rem;
  }
  .bar {
    flex: 1;
    background: ${t.indigo500};
    border-radius: 0.25rem 0.25rem 0 0;
    transition: height ${ease};
  }
`;

/**
 * A data visualization component that renders statistical cards and a bar chart.
 * Demonstrates the use of JSON properties for complex data input and 
 * reactive CSS transitions for chart animations.
 */
export class AnalyticsComponent extends ExbaComponent {
  /**
   * Observed properties:
   * - data: An array of numbers representing bar heights (0-100).
   */
  static props: ComponentProps = {
    data: 'json',
  };

  /** Inject the analytics dashboard styles. */
  static styles = STYLES;

  /**
   * Renders the statistics grid and the dynamic bar chart based on the `data` prop.
   */
  render() {
    const bars = this.state.data || [40, 70, 50, 90, 60, 80, 30];
    return `
      <div class="container">
        <div class="title">Analytics</div>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Total Requests</span>
            <span class="stat-value">12,402</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Avg Latency</span>
            <span class="stat-value">14ms</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Uptime</span>
            <span class="stat-value">99.9%</span>
          </div>
        </div>
        <div class="chart-mock">
          ${bars.map((h: number) => `<div class="bar" style="height: ${h}%"></div>`).join('')}
        </div>
      </div>
    `;
  }
}

customElements.define('exba-analytics', AnalyticsComponent);
