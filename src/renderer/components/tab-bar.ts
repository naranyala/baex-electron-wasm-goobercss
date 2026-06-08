// src/components/tab-bar.ts
class TabBar extends HTMLElement {
  private tabs: Array<{ id: string; label: string }> = [];
  private activeTabId: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() { return ['tabs']; }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (name === 'tabs' && newValue) {
      this.tabs = JSON.parse(newValue);
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;
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
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3rem 0.5rem;
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
        .tab-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1rem;
          height: 1rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          line-height: 1;
          cursor: pointer;
          opacity: 0.5;
          transition: all 0.12s ease;
        }
        .tab-close:hover {
          opacity: 1;
          background: rgba(255,255,255,0.1);
        }
      </style>
      ${this.tabs.map(tab => `
        <div class="tab ${tab.id === this.activeTabId ? 'active' : ''}" data-id="${tab.id}">
          <span class="tab-label">${tab.label}</span>
          <span class="tab-close" data-close-id="${tab.id}">&times;</span>
        </div>
      `).join('')}
    `;
    this.shadowRoot.querySelectorAll('.tab').forEach(el => {
      el.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('tab-close')) return;
        this.dispatchEvent(new CustomEvent('tab-selected', { detail: (el as HTMLElement).dataset.id }));
      });
    });
    this.shadowRoot.querySelectorAll('.tab-close').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('tab-close', { detail: (el as HTMLElement).dataset.closeId }));
      });
    });
  }

  setActive(id: string) {
    this.activeTabId = id;
    this.render();
  }
}

customElements.define('tab-bar', TabBar);
