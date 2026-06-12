import { ExbaComponent } from '../../kernel/core/component';
import { styles as globalStyles } from '../../shell/styles';

/**
 * A demonstration component for the Fullscreen API.
 * Allows users to toggle the application or specific elements into fullscreen mode.
 */
export class FullscreenDemo extends ExbaComponent {
  static props = {};

  static styles = {
    container: 'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 600px; margin: 0 auto;',
    box: 'width: 300px; height: 200px; background: #18181b; border: 2px solid #333; border-radius: 1rem; display: flex; align-items: center; justify-content: center; color: #6366f1; font-weight: 700; font-size: 1.5rem;',
    btn: 'padding: 0.75rem 1.5rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white; font-weight: 600;'
  };

  /**
   * Renders the toggle buttons and a target box for element-level fullscreen.
   */
  render() {
    const styles = (this.constructor as any).styles;
    const isFullscreen = !!document.fullscreenElement;

    return `
      <div class="${styles.container}">
        <div class="${globalStyles.viewHeading}">Fullscreen API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Toggle the browser window or specific elements into fullscreen mode.</p>
        
        <div id="target-box" class="${styles.box}">
          TARGET BOX
        </div>

        <div style="display: flex; gap: 1rem;">
          <button id="toggle-app" class="${styles.btn}">
            ${isFullscreen ? 'Exit App Fullscreen' : 'App Fullscreen'}
          </button>
          <button id="toggle-box" class="${styles.btn}">
            Box Fullscreen
          </button>
        </div>
      </div>
    `;
  }

  protected onMount() {
    this.shadowRoot?.getElementById('toggle-app')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    this.shadowRoot?.getElementById('toggle-box')?.addEventListener('click', () => {
      const box = this.shadowRoot?.getElementById('target-box');
      box?.requestFullscreen();
    });

    document.addEventListener('fullscreenchange', () => this.safeUpdate());
  }
}

customElements.define('exba-fullscreen-demo', FullscreenDemo);
