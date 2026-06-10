import { ExbaComponent, type ComponentProps } from '../../framework/core/component';
import { html } from '../../framework/core/dom';

export class ExbaGreeting extends ExbaComponent {
  static props: ComponentProps = {
    name: 'string',
  };

  static styles = {
    container: `font-family: system-ui, sans-serif; padding: 1rem 1.5rem; background: rgba(39, 39, 42, 0.5); color: #a5b4fc; border-radius: 0.75rem; border: 1px solid rgba(39, 39, 42, 0.5); display: inline-block; font-size: 0.875rem;`,
    highlight: `color: #818cf8; font-weight: 600;`
  };

  render() {
    const name = this.state.name || 'Guest';
    return html`
      <div class="container">
        Hello, <span class="highlight">${name}</span>! Welcome to EXBA Framework.
      </div>
    `;
  }
}
