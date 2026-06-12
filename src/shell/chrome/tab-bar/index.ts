import { ease, t } from '../../styles';

const styles = `
  :host {
    display: block;
  }
  .host {
    display: flex;
    gap: 0.25rem;
    padding: 0 0.5rem;
    background: ${t.zinc950};
    border-bottom: 1px solid ${t.zinc800a};
    overflow-x: auto;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3rem;
    z-index: 50;
    box-sizing: border-box;
    align-items: center;
  }
  .tab {
    display: flex;
    align-items: center;
    padding: 0 0.5rem 0 0.75rem;
    font-size: 0.8125rem;
    font-family: inherit;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background ${ease}, color ${ease};
    color: ${t.zinc400};
    background: transparent;
    white-space: nowrap;
    user-select: none;
    height: 2rem;
    margin: 0.5rem 0;
    gap: 0.5rem;
  }
  .tab:hover:not(.active) {
    background: ${t.zinc800a};
    color: ${t.zinc200};
  }
  .tab.active {
    background: ${t.indigo600a};
    color: ${t.indigo300};
  }
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: ${t.zinc500};
    transition: all ${ease};
  }
  .close-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }
  .home-button {
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    font-size: 0.8125rem;
    font-family: inherit;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background ${ease};
    color: ${t.white};
    background: ${t.indigo600};
    margin-right: 0.5rem;
    white-space: nowrap;
    user-select: none;
    height: 2rem;
    margin: 0.5rem 0;
  }
  .home-button:hover {
    background: ${t.indigo500};
  }
`;

/**
 * A specialized tab bar component for workspace navigation.
 * Manages a dynamic list of open tabs and a persistent 'Home' button.
 * Emits 'tab-selected' and 'tab-closed' events for the application shell to handle.
 */
export class TabBar extends HTMLElement {
  private tabs: { id: string; label: string }[] = [];
  private activeTabId: string | null = null;

  /**
   * Initializes the tab bar and attaches the shadow root.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  /**
   * Observed attributes:
   * - tabs: A JSON-encoded array of { id, label } objects.
   */
  static get observedAttributes() {
    return ['tabs'];
  }

  /**
   * Automatically parses the 'tabs' attribute and re-renders the component.
   */
  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'tabs') {
      try {
        this.tabs = JSON.parse(newValue);
      } catch (e) {
        console.error('Invalid tabs attribute', e);
      }
      this.render();
    }
  }

  /**
   * Renders the tab bar HTML structure, including the home button and dynamic tab list.
   * Also wires up click event listeners for selection and closure.
   */
  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="host">
        <div class="home-button" data-id="home">🏠 Home</div>
        ${this.tabs
          .map(
            (t) => `
          <div class="tab ${t.id === this.activeTabId ? 'active' : ''}" data-id="${t.id}">
            <span>${t.label}</span>
            <div class="close-btn" data-close="${t.id}">✕</div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;

    this.shadowRoot.querySelector('.home-button')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('tab-selected', { detail: 'home', bubbles: true, composed: true }));
    });

    this.shadowRoot.querySelectorAll('.tab').forEach((el) => {
      el.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('close-btn')) {
          e.stopPropagation();
          this.dispatchEvent(
            new CustomEvent('tab-closed', {
              detail: target.dataset.close,
              bubbles: true,
              composed: true,
            }),
          );
          return;
        }
        this.dispatchEvent(
          new CustomEvent('tab-selected', {
            detail: (el as HTMLElement).dataset.id,
            bubbles: true,
            composed: true,
          }),
        );
      });
    });
  }

  /**
   * Updates the active tab state and triggers a re-render.
   * @param id The ID of the tab to mark as active, or null for none.
   */
  setActive(id: string | null) {
    this.activeTabId = id;
    this.render();
  }
}

customElements.define('tab-bar', TabBar);
