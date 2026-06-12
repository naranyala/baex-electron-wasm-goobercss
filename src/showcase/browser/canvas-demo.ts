import { ExbaComponent } from '../../kernel/core/component';
import { styles as globalStyles } from '../../shell/styles';

/**
 * A demonstration component for the HTML5 Canvas 2D API.
 * Provides an interactive drawing board with customizable brush size 
 * and color selection.
 */
export class CanvasDemo extends ExbaComponent {
  /** Component properties (none). */
  static props = {};

  /** Scoped styles for the drawing canvas and toolbar. */
  static styles = {
    container:
      'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 800px; margin: 0 auto;',
    canvas:
      'background: #000; border-radius: 0.75rem; cursor: crosshair; border: 1px solid #333;',
    toolbar: 'display: flex; gap: 1rem; align-items: center;',
    btn: 'padding: 0.5rem 1rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white;',
  };

  private isDrawing = false;

  /**
   * Renders the drawing canvas and the brush customization toolbar.
   */
  render() {
    const styles = (this.constructor as any).styles;
    return `
      <div class="${styles.container}">
        <div class="${globalStyles.viewHeading}">Canvas 2D API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Interactive drawing board. Draw something!</p>
        <canvas id="draw-canvas" width="600" height="400" class="${styles.canvas}"></canvas>
        <div class="${styles.toolbar}">
          <input type="color" id="color-picker" value="#6366f1">
          <input type="range" id="brush-size" min="1" max="20" value="5">
          <button id="clear-canvas" class="${styles.btn}">Clear</button>
        </div>
      </div>
    `;
  }

  /**
   * Initializes the canvas context and attaches mouse event listeners
   * for the drawing interactions.
   */
  protected onMount() {
    const canvas = this.shadowRoot?.getElementById(
      'draw-canvas',
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const colorPicker = this.shadowRoot?.getElementById(
      'color-picker',
    ) as HTMLInputElement;
    const brushSize = this.shadowRoot?.getElementById(
      'brush-size',
    ) as HTMLInputElement;
    const clearBtn = this.shadowRoot?.getElementById('clear-canvas');

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const startDraw = (e: MouseEvent) => {
      this.isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    const draw = (e: MouseEvent) => {
      if (!this.isDrawing) return;
      ctx.strokeStyle = colorPicker?.value || '#6366f1';
      ctx.lineWidth = Number(brushSize?.value || 5);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    clearBtn?.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }
}

customElements.define('exba-canvas-demo', CanvasDemo);
