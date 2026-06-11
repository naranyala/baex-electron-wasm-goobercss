import { ExbaComponent } from '../../framework/core/component';
import { t } from '../../app/styles';
import WaveSurfer from 'wavesurfer.js';

const STYLES = `
  .container {
    padding: 2rem;
    color: ${t.zinc100};
    font-family: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }
  .title {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${t.zinc200};
    margin-bottom: 2rem;
    align-self: flex-start;
  }
  .player-card {
    background: ${t.zinc800};
    border: 1px solid ${t.zinc700};
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-sizing: border-box;
  }
  .track-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .track-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${t.zinc100};
  }
  .track-artist {
    font-size: 0.875rem;
    color: ${t.zinc400};
  }
  .visualizer-select {
    background: ${t.zinc700};
    color: ${t.zinc200};
    border: 1px solid ${t.zinc600};
    padding: 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
  }
  .track-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .track-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${t.zinc100};
  }
  .track-artist {
    font-size: 0.875rem;
    color: ${t.zinc400};
  }
  .controls-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }
  .file-input {
    display: none;
  }
  .file-btn {
    background: ${t.zinc700};
    color: ${t.zinc200};
    border: 1px solid ${t.zinc600};
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .file-btn:hover {
    background: ${t.zinc600};
  }
  .waveform-container {
    width: 100%;
    border-radius: 0.5rem;
    overflow: hidden;
    background: ${t.zinc900};
    padding: 1rem;
    box-sizing: border-box;
    border: 1px inset ${t.zinc800};
  }
  #waveform {
    width: 100%;
  }
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  .btn {
    background: ${t.indigo600};
    color: white;
    border: none;
    border-radius: 9999px;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }
  .btn:hover {
    background: ${t.indigo500};
  }
  .btn:active {
    transform: scale(0.95);
  }
  .btn svg {
    width: 1.5rem;
    height: 1.5rem;
    fill: currentColor;
  }
  .time-display {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: ${t.zinc400};
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
`;

export class AudioWaveformComponent extends ExbaComponent {
  static styles = STYLES;
  private wavesurfer: WaveSurfer | null = null;
  private isPlaying = false;
  private currentObjectUrl: string | null = null;
  private currentStyle = 'bars';

  render() {
    return `
      <div class="container">
        <div class="title">Waveform Audio Player</div>
        <div class="player-card">
          <div class="track-info">
            <div class="track-title" id="track-title">Ambient Lo-Fi Loop</div>
            <div class="track-artist">System Demonstration</div>
            <div class="controls-wrapper">
              <label for="audio-upload" class="file-btn">Choose Audio File</label>
              <input type="file" id="audio-upload" class="file-input" accept="audio/*" />
              
              <select id="style-select" class="visualizer-select">
                <option value="bars">Bars</option>
                <option value="line">Line</option>
              </select>
            </div>
          </div>
          
          <div class="waveform-container">
             <div id="waveform"></div>
             <div class="time-display">
                <span id="time-current">0:00</span>
                <span id="time-total">0:00</span>
             </div>
          </div>

          <div class="controls">
            <button id="btn-play-pause" class="btn" aria-label="Play/Pause">
              <svg id="icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg id="icon-pause" viewBox="0 0 24 24" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  protected onMount() {
    setTimeout(() => this.initWaveSurfer(), 0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
      this.wavesurfer = null;
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }
  }

  private getWaveSurferOptions(container: HTMLElement) {
    const isBars = this.currentStyle === 'bars';
    return {
      container,
      waveColor: t.zinc500,
      progressColor: t.indigo400,
      cursorColor: t.indigo300,
      barWidth: isBars ? 3 : 0,
      barGap: isBars ? 3 : 0,
      barRadius: isBars ? 3 : 0,
      height: 80,
      normalize: true,
      url: this.currentObjectUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    };
  }

  private initWaveSurfer() {
    const container = this.shadowRoot?.querySelector('#waveform') as HTMLElement;
    const playPauseBtn = this.shadowRoot?.querySelector('#btn-play-pause') as HTMLButtonElement;
    const iconPlay = this.shadowRoot?.querySelector('#icon-play') as HTMLElement;
    const iconPause = this.shadowRoot?.querySelector('#icon-pause') as HTMLElement;
    const timeCurrent = this.shadowRoot?.querySelector('#time-current') as HTMLElement;
    const timeTotal = this.shadowRoot?.querySelector('#time-total') as HTMLElement;
    const fileInput = this.shadowRoot?.querySelector('#audio-upload') as HTMLInputElement;
    const styleSelect = this.shadowRoot?.querySelector('#style-select') as HTMLSelectElement;
    const trackTitle = this.shadowRoot?.querySelector('#track-title') as HTMLElement;

    if (!container || !playPauseBtn || !fileInput || !styleSelect) return;

    this.wavesurfer = WaveSurfer.create(this.getWaveSurferOptions(container));

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    this.wavesurfer.on('ready', (duration) => {
      timeTotal.textContent = formatTime(duration);
    });

    this.wavesurfer.on('timeupdate', (currentTime) => {
      timeCurrent.textContent = formatTime(currentTime);
    });

    this.wavesurfer.on('finish', () => {
      this.isPlaying = false;
      this.updatePlayIcon(iconPlay, iconPause);
    });

    playPauseBtn.addEventListener('click', () => {
      if (this.wavesurfer) {
        this.wavesurfer.playPause();
        this.isPlaying = !this.isPlaying;
        this.updatePlayIcon(iconPlay, iconPause);
      }
    });

    fileInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && this.wavesurfer) {
        if (this.currentObjectUrl) {
          URL.revokeObjectURL(this.currentObjectUrl);
        }
        
        this.isPlaying = false;
        this.updatePlayIcon(iconPlay, iconPause);
        
        this.currentObjectUrl = URL.createObjectURL(file);
        trackTitle.textContent = file.name;
        this.wavesurfer.load(this.currentObjectUrl);
      }
    });

    styleSelect.addEventListener('change', (e: Event) => {
      this.currentStyle = (e.target as HTMLSelectElement).value;
      if (this.wavesurfer) {
        const currentTime = this.wavesurfer.getCurrentTime();
        const wasPlaying = this.wavesurfer.isPlaying();
        
        this.wavesurfer.destroy();
        this.wavesurfer = WaveSurfer.create(this.getWaveSurferOptions(container));
        
        if (this.currentObjectUrl) {
            this.wavesurfer.load(this.currentObjectUrl);
        }
        
        this.wavesurfer.on('ready', () => {
            this.wavesurfer?.setTime(currentTime);
            if (wasPlaying) this.wavesurfer?.play();
        });
      }
    });
  }

  private updatePlayIcon(playIcon: HTMLElement, pauseIcon: HTMLElement) {
    if (this.isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  }
}

customElements.define('exba-audio-waveform', AudioWaveformComponent);
