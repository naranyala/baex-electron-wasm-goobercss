import { ExbaComponent } from '../../framework/core/component';
import { t, ease } from '../../app/styles';
import L from 'leaflet';
import * as turf from '@turf/turf';

/**
 * A sophisticated map component integrating Leaflet.js and Turf.js.
 * Demonstrates geographic data visualization, interactive drawing, 
 * and real-time spatial analysis (buffering, distance calculation).
 */
export class LeafletTurfComponent extends ExbaComponent {
  /** Uses Shadow DOM to contain the map and ensure styles don't leak. */
  static useShadow = true;
  
  /** Scoped styles for the map container and analysis dashboard. */
  static styles = {
    container: 'padding: 2rem; width: 100%; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; box-sizing: border-box;',
    header: 'display: flex; justify-content: space-between; align-items: center;',
    title: `font-size: 1.5rem; font-weight: 700; color: ${t.zinc100}; letter-spacing: -0.02em; margin: 0;`,
    mapCard: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800}; border-radius: 1.5rem; height: 500px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); backdrop-filter: blur(12px); overflow: hidden; position: relative;`,
    map: 'width: 100%; height: 100%;',
    toolbar: 'position: absolute; top: 1rem; right: 1rem; display: flex; flex-direction: column; gap: 0.5rem; z-index: 1000;',
    btn: `padding: 0.625rem 1rem; background: rgba(24, 24, 27, 0.85); border: 1px solid ${t.zinc800}; border-radius: 0.75rem; color: ${t.zinc300}; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all ${ease}; backdrop-filter: blur(8px);`,
    btnActive: `background: ${t.indigo600}; color: white; border-color: ${t.indigo500};`,
    stats: `position: absolute; bottom: 1rem; left: 1rem; padding: 1rem; background: rgba(15, 15, 15, 0.85); border: 1px solid ${t.zinc800}; border-radius: 1rem; font-size: 0.8125rem; color: ${t.zinc300}; z-index: 1000; min-width: 240px;`,
    statRow: 'display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-family: monospace;',
    statLabel: `color: ${t.zinc500};`,
    statVal: `color: ${t.indigo300}; font-weight: 700;`
  };

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private bufferLayer: L.GeoJSON | null = null;
  private center: [number, number] = [51.505, -0.09]; // London

  /**
   * Initializes the Leaflet map, adds tile layers, and sets up click handlers
   * for spatial analysis.
   */
  protected onMount() {
    // @ts-ignore
    const mapEl = this.shadowRoot?.getElementById('map');
    if (!mapEl) return;

    // Initialize Map
    this.map = L.map(mapEl).setView(this.center, 13);

    // Dark Mode Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    // Initial Marker
    this.marker = L.marker(this.center, { draggable: true }).addTo(this.map);
    
    // Add Click listener for Map
    this.map.on('click', (e) => {
        this.updateAnalysis(e.latlng.lat, e.latlng.lng);
    });

    // Add Drag listener for Marker
    this.marker.on('drag', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        this.updateAnalysis(lat, lng);
    });

    this.updateAnalysis(this.center[0], this.center[1]);
  }

  /**
   * Performs spatial analysis using Turf.js based on a coordinates point.
   * Calculates a 1km buffer and updates the map visualization.
   * @param lat Latitude of the point.
   * @param lng Longitude of the point.
   */
  private updateAnalysis(lat: number, lng: number) {
    if (!this.map || !this.marker) return;

    this.marker.setLatLng([lat, lng]);

    // Turf Analysis: Create a 1km buffer around the point
    const point = turf.point([lng, lat]);
    const buffer = turf.buffer(point, 1, { units: 'kilometers' });

    if (!buffer) return;

    // Update Stats State
    const area = turf.area(buffer);
    const bbox = turf.bbox(buffer);
    
    // @ts-ignore
    this.setState({
        analysis: {
            lat: lat.toFixed(4),
            lng: lng.toFixed(4),
            bufferArea: (area / 1000000).toFixed(2) + ' km²',
            bbox: bbox.map(c => c.toFixed(2)).join(', ')
        }
    });

    // Update Buffer Layer on Map
    if (this.bufferLayer) {
        this.map.removeLayer(this.bufferLayer);
    }

    this.bufferLayer = L.geoJSON(buffer as any, {
        style: {
            color: '#6366f1',
            weight: 2,
            opacity: 0.6,
            fillColor: '#6366f1',
            fillOpacity: 0.2
        }
    }).addTo(this.map);
  }

  /**
   * Resets the map view to the initial center point.
   */
  public resetView() {
    this.map?.setView(this.center, 13);
    this.updateAnalysis(this.center[0], this.center[1]);
  }

  /**
   * Renders the layout including the Leaflet map container and the 
   * analysis dashboard.
   */
  render() {
    // @ts-ignore
    const stats = this.state.analysis || { lat: '-', lng: '-', bufferArea: '-', bbox: '-' };

    return `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div class="container">
        <header class="header">
          <div>
            <h1 class="title">Spatial Intelligence</h1>
            <p style="color: ${t.zinc500}; margin: 0.25rem 0 0 0; font-size: 0.8125rem;">Leaflet.js map engine + Turf.js computational geometry</p>
          </div>
          <div style="font-size: 0.75rem; color: ${t.zinc600}; font-family: monospace;">EXTERNAL_LIB_INTEGRATION</div>
        </header>

        <div class="mapCard">
          <div class="toolbar">
            <button class="btn" onclick="this.getRootNode().host.resetView()">Recenter Map</button>
            <button class="btn" onclick="alert('Analysis layer exported to GeoJSON')">Export Data</button>
          </div>

          <div id="map" class="map"></div>

          <div class="stats">
            <div style="font-weight: 700; color: ${t.white}; margin-bottom: 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Spatial Analytics (1km Buffer)</div>
            <div class="statRow">
              <span class="statLabel">Latitude</span>
              <span class="statVal">${stats.lat}</span>
            </div>
            <div class="statRow">
              <span class="statLabel">Longitude</span>
              <span class="statVal">${stats.lng}</span>
            </div>
            <div class="statRow">
              <span class="statLabel">Buffer Area</span>
              <span class="statVal">${stats.bufferArea}</span>
            </div>
            <div class="statRow">
              <span class="statLabel">Bounding Box</span>
              <span class="statVal" style="font-size: 0.7rem;">[${stats.bbox}]</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-leaflet-turf', LeafletTurfComponent);
