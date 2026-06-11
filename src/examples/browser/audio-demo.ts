import { ExbaComponent } from '../../framework/core/component';
import { styles as globalStyles } from '../../app/styles';

/**
 * A demonstration component for the Web Audio API.
 * Allows users to generate a sine wave, control its frequency, and
 * visualize the audio spectrum in real-time using a 2D canvas visualizer.
 */
export class AudioDemo extends ExbaComponent {
  /** Component properties (none). */
  static props = {};

  /** Scoped styles for the visualizer and controls. */
  static styles = {
    container:
      'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 600px; margin: 0 auto;',
    controls: 'display: flex; gap: 1rem; align-items: center;',
    visualizer:
      'width: 100%; height: 150px; background: #000; border-radius: 0.75rem; border: 1px solid #333;',
    btn: 'padding: 0.5rem 1rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white;',
  };

  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;

  /**
   * Renders the visualizer canvas and audio controls.
   */
  render() {
    const styles = (this.constructor as any).styles;
    return `
      <div class="${styles.container}">
        <div class="${globalStyles.viewHeading}">Web Audio API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Generate a sine wave and visualize it in real-time.</p>
        <canvas id="audio-viz" class="${styles.visualizer}"></canvas>
        <div class="${styles.controls}">
          <button id="audio-toggle" class="${styles.btn}">Start Audio</button>
          <input type="range" id="audio-freq" min="200" max="1000" value="440" style="width: 200px;">
          <span id="freq-val">440Hz</span>
        </div>
      </div>
    `;
  }

  /**
   * Wires up event listeners for the audio toggle and frequency slider.
   */
  protected onMount() {
    const btn = this.shadowRoot?.getElementById('audio-toggle');
    const freqInput = this.shadowRoot?.getElementById('audio-freq');
    const freqVal = this.shadowRoot?.getElementById('freq-val');

    btn?.addEventListener('click', () => this.toggleAudio());
    freqInput?.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (freqVal) freqVal.innerText = `${val}Hz`;
      if (this.oscillator)
        this.oscillator.frequency.setValueAtTime(
          Number(val),
          this.audioCtx?.currentTime || 0,
        );
    });
  }

  /**
   * Toggles the audio playback state.
   * Initializes the AudioContext and AnalyserNode on first interaction.
   */
  private toggleAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
    }

    if (this.isPlaying) {
      this.oscillator?.stop();
      this.isPlaying = false;
      const btn = this.shadowRoot?.getElementById('audio-toggle');
      if (btn) btn.innerText = 'Start Audio';
    } else {
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(
        Number(
          (this.shadowRoot?.getElementById('audio-freq') as HTMLInputElement)
            ?.value || 440,
        ),
        this.audioCtx.currentTime,
      );

      this.oscillator.connect(this.analyser!);
      this.analyser!.connect(this.audioCtx.destination);

      this.oscillator.start();
      this.isPlaying = true;
      const btn = this.shadowRoot?.getElementById('audio-toggle');
      if (btn) btn.innerText = 'Stop Audio';
      this.draw();
    }
  }

  /**
   * Animation loop to render frequency data to the visualizer canvas.
   */
  private draw() {
    if (!this.isPlaying || !this.analyser) return;

    const canvas = this.shadowRoot?.getElementById(
      'audio-viz',
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const renderFrame = () => {
      if (!this.isPlaying) return;
      this.analyser?.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#6366f1';

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      requestAnimationFrame(renderFrame);
    };
    renderFrame();
  }
}

customElements.define('exba-audio-demo', AudioDemo);
