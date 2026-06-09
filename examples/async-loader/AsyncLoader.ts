import { BaseComponent } from '../../src/renderer/core/ui/BaseComponent';
import { createSignal } from '../../src/renderer/core/reactivity/Reactivity';
import { css } from 'goober';

const styles = css`
  .loader {
    padding: 1rem;
    border: 1px solid #3f3f46;
    border-radius: 0.5rem;
    background: #27272a;
    color: white;
    text-align: center;
  }
  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #6366f1;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-right: 0.5rem;
  }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

export class AsyncLoader extends BaseComponent {
  private loadingSignal = createSignal(false);
  private dataSignal = createSignal<string | null>(null);

  get loading() { return this.loadingSignal.get(); }
  get data() { return this.dataSignal.get(); }

  async fetchData() {
    this.loadingSignal.set(true);
    await new Promise(res => setTimeout(res, 1500));
    this.dataSignal.set("🚀 Data fetched from EXBA API!");
    this.loadingSignal.set(false);
  }

  render() {
    return `
      <style>${styles}</style>
      <div class="loader">
        ${this.loading 
          ? `<div><span class="spinner"></span> Loading...</div>` 
          : `<div>${this.data || 'Ready to fetch'}</div>`
        }
        <button id="fetch-btn" ${this.loading ? 'disabled' : ''} style="margin-top: 1rem">
          ${this.loading ? 'Fetching...' : 'Fetch Data'}
        </button>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadow.getElementById('fetch-btn')?.addEventListener('click', () => this.fetchData());
  }
}

customElements.define('exba-async-loader', AsyncLoader);
