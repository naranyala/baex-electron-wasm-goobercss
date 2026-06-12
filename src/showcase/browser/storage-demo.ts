import { ExbaComponent } from '../../kernel/core/component';
import { styles as globalStyles } from '../../shell/styles';

/**
 * A demonstration component for the Web Storage API (LocalStorage).
 * Provides a CRUD interface for managing key-value pairs stored in 
 * the browser's persistent storage.
 */
export class StorageDemo extends ExbaComponent {
  /** Component properties (none). */
  static props = {};

  /** Scoped styles for the storage form, input fields, and item list. */
  static styles = {
    container:
      'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 600px; margin: 0 auto;',
    form: 'display: flex; gap: 0.5rem; width: 100%;',
    input:
      'flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #333; background: #18181b; color: white;',
    btn: 'padding: 0.5rem 1rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white;',
    list: 'width: 100%; border: 1px solid #333; border-radius: 0.75rem; overflow: hidden;',
    item: 'display: flex; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #333; background: #09090b;',
    delBtn: 'color: #ef4444; cursor: pointer; font-weight: bold;',
  };

  /**
   * Renders the data entry form and the container for the stored items list.
   */
  render() {
    const styles = (this.constructor as any).styles;
    return `
      <div class="${styles.container}">
        <div class="${globalStyles.viewHeading}">Web Storage API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Manage data in your browser's LocalStorage.</p>
        <div class="${styles.form}">
          <input type="text" id="storage-key" class="${styles.input}" placeholder="Key">
          <input type="text" id="storage-val" class="${styles.input}" placeholder="Value">
          <button id="storage-save" class="${styles.btn}">Save</button>
        </div>
        <div id="storage-list" class="${styles.list}"></div>
      </div>
    `;
  }

  /**
   * Initializes the list display and attaches listeners for the 'Save' action.
   */
  protected onMount() {
    this.refreshList();

    const saveBtn = this.shadowRoot?.getElementById('storage-save');
    saveBtn?.addEventListener('click', () => {
      const key = (
        this.shadowRoot?.getElementById('storage-key') as HTMLInputElement
      )?.value;
      const val = (
        this.shadowRoot?.getElementById('storage-val') as HTMLInputElement
      )?.value;
      if (key) {
        localStorage.setItem(key, val || '');
        this.refreshList();
        const keyEl = this.shadowRoot?.getElementById(
          'storage-key',
        ) as HTMLInputElement;
        const valEl = this.shadowRoot?.getElementById(
          'storage-val',
        ) as HTMLInputElement;
        if (keyEl) keyEl.value = '';
        if (valEl) valEl.value = '';
      }
    });
  }

  /**
   * Synchronizes the UI list with the current contents of LocalStorage.
   * Dynamically injects item elements and attaches individual deletion listeners.
   */
  private refreshList() {
    const styles = (this.constructor as any).styles;
    const listEl = this.shadowRoot?.getElementById('storage-list');
    if (!listEl) return;

    const items = Object.keys(localStorage)
      .map(
        (key) => `
      <div class="${styles.item}">
        <span><strong>${key}</strong>: ${localStorage.getItem(key)}</span>
        <span class="${styles.delBtn}" data-key="${key}">✕</span>
      </div>
    `,
      )
      .join('');

    listEl.innerHTML =
      items ||
      '<div style="padding: 1rem; text-align: center; color: #71717a;">No data stored</div>';

    listEl
      .querySelectorAll(`.${styles.delBtn}`)
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-key');
          if (key) {
            localStorage.removeItem(key);
            this.refreshList();
          }
        });
      });
  }
}

customElements.define('exba-storage-demo', StorageDemo);
