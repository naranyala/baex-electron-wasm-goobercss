import { ExbaComponent } from '../../../framework/core/component';
import { t, ease } from '../../styles';
import cytoscape from 'cytoscape';

const STYLES = `
  .container {
    padding: 2rem;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-sizing: border-box;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${t.zinc100};
    letter-spacing: -0.02em;
    margin: 0;
  }
  .subtitle {
    font-size: 0.8125rem;
    color: ${t.zinc500};
    margin: 0.25rem 0 0 0;
  }
  .canvas-card {
    background: ${t.zinc900a};
    border: 1px solid ${t.zinc800};
    border-radius: 1.5rem;
    height: 550px;
    width: 100%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
  }
  #cy {
    width: 100%;
    height: 100%;
    background: #0d0d0e;
  }
  .toolbar {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    gap: 0.5rem;
    z-index: 10;
  }
  .btn {
    padding: 0.5rem 0.75rem;
    background: rgba(39, 39, 42, 0.75);
    border: 1px solid ${t.zinc800};
    border-radius: 0.5rem;
    color: ${t.zinc300};
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all ${ease};
    backdrop-filter: blur(4px);
  }
  .btn:hover {
    background: ${t.zinc800};
    color: ${t.white};
    border-color: ${t.zinc600};
    transform: translateY(-1px);
  }
  .info-bar {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    padding: 0.5rem 0.75rem;
    background: rgba(15, 15, 15, 0.8);
    border: 1px solid ${t.zinc800};
    border-radius: 0.5rem;
    font-size: 0.75rem;
    color: ${t.zinc400};
    z-index: 10;
  }
`;

/**
 * A complex visualization component using Cytoscape.js.
 * Renders a hierarchical mindmap of the EXBA Architecture with support for
 * dynamic layouts, zooming, and PNG export.
 */
export class MindmapCytoscapeComponent extends ExbaComponent {
  /** Uses Shadow DOM to contain the Cytoscape canvas and styles. */
  static useShadow = true;
  /** Inject the specific mindmap container and toolbar styles. */
  static styles = STYLES;
  /** Internal reference to the Cytoscape core instance. */
  private cyInstance: any = null;

  /**
   * Initializes the Cytoscape instance, defines the graph elements (nodes and edges),
   * applies styles based on node types, and sets up click event handling.
   */
  protected onMount() {
    const container = this.shadowRoot?.getElementById('cy');
    if (!container) return;

    // Define elements for a beautiful hierarchy mindmap of "EXBA Architecture"
    const elements = [
      // Root Node
      { data: { id: 'root', label: 'EXBA Core', type: 'root' } },
      
      // Tier 1 Nodes
      { data: { id: 'reactivity', label: 'Reactivity System', type: 'tier1' } },
      { data: { id: 'bridge', label: 'WASM Bridge', type: 'tier1' } },
      { data: { id: 'renderer', label: 'View Engine', type: 'tier1' } },
      { data: { id: 'native', label: 'Native Layer', type: 'tier1' } },

      // Tier 2 Nodes (Reactivity)
      { data: { id: 'signals', label: 'Signals Store', type: 'tier2' } },
      { data: { id: 'effects', label: 'Batched Effects', type: 'tier2' } },

      // Tier 2 Nodes (Bridge)
      { data: { id: 'dispatcher', label: 'Typed Dispatcher', type: 'tier2' } },
      { data: { id: 'ir', label: 'IR Command/Result', type: 'tier2' } },

      // Tier 2 Nodes (View Engine)
      { data: { id: 'blueprint', label: 'UI Blueprint', type: 'tier2' } },
      { data: { id: 'custom-el', label: 'Custom Elements', type: 'tier2' } },

      // Tier 2 Nodes (Native)
      { data: { id: 'rust', label: 'Rust WASM', type: 'tier2' } },
      { data: { id: 'sqlite', label: 'SQLite Driver', type: 'tier2' } },

      // Edges (Root to Tier 1)
      { data: { id: 'e1', source: 'root', target: 'reactivity' } },
      { data: { id: 'e2', source: 'root', target: 'bridge' } },
      { data: { id: 'e3', source: 'root', target: 'renderer' } },
      { data: { id: 'e4', source: 'root', target: 'native' } },

      // Edges (Reactivity Subtree)
      { data: { id: 'e5', source: 'reactivity', target: 'signals' } },
      { data: { id: 'e6', source: 'reactivity', target: 'effects' } },

      // Edges (Bridge Subtree)
      { data: { id: 'e7', source: 'bridge', target: 'dispatcher' } },
      { data: { id: 'e8', source: 'bridge', target: 'ir' } },

      // Edges (View Engine Subtree)
      { data: { id: 'e9', source: 'renderer', target: 'blueprint' } },
      { data: { id: 'e10', source: 'renderer', target: 'custom-el' } },

      // Edges (Native Subtree)
      { data: { id: 'e11', source: 'native', target: 'rust' } },
      { data: { id: 'e12', source: 'native', target: 'sqlite' } },
    ];

    this.cyInstance = cytoscape({
      container: container,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-family': 'Inter, system-ui, sans-serif',
            'font-size': '11px',
            'font-weight': 'bold',
            'color': '#ffffff',
            'background-color': '#27272a',
            'border-width': '2px',
            'border-color': '#3f3f46',
            'shape': 'round-rectangle',
            'width': '120px',
            'height': '36px',
            'transition-property': 'background-color, border-color, bounds',
            'transition-duration': 0.15,
          }
        },
        {
          selector: 'node[type="root"]',
          style: {
            'font-size': '13px',
            'background-color': '#4f46e5',
            'border-color': '#818cf8',
            'width': '140px',
            'height': '44px',
          }
        },
        {
          selector: 'node[type="tier1"]',
          style: {
            'background-color': '#18181b',
            'border-color': '#6366f1',
            'width': '125px',
            'height': '38px',
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#34d399',
            'border-width': '3px',
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#3f3f46',
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
            'opacity': 0.75,
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 40,
        roots: ['#root'],
        spacingFactor: 1.1,
      }
    });

