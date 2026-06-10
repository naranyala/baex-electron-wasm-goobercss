import { ExbaComponent } from '../../../framework/core/component';
import { styles as globalStyles } from '../../../styles';

export class GeoDemo extends ExbaComponent {
  static props = {};

  static styles = {
    container:
      'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 600px; margin: 0 auto;',
    btn: 'padding: 0.75rem 1.5rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white; font-weight: 600;',
    card: 'background: #18181b; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #333; width: 100%; text-align: center;',
    val: 'font-family: monospace; color: #818cf8; font-size: 1.125rem;',
  };

  render() {
    const styles = (this.constructor as any).styles;
    return `
      <div class="${styles.container}">
        <div class="${globalStyles.viewHeading}">Geolocation API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Request access to your device's physical location.</p>
        <button id="geo-get" class="${styles.btn}">Get My Position</button>
        <div id="geo-result" class="${styles.card}" style="display: none;">
          <div style="margin-bottom: 1rem;">Latitude: <span id="geo-lat" class="${styles.val}">-</span></div>
          <div>Longitude: <span id="geo-lon" class="${styles.val}">-</span></div>
        </div>
      </div>
    `;
  }

  protected onMount() {
    const btn = this.shadowRoot?.getElementById('geo-get');
    btn?.addEventListener('click', () => this.getLocation());
  }

  private async getLocation() {
    const resultCard = this.shadowRoot?.getElementById('geo-result');
    const latEl = this.shadowRoot?.getElementById('geo-lat');
    const lonEl = this.shadowRoot?.getElementById('geo-lon');

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      if (resultCard) resultCard.style.display = 'block';
      if (latEl) latEl.innerText = pos.coords.latitude.toFixed(4);
      if (lonEl) lonEl.innerText = pos.coords.longitude.toFixed(4);
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }
}

customElements.define('exba-geo-demo', GeoDemo);
