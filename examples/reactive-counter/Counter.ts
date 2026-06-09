import { BaseComponent } from '../../src/renderer/core/ui/BaseComponent';
import { createSignal } from '../../src/renderer/core/reactivity/Reactivity';
import { css } from 'goober';

const styles = css`
  .counter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #3f3f46;
    border-radius: 0.5rem;
    background: #27272a;
    color: white;
  }
  .count { font-size: 2rem; font-weight: bold; }
  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 0.25rem;
  }
`;

export class ReactiveCounter extends BaseComponent {
  private countSignal = createSignal(0);

  get count() { return this.countSignal.get(); }

  render() {
    return `
      <style>${styles}</style>
      <div class="counter">
        <div class="count">${this.count}</div>
        <button id="inc">Increment</button>
        <button id="dec">Decrement</button>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadow.getElementById('inc')?.addEventListener('click', () => this.countSignal.set(this.count + 1));
    this.shadow.getElementById('dec')?.addEventListener('click', () => this.countSignal.set(this.count - 1));
  }
}

customElements.define('exba-reactive-counter', ReactiveCounter);
