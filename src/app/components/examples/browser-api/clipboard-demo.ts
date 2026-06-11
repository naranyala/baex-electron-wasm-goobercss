import { ExbaComponent } from '../../../../framework/core/component';
import { styles as globalStyles } from '../../../styles';

/**
 * A demonstration component for the Clipboard API.
 * Allows users to copy text to the clipboard and read from it.
 */
export class ClipboardDemo extends ExbaComponent {
  static props = {};

  static styles = {
    container: 'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 600px; margin: 0 auto;',
    inputGroup: 'display: flex; gap: 0.5rem; width: 100%;',
    input: 'flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #333; background: #18181b; color: white;',
    btn: 'padding: 0.75rem 1.5rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white; font-weight: 600;',
    result: 'width: 100%; padding: 1.5rem; background: #18181b; border: 1px solid #333; border-radius: 0.75rem; min-height: 100px; word-break: break-all; color: #818cf8; font-family: monospace;'
  };

  /**
   * Renders the copy/paste controls and a result area.
   */
  render() {
    const styles = (this.constructor as any).styles;
    
    return `
      <div class="${styles.container}">
        <div class="${globalStyles.viewHeading}">Clipboard API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Interact with the system clipboard securely.</p>
        
        <div class="${styles.inputGroup}">
          <input type="text" id="copy-input" class="${styles.input}" placeholder="Type something to copy...">
          <button id="copy-btn" class="${styles.btn}">Copy</button>
        </div>

        <button id="paste-btn" class="${styles.btn}" style="width: 100%;">Read from Clipboard</button>

        <div id="clipboard-result" class="${styles.result}">
          Clipboard content will appear here...
        </div>
      </div>
    `;
  }

  protected onMount() {
    const copyBtn = this.shadowRoot?.getElementById('copy-btn');
    const pasteBtn = this.shadowRoot?.getElementById('paste-btn');
    const input = this.shadowRoot?.getElementById('copy-input') as HTMLInputElement;
    const result = this.shadowRoot?.getElementById('clipboard-result');

    copyBtn?.addEventListener('click', async () => {
      if (input.value) {
        await navigator.clipboard.writeText(input.value);
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
      }
    });

    pasteBtn?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (result) result.innerText = text || 'Clipboard is empty';
      } catch (err) {
        alert('Failed to read clipboard. Make sure you granted permission.');
      }
    });
  }
}

customElements.define('exba-clipboard-demo', ClipboardDemo);
