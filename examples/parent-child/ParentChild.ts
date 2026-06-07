import { BaseComponent } from '../../src/renderer/framework/BaseComponent';
import { css } from 'goober';

const styles = css`
  .parent {
    padding: 1rem;
    border: 2px solid #6366f1;
    border-radius: 0.5rem;
    background: #18181b;
    color: white;
  }
  .child {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px dashed #3f3f46;
    color: #a1a1aa;
  }
`;

class ChildComponent extends BaseComponent {
  render() {
    return `
      <style>${styles}</style>
      <div class="child">
        I am the child. I can emit events!
        <button id="msg-btn">Send Message to Parent</button>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadow.getElementById('msg-btn')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('child-message', {
        detail: 'Hello from Child!',
        bubbles: true,
        composed: true
      }));
    });
  }
}

export class ParentComponent extends BaseComponent {
  message = 'No message yet';

  render() {
    return `
      <style>${styles}</style>
      <div class="parent">
        <h3>Parent Component</h3>
        <p>Child says: <strong>${this.message}</strong></p>
        <baex-child></baex-child>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadow.addEventListener('child-message', (e: any) => {
      this.message = e.detail;
      this.update();
    });
  }
}

customElements.define('baex-child', ChildComponent);
customElements.define('baex-parent', ParentComponent);
