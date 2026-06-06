import { BaseComponent } from '../../src/renderer/framework/BaseComponent';
import { createReactiveState } from '../../src/renderer/framework/ReactiveState';
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
  state = createReactiveState({ loading: false, data: null as string | null }, () => this.update());

  async fetchData() {
    this.state.loading = true;
    // Simulate API call
    await new Promise(res => setTimeout(res, 1500));
    this.state.data = "🚀 Data fetched from BAEX API!";
    this.state.loading = false;
  }

  render() {
    this.shadow.innerHTML = `
      <style>${styles}</style>
      <div class="loader">
        ${this.state.loading 
          ? `<div><span class="spinner"></span> Loading...</div>` 
          : `<div>${this.state.data || 'Ready to fetch'}</div>`
        }
        <button id="fetch-btn" ${this.state.loading ? 'disabled' : ''} style="margin-top: 1rem">
          ${this.state.loading ? 'Fetching...' : 'Fetch Data'}
        </button>
      </div>
    `;

    this.shadow.getElementById('fetch-btn')?.addEventListener('click', () => this.fetchData());
  }
}

customElements.define('baex-async-loader', AsyncLoader);
