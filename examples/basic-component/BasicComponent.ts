import { BaseComponent } from '../../src/renderer/core/ui/BaseComponent';
import { css, html } from 'goober';

const styles = css`
  .card {
    padding: 1rem;
    border: 1px solid #3f3f46;
    border-radius: 0.5rem;
    background: #27272a;
    color: white;
    font-family: sans-serif;
  }
  h1 { color: #6366f1; }
`;

export class BasicComponent extends BaseComponent {
  render() {
    return `
      <style>${styles}</style>
      <div class="card">
        <h1>Hello EXBA!</h1>
        <p>This is a basic component extending BaseComponent.</p>
      </div>
    `;
  }
}

customElements.define('exba-basic-component', BasicComponent);