    // Handle node clicks for interactivity
    this.cyInstance.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const labelEl = this.shadowRoot?.getElementById('selected-node');
      if (labelEl) {
        labelEl.textContent = node.data('label');
      }
    });
  }

  /**
   * Resets the viewport zoom and centers the graph.
   */
  public resetZoom() {
    if (this.cyInstance) {
      this.cyInstance.fit();
      this.cyInstance.center();
    }
  }

  /**
   * Re-runs the graph layout with a new algorithm.
   * @param type The layout algorithm to use.
   */
  public runLayout(type: 'breadthfirst' | 'circle' | 'grid' | 'random') {
    if (this.cyInstance) {
      this.cyInstance.layout({
        name: type,
        directed: type === 'breadthfirst',
        roots: ['#root'],
        padding: 40,
        animate: true,
        animationDuration: 500,
      } as any).run();
    }
  }

  /**
   * Generates a PNG image of the current graph and triggers a browser download.
   */
  public downloadImage() {
    if (this.cyInstance) {
      const pngData = this.cyInstance.png({
        bg: '#0d0d0e',
        full: true,
      });
      const link = document.createElement('a');
      link.href = pngData;
      link.download = 'exba-cytoscape-mindmap.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Renders the component structure including the toolbar and canvas container.
   */
  render() {
    return `
      <div class="container">
        <header class="header">
          <div>
            <h1 class="title">Cytoscape.js Mindmap</h1>
            <p class="subtitle">Hierarchical layout visualization of EXBA Architecture</p>
          </div>
          <div style="font-size: 0.8125rem; color: ${t.zinc500};">Cytoscape rendering</div>
        </header>

        <div class="canvas-card">
          <div class="toolbar">
            <button class="btn" onclick="this.getRootNode().host.resetZoom()">Reset View</button>
            <button class="btn" onclick="this.getRootNode().host.runLayout('breadthfirst')">Tree</button>
            <button class="btn" onclick="this.getRootNode().host.runLayout('circle')">Circle</button>
            <button class="btn" onclick="this.getRootNode().host.runLayout('grid')">Grid</button>
            <button class="btn" onclick="this.getRootNode().host.downloadImage()">Export PNG</button>
          </div>

          <div id="cy"></div>

          <div class="info-bar">
            Selected Node: <strong style="color: ${t.indigo300};" id="selected-node">None</strong>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-mindmap-cytoscape', MindmapCytoscapeComponent);
