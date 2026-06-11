import { ExbaComponent } from '../../../framework/core/component';
import { EXBA } from '../../../framework/core/exba';
import { html } from '../../../framework/core/dom';
import { t } from '../../styles';

const ASCII_LOGO = `
       .---.
      /     \\
      |() ()|
       \\  ^  /
        |||||
        |||||
`;

/**
 * A system information display component styled after the classic 'neofetch' CLI tool.
 * Asynchronously retrieves system hardware and runtime data from the WASM core
 * and presents it alongside a custom ASCII art logo.
 */
export class NeofetchComponent extends ExbaComponent {
  /** Uses Shadow DOM for monospace font and layout isolation. */
  static useShadow = true;
  /** Scoped styles for the terminal-like card and color blocks. */
  static styles = {
    container: 'padding: 2rem; color: ${t.zinc100}; font-family: "SF Mono", "Fira Code", monospace; display: flex; justify-content: center; align-items: center; min-height: 400px;',
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1rem; padding: 2rem; display: flex; gap: 2rem; max-width: 800px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);`,
    ascii: `color: ${t.indigo400}; font-size: 0.75rem; line-height: 1.2; white-space: pre;`,
    infoList: 'display: flex; flex-direction: column; gap: 0.5rem;',
    infoItem: 'font-size: 0.9375rem;',
    label: `color: ${t.indigo300}; font-weight: 700; margin-right: 0.5rem;`,
    value: `color: ${t.zinc300};`,
    divider: `color: ${t.zinc500}; margin: 0.25rem 0;`,
    userHost: 'font-size: 1.125rem; font-weight: 700; margin-bottom: 0.25rem;',
    user: `color: ${t.indigo400};`,
    host: `color: ${t.indigo300};`,
    colorBlocks: 'display: flex; gap: 0.25rem; margin-top: 1rem;',
    block: 'width: 1.25rem; height: 1.25rem;'
  };

  /**
   * Triggers a 'SystemFetch' IR command to Rust to retrieve machine specifications.
   */
  protected async onMount() {
    try {
      const info = await EXBA.api.process_ir(JSON.stringify({
        type: 'SystemFetch',
        payload: null
      }));
      
      if (info.type === 'SystemInfo') {
        this.setState({ sysInfo: info.payload });
      }
    } catch (e) {
      console.error('Failed to fetch system info', e);
    }
  }

  /**
   * Renders the system information list, ASCII logo, and color test blocks.
   */
  render() {
    const info = this.state.sysInfo;
    if (!info) return html`<div class="container">Gathering system information...</div>`;

    const colors = [
        t.zinc800, t.red600, t.emerald600, t.indigo600, 
        t.indigo400, t.emerald400, t.zinc400, t.white
    ];

    return html`
      <div class="container">
        <div class="card">
          <div class="ascii">${ASCII_LOGO}</div>
          <div class="infoList">
            <div class="userHost">
              <span class="user">visitor</span>@<span class="host">exba-web</span>
            </div>
            <div class="divider">-----------------</div>
            <div class="infoItem"><span class="label">OS:</span><span class="value">${info.os}</span></div>
            <div class="infoItem"><span class="label">Browser:</span><span class="value">${info.browser}</span></div>
            <div class="infoItem"><span class="label">CPU:</span><span class="value">${info.cpu_cores} Cores</span></div>
            <div class="infoItem"><span class="label">Memory:</span><span class="value">${info.ram_gb > 0 ? info.ram_gb + ' GB' : 'Unknown'}</span></div>
            <div class="infoItem"><span class="label">Resolution:</span><span class="value">${info.screen_res}</span></div>
            <div class="infoItem"><span class="label">GPU:</span><span class="value">${info.gpu}</span></div>
            <div class="infoItem"><span class="label">Uptime:</span><span class="value">${(info.uptime_ms / 1000).toFixed(2)}s</span></div>
            <div class="infoItem"><span class="label">Language:</span><span class="value">${info.language}</span></div>
            
            <div class="colorBlocks">
              ${colors.map(c => html`<div class="block" style="background: ${c}"></div>`)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-neofetch', NeofetchComponent);
