import { ExbaComponent, type ComponentProps } from '../../../kernel/core/component';
import { html } from '../../../kernel/core/dom';

/**
 * A simple greeting component that demonstrates property binding.
 * Accepts a 'name' attribute and renders a welcoming message with 
 * reactive styling.
 */
export class ExbaGreeting extends ExbaComponent {
  /**
   * Observed properties:
   * - name: The user's name to display in the greeting.
   */
  static props: ComponentProps = {
    name: 'string',
  };

  /** Scoped styles for the greeting container and name highlight. */
  static styles = {
    container: `font-family: system-ui, sans-serif; padding: 1rem 1.5rem; background: rgba(39, 39, 42, 0.5); color: #a5b4fc; border-radius: 0.75rem; border: 1px solid rgba(39, 39, 42, 0.5); display: inline-block; font-size: 0.875rem;`,
    highlight: `color: #818cf8; font-weight: 600;`
  };

  /**
   * Renders the greeting message using the `name` property or a default fallback.
   */
  render() {
    const name = this.state.name || 'Guest';
    return html`
      <div class="container">
        Hello, <span class="highlight">${name}</span>! Welcome to EXBA Framework.
      </div>
    `;
  }
}
