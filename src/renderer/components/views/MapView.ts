import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * A spatial visualization component that integrates the Leaflet.js library.
 * Provides an interactive map interface for geospatial data display.
 */
export const MapView = {
  /** Unique identifier for the component. */
  name: 'map-view',
  /** Initial state for the map configuration. */
  initialState: {
    /** Latitude and longitude of the initial center point. */
    center: [51.505, -0.09],
    /** Initial zoom level. */
    zoom: 13,
    /** Title displayed in the header. */
    title: 'World Map'
  },
  /**
   * Renders the map container and styles.
   * Note: The actual map is initialized in the mounted hook.
   */
  render: (state: any) => `
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 0; height: 80vh;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <h2 style="margin: 0; font-size: 1.125rem; font-weight: 600; letter-spacing: -0.01em; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${state.title}</h2>
        <span style="font-size: 0.75rem; color: #6b6b7b; background: #1f1f23; padding: 0.125rem 0.5rem; border-radius: 0.25rem; border: 1px solid #2a2a30;">Leaflet</span>
      </div>
      <div id="leaflet-map" style="flex: 1; border-radius: 0.875rem; border: 1px solid #2a2a30; background: #18181b; min-height: 400px;"></div>
      <div style="font-size: 0.8125rem; color: #6b6b7b; text-align: center;">
        Spatial data visualization layer powered by Leaflet.js
      </div>
    </div>
  `,
  /**
   * Lifecycle hook: initializes the Leaflet map instance inside the shadow DOM.
   * @param {HTMLElement} el - The root element of the component.
   * @param {any} state - The current state of the component.
   */
  mounted: (el: any, state: any) => {
    const mapEl = el.shadowRoot?.getElementById('leaflet-map');
    if (!mapEl) return;
    
    const map = L.map(mapEl).setView(state.center as [number, number], state.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.marker(state.center as [number, number]).addTo(map)
      .bindPopup('BAEX Spatial Node')
      .openPopup();
    
    setTimeout(() => map.invalidateSize(), 100);
  }
};
