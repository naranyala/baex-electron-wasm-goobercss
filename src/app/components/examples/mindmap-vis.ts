import { ExbaComponent } from '../../../framework/core/component';
import { t, ease } from '../../styles';
// @ts-ignore
import { Network } from 'vis-network';

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
  #vis {
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
 * A visualization component using vis-network.
 * Displays a physics-simulated, bouncy mindmap of the EXBA Architecture.
 * Supports zoom, drag, and toggleable physics simulation.
 */
export class MindmapVisComponent extends ExbaComponent {
  /** Uses Shadow DOM to isolate the vis-network canvas and styles. */
  static useShadow = true;
  /** Inject the specific mindmap container and toolbar styles. */
  static styles = STYLES;
  /** Internal reference to the vis-network core instance. */
  private netInstance: any = null;

  /**
   * Initializes the vis-network graph, defines nodes/edges, and sets up 
   * physics-based hierarchical layout.
   */
  protected onMount() {
    const container = this.shadowRoot?.getElementById('vis');
    if (!container) return;

    // Define nodes and edges for the vis-network physics layout
    const nodes = [
      { id: 1, label: 'EXBA Core', level: 0, color: { background: '#4f46e5', border: '#818cf8' }, font: { size: 14, color: '#ffffff', multi: 'md' } },
      
      { id: 2, label: 'Reactivity System', level: 1, color: { background: '#18181b', border: '#6366f1' } },
      { id: 3, label: 'WASM Bridge', level: 1, color: { background: '#18181b', border: '#6366f1' } },
      { id: 4, label: 'View Engine', level: 1, color: { background: '#18181b', border: '#6366f1' } },
      { id: 5, label: 'Native Layer', level: 1, color: { background: '#18181b', border: '#6366f1' } },

      { id: 6, label: 'Signals Store', level: 2 },
      { id: 7, label: 'Batched Effects', level: 2 },

      { id: 8, label: 'Typed Dispatcher', level: 2 },
      { id: 9, label: 'IR Command/Result', level: 2 },

      { id: 10, label: 'UI Blueprint', level: 2 },
      { id: 11, label: 'Custom Elements', level: 2 },

      { id: 12, label: 'Rust WASM', level: 2 },
      { id: 13, label: 'SQLite Driver', level: 2 },
    ];

    const edges = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 },

      { from: 2, to: 6 },
      { from: 2, to: 7 },

      { from: 3, to: 8 },
      { from: 3, to: 9 },

      { from: 4, to: 10 },
      { from: 4, to: 11 },

      { from: 5, to: 12 },
      { from: 5, to: 13 },
    ];

    const options = {
      nodes: {
        shape: 'box',
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        font: {
          color: '#ffffff',
          size: 11,
          face: 'Inter, system-ui, sans-serif',
        },
        color: {
          background: '#27272a',
          border: '#3f3f46',
          highlight: {
            background: '#27272a',
            border: '#34d399',
          },
        },
        borderWidth: 2,
        borderRadius: 8,
      },
      edges: {
        color: {
          color: '#3f3f46',
          highlight: '#34d399',
        },
        width: 2,
        arrows: {
          to: { enabled: false },
        },
      },
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'UD',
          sortMethod: 'directed',
          nodeSpacing: 140,
          levelSpacing: 110,
        },
      },
      physics: {
        enabled: true,
        hierarchicalRepulsion: {
          nodeDistance: 130,
        },
      },
      interaction: {
        zoomView: true,
        dragView: true,
      },
    };

    const data = { nodes, edges };
    this.netInstance = new Network(container, data, options);

    // Node selection callback
    this.netInstance.on('selectNode', (params: any) => {
      const nodeId = params.nodes[0];
      const nodeObj = nodes.find((n) => n.id === nodeId);
      if (nodeObj) {
        const labelEl = this.shadowRoot?.getElementById('selected-node');
        if (labelEl) {
          labelEl.textContent = nodeObj.label;
        }
      }
    });

    this.netInstance.on('deselectNode', () => {
      const labelEl = this.shadowRoot?.getElementById('selected-node');
      if (labelEl) {
        labelEl.textContent = 'None';
      }
    });
  }

  /**
   * Fits the entire graph into the viewport with a smooth animation.
   */
  public resetView() {
    if (this.netInstance) {
      this.netInstance.fit({
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad',
        },
      });
    }
  }

  /**
   * Toggles the live physics simulation on/off.
   */
  public togglePhysics() {
    const currentPhysics = this.state.physicsEnabled !== false;
    const nextPhysics = !currentPhysics;
    this.state.physicsEnabled = nextPhysics;
    if (this.netInstance) {
      this.netInstance.setOptions({
        physics: { enabled: nextPhysics },
      });
    }
    const btn = this.shadowRoot?.getElementById('physics-btn');
    if (btn) {
      btn.textContent = nextPhysics ? 'Physics: ON' : 'Physics: OFF';
    }
  }

  /**
   * Captures the current canvas as a PNG image and triggers a browser download.
   */
  public downloadImage() {
    if (this.netInstance) {
      const container = this.shadowRoot?.getElementById('vis');
      const canvas = container?.querySelector('canvas');
      if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'exba-vis-network-mindmap.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  /**
   * Renders the mindmap container, toolbar, and selection info bar.
   */
  render() {
    return `
      <div class="container">
        <header class="header">
          <div>
            <h1 class="title">Vis-network Mindmap</h1>
            <p class="subtitle">Physics-simulated bouncy layout of EXBA Architecture</p>
          </div>
          <div style="font-size: 0.8125rem; color: ${t.zinc500};">Vis-network rendering</div>
        </header>

        <div class="canvas-card">
          <div class="toolbar">
            <button class="btn" onclick="this.getRootNode().host.resetView()">Reset View</button>
            <button class="btn" id="physics-btn" onclick="this.getRootNode().host.togglePhysics()">Physics: ON</button>
            <button class="btn" onclick="this.getRootNode().host.downloadImage()">Export PNG</button>
          </div>

          <div id="vis"></div>

          <div class="info-bar">
            Selected Node: <strong style="color: ${t.indigo300};" id="selected-node">None</strong>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-mindmap-vis', MindmapVisComponent);
