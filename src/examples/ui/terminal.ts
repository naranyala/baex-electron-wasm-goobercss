import { ExbaComponent, type ComponentProps } from '../../framework/core/component';
import { t } from '../../app/styles';

/**
 * A terminal emulator UI component.
 * Provides a monospace-styled shell environment simulation.
 * Supports session identification via properties.
 */
export class TerminalComponent extends ExbaComponent {
  /**
   * Observed properties:
   * - session: A string identifying the current terminal session.
   */
  static props: ComponentProps = {
    session: 'string',
  };

  /** Monospace styles for a realistic CLI appearance. */
  static styles = {
    container: `padding: 2rem; background: ${t.zinc950}; border-radius: 1rem; border: 1px solid ${t.zinc800a}; font-family: 'SF Mono', 'Fira Code', monospace; color: ${t.zinc300}; display: flex; flex-direction: column; height: 400px; box-sizing: border-box;`,
    header: `display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid ${t.zinc800a};`,
    title: `font-size: 0.75rem; color: ${t.zinc500};`,
    controls: 'display: flex; gap: 0.5rem;',
    dot: 'width: 0.75rem; height: 0.75rem; border-radius: 50%;',
    red: 'background: #ff5f56;',
    yellow: 'background: #ffbd2e;',
    green: 'background: #27c93f;',
    output: 'flex: 1; overflow-y: auto; font-size: 0.875rem; line-height: 1.6;',
    line: 'margin-bottom: 0.25rem;',
    prompt: `color: ${t.emerald400}; margin-right: 0.5rem;`,
    cmd: `color: ${t.white};`
  };

  /**
   * Renders the terminal frame and a mocked shell session.
   */
  render() {
    const session = this.state.session || 'bash — 80x24';
    return `
      <div class="container">
        <div class="header">
          <div class="title">${session}</div>
          <div class="controls">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
        </div>
        <div class="output">
          <div class="line"><span class="prompt">user@exba:~$</span> <span class="cmd">ls -la</span></div>
          <div class="line">drwxr-xr-x  2 user user 4096 Jun 9 12:00 .</div>
          <div class="line">drwxr-xr-x 20 user user 4096 Jun 9 11:00 ..</div>
          <div class="line">-rw-r--r--  1 user user  124 Jun 9 12:00 .env</div>
          <div class="line">-rw-r--r--  1 user user 1024 Jun 9 12:00 package.json</div>
          <div class="line"><span class="prompt">user@exba:~$</span> <span class="cmd">npm run dev</span></div>
          <div class="line">Starting dev server on http://localhost:3000...</div>
          <div class="line">Ready in 142ms.</div>
          <div class="line"><span class="prompt">user@exba:~$</span> <span class="cmd">_</span></div>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-terminal', TerminalComponent);
