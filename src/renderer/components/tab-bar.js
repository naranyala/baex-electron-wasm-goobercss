// src/components/tab-bar.js
class TabBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.tabs = [];
    this.activeTabId = null;
    this.render();
  }

  static get observedAttributes() { return ['tabs']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'tabs') {
      this.tabs = JSON.parse(newValue);
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
         :host {
           display: flex;
           gap: 0.375rem;
           padding: 0.375rem;
           background-color: transparent;
           overflow-x: auto;
           box-sizing: border-box;
           -webkit-app-region: no-drag;
         }

        .tab {
          padding: 0.3rem 0.75rem;
          font-size: 0.8125rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.15s ease;
          color: #a1a1aa;
          background: transparent;
          white-space: nowrap;
          border: 1px solid transparent;
          font-weight: 450;
        }
        .tab.active {
          background: #1f1f23;
          color: #f4f4f5;
          border-color: #2a2a30;
        }
        .tab:hover {
          color: #f4f4f5;
          background: rgba(255,255,255,0.04);
        }
      </style>
      ${this.tabs.map(tab => `
        <div class="tab ${tab.id === this.activeTabId ? 'active' : ''}" data-id="${tab.id}">
          ${tab.label}
        </div>
      `).join('')}
    `;
    this.shadowRoot.querySelectorAll('.tab').forEach(el => {
      el.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('tab-selected', { detail: el.dataset.id }));
      });
    });
  }

  setActive(id) {
    this.activeTabId = id;
    this.render();
  }
}

customElements.define('tab-bar', TabBar);
