import { ExbaComponent } from '../../framework/core/component';
import { t } from '../../app/styles';
import vegaEmbed from 'vega-embed';

const STYLES = `
  .container {
    padding: 2rem;
    color: ${t.zinc100};
    font-family: inherit;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .title {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${t.zinc200};
    margin: 0;
  }
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  .chart-card {
    background: ${t.zinc800};
    border: 1px solid ${t.zinc700};
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }
  .chart-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: ${t.zinc300};
    align-self: flex-start;
  }
  .chart-container {
    width: 100%;
    overflow: auto;
    display: flex;
    justify-content: center;
  }
  /* Hide the Vega action menu by default to keep UI clean */
  .chart-container > details {
    display: none;
  }
`;

export class VegaChartsComponent extends ExbaComponent {
  static styles = STYLES;

  render() {
    return `
      <div class="container">
        <div class="title">Vega-Lite & Vega Charts</div>
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-title">Sales Distribution (Pie)</div>
            <div id="pie-chart" class="chart-container"></div>
          </div>
          <div class="chart-card">
            <div class="chart-title">Skills Assessment (Radar)</div>
            <div id="radar-chart" class="chart-container"></div>
          </div>
          <div class="chart-card">
            <div class="chart-title">Monthly Trend (Bar)</div>
            <div id="bar-chart" class="chart-container"></div>
          </div>
        </div>
      </div>
    `;
  }

  protected onMount() {
    // The component is mounted, schedule chart rendering
    setTimeout(() => this.renderCharts(), 0);
  }

  private async renderCharts() {
    const pieNode = this.shadowRoot?.querySelector('#pie-chart') as HTMLElement;
    const radarNode = this.shadowRoot?.querySelector('#radar-chart') as HTMLElement;
    const barNode = this.shadowRoot?.querySelector('#bar-chart') as HTMLElement;

    if (!pieNode || !radarNode || !barNode) return;

    // Dark theme config matching the UI
    const config = {
      background: 'transparent',
      axis: { labelColor: t.zinc400, titleColor: t.zinc300, gridColor: t.zinc700, domainColor: t.zinc700 },
      legend: { labelColor: t.zinc400, titleColor: t.zinc300 },
      title: { color: t.zinc200 }
    };

    // 1. Pie Chart Spec (Vega-Lite)
    const pieSpec: any = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'A simple pie chart with labels.',
      data: {
        values: [
          {category: 'A', value: 4},
          {category: 'B', value: 6},
          {category: 'C', value: 10},
          {category: 'D', value: 3},
          {category: 'E', value: 7},
          {category: 'F', value: 8}
        ]
      },
      mark: {type: 'arc', innerRadius: 50},
      encoding: {
        theta: {field: 'value', type: 'quantitative'},
        color: {field: 'category', type: 'nominal'}
      },
      config
    };

    // 2. Radar Chart Spec (Vega)
    // Radar charts require full Vega rather than Vega-Lite
    const radarSpec: any = {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description: "A radar chart showing multiple dimensions.",
      width: 200,
      height: 200,
      padding: 20,
      autosize: {type: "none", contains: "padding"},
      signals: [{name: "radius", update: "width / 2"}],
      data: [
        {
          name: "table",
          values: [
            {key: "Frontend", value: 80},
            {key: "Backend", value: 60},
            {key: "WASM", value: 90},
            {key: "Design", value: 50},
            {key: "DevOps", value: 70}
          ]
        },
        {
          name: "keys",
          source: "table",
          transform: [{type: "aggregate", groupby: ["key"]}]
        }
      ],
      scales: [
        {
          name: "angular",
          type: "point",
          range: {signal: "[-PI, PI]"},
          padding: 0.5,
          domain: {data: "table", field: "key"}
        },
        {
          name: "radial",
          type: "linear",
          range: {signal: "[0, radius]"},
          zero: true,
          nice: false,
          domain: [0, 100]
        }
      ],
      encode: {
        enter: {
          x: {signal: "radius"},
          y: {signal: "radius"}
        }
      },
      marks: [
        {
          type: "group",
          name: "categories",
          zindex: 1,
          marks: [
            {
              type: "line",
              name: "category-line",
              from: {data: "keys"},
              encode: {
                enter: {
                  x: {signal: "0"},
                  y: {signal: "0"},
                  x2: {signal: "radius * cos(scale('angular', datum.key))"},
                  y2: {signal: "radius * sin(scale('angular', datum.key))"},
                  stroke: {value: t.zinc700},
                  strokeWidth: {value: 1}
                }
              }
            },
            {
              type: "text",
              name: "value-text",
              from: {data: "keys"},
              encode: {
                enter: {
                  x: {signal: "(radius + 15) * cos(scale('angular', datum.key))"},
                  y: {signal: "(radius + 15) * sin(scale('angular', datum.key))"},
                  text: {field: "key"},
                  align: {
                    signal: "abs(scale('angular', datum.key)) > PI / 2 + 0.1 ? 'right' : abs(scale('angular', datum.key)) < PI / 2 - 0.1 ? 'left' : 'center'"
                  },
                  baseline: {
                    signal: "scale('angular', datum.key) > 0 ? 'top' : scale('angular', datum.key) < 0 ? 'bottom' : 'middle'"
                  },
                  fill: {value: t.zinc300},
                  fontSize: {value: 11}
                }
              }
            }
          ]
        },
        {
          type: "area",
          name: "polygon",
          from: {data: "table"},
          encode: {
            enter: {
              x: {signal: "scale('radial', datum.value) * cos(scale('angular', datum.key))"},
              y: {signal: "scale('radial', datum.value) * sin(scale('angular', datum.key))"},
              fill: {value: t.indigo500a},
              stroke: {value: t.indigo500},
              strokeWidth: {value: 2}
            }
          }
        }
      ],
      config
    };

    // 3. Bar Chart Spec (Vega-Lite)
    const barSpec: any = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'A simple bar chart with embedded data.',
      data: {
        values: [
          {"a": "Jan", "b": 28}, {"a": "Feb", "b": 55}, {"a": "Mar", "b": 43},
          {"a": "Apr", "b": 91}, {"a": "May", "b": 81}, {"a": "Jun", "b": 53}
        ]
      },
      mark: {type: 'bar', color: t.indigo500, cornerRadiusTopLeft: 4, cornerRadiusTopRight: 4},
      encoding: {
        x: {field: 'a', type: 'nominal', axis: {labelAngle: 0}, title: 'Month'},
        y: {field: 'b', type: 'quantitative', title: 'Value'}
      },
      config
    };

    try {
      await vegaEmbed(pieNode, pieSpec, { actions: false });
      await vegaEmbed(radarNode, radarSpec, { actions: false });
      await vegaEmbed(barNode, barSpec, { actions: false });
    } catch (e) {
      console.error('Error embedding vega charts', e);
    }
  }
}

customElements.define('exba-vega-charts', VegaChartsComponent);
