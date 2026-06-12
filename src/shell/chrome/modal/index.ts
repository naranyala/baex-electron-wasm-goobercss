import { ExbaComponent } from '../../../kernel/core/component';

/**
 * A modal overlay component for inspecting WASM IR layers.
 * Part of the EXBA DevTools suite. Displays current status and 
 * information for HLIR and LLIR processing.
 */
export class WasmModal extends ExbaComponent {
  /** Scoped styles for the fixed backdrop and centered modal dialog. */
  static styles = {
    backdrop: `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;`,
    modal: `background: #18181b; border: 1px solid rgba(39, 39, 42, 0.5); border-radius: 0.75rem; width: 100%; max-width: 560px; padding: 1.5rem; color: #e4e4e7; font-family: inherit;`,
    heading: `margin: 0 0 1rem 0; color: #a5b4fc; font-size: 1.125rem; font-weight: 600;`,
    layer: `background: rgba(39, 39, 42, 0.5); padding: 1rem; margin-bottom: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(39, 39, 42, 0.5); &:last-child { margin-bottom: 0; }`,
    name: `font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;`,
    info: `font-size: 0.8125rem; color: #71717a;`,
    status: `float: right; font-size: 0.6875rem; padding: 0.15rem 0.5rem; border-radius: 1rem; background: rgba(79, 70, 229, 0.15); color: #a5b4fc;`
  };

  /**
   * Renders the DevTools information for HLIR and LLIR layers.
   */
  render() {
    const irLayers = [
      { name: 'HLIR', status: 'Active', info: 'High-level IR Analysis' },
      {
        name: 'LLIR',
        status: 'Dispatched',
        info: 'Low-level IR Instruction set',
      },
    ];

    return `
      <div class="backdrop" id="modal-backdrop">
        <div class="modal">
          <h2 class="heading">EXBA DevTools — IR Layers</h2>
          ${irLayers
            .map(
              (l) => `
            <div class="layer">
              <span class="status">${l.status}</span>
              <div class="name">${l.name}</div>
              <div class="info">${l.info}</div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  /**
   * Attaches a click listener to the backdrop to support 'click-to-dismiss' behavior.
   */
  connectedCallback() {
    super.connectedCallback();
    const backdrop = this.shadowRoot?.getElementById('modal-backdrop');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.remove();
    });
  }
}

customElements.define('wasm-modal', WasmModal);
