class TabBar extends HTMLElement {
  private _tabs: Array<{ id: string; label: string }> = [];
  private _activeId: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  static get observedAttributes() { return ['tabs', 'active']; }

  attributeChangedCallback(name: string, _old: string | null, val: string | null) {
    if (val === null) return;
    if (name === 'tabs') this._tabs = JSON.parse(val);
    if (name === 'active') this._activeId = val;
    this._render();
  }

  private _render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          min-width: 0;
          flex: 1;
          -webkit-app-region: no-drag;
        }
        .bar {
          display: flex;
          min-width: 0;
          flex: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .bar::-webkit-scrollbar { display: none; }
        button {
          flex: none;
          width: 150px;
          height: 100%;
          border: none;
          background: transparent;
          color: #71717a;
          font-size: 12px;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          cursor: pointer;
          user-select: none;
          padding: 16px 12px;
          transition: background 0.12s, color 0.12s;
          -webkit-app-region: no-drag;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        button:hover {
          color: #d4d4d8;
          background: rgba(255,255,255,0.04);
        }
        button.active {
          color: #fafafa;
          background: rgba(255,255,255,0.07);
        }
        .label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
        }
        .close {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 3px;
          font-size: 14px;
          line-height: 1;
          color: inherit;
          opacity: 0.5;
          transition: opacity 0.1s, background 0.1s;
          margin: 0 -2px;
        }
        .close:hover { opacity: 1; background: rgba(255,255,255,0.1); }
      </style>
      <div class="bar">
        ${this._tabs.map(t => `
          <button class="${t.id === this._activeId ? 'active' : ''}" data-id="${t.id}">
            <span class="label">${t.label}</span>
            ${t.id !== 'home' ? `<span class="close" data-close="${t.id}">&times;</span>` : ''}
          </button>
        `).join('')}
      </div>
    `;

    this.shadowRoot!.querySelectorAll('button').forEach(el => {
      el.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.dataset.close) {
          this.dispatchEvent(new CustomEvent('tab-close', {
            detail: target.dataset.close,
            bubbles: true,
            composed: true,
          }));
          return;
        }
        const id = (el as HTMLElement).dataset.id;
        if (id) {
          this.dispatchEvent(new CustomEvent('tab-click', {
            detail: id,
            bubbles: true,
            composed: true,
          }));
        }
      });
    });
  }
}

customElements.define('tab-bar', TabBar);
