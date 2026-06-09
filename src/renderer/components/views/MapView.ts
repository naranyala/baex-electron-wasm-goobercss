import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';
import { css } from 'goober';

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0;
    height: 80vh;
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `,
  title: css`
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  badge: css`
    font-size: 0.75rem;
    color: ${theme.subtitleColor};
    background: #1f1f23;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid ${theme.borderColor};
  `,
  mapContainer: css`
    flex: 1;
    border-radius: 0.875rem;
    border: 1px solid ${theme.borderColor};
    background: #18181b;
    min-height: 400px;
  `,
  footer: css`
    font-size: 0.8125rem;
    color: ${theme.subtitleColor};
    text-align: center;
  `
};

export const MapView = defineComponent({
  name: 'map-view',
  initialState: {
    center: [51.505, -0.09],
    zoom: 13,
    title: 'World Map'
  },
  render: (state) => html`
    <div class="${styles.wrapper}">
      <div class="${styles.header}">
        <h2 class="${styles.title}">${state.title}</h2>
        <span class="${styles.badge}">Leaflet</span>
      </div>
      <div id="leaflet-map" class="${styles.mapContainer}"></div>
      <div class="${styles.footer}">
        Spatial data visualization layer powered by Leaflet.js
      </div>
    </div>
  `,
  mounted: (el, state) => {
    const mapEl = el.shadowRoot?.getElementById('leaflet-map');
    if (!mapEl) return;
    
    const map = L.map(mapEl).setView(state.center as [number, number], state.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.marker(state.center as [number, number]).addTo(map)
      .bindPopup('EXBA Spatial Node')
      .openPopup();
    
    setTimeout(() => map.invalidateSize(), 100);
  }
});
