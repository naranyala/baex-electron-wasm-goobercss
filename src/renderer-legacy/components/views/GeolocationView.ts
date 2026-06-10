import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 750px;
    margin: 0 auto;
    color: ${theme.subtitleColor};
  `,
  card: css`
    background: #161b22;
    border: 1px solid ${theme.borderColor};
    border-radius: 12px;
    padding: 24px;
    margin-top: 24px;
  `,
  button: css`
    background: ${theme.accentColor};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    &:disabled {
      background: #30363d;
      cursor: not-allowed;
    }
  `,
  info: css`
    margin-top: 16px;
    font-family: monospace;
    color: #a5d6ff;
  `
};

export const GeolocationView = defineComponent({
  name: 'geolocation-view',
  useShadow: false,
  initialState: {
    loading: false,
    coords: null as GeolocationCoordinates | null,
    error: null as string | null
  },
  render: (state) => html`
    <div class="${styles.container}">
      <h1>Geolocation API</h1>
      <p>Identify the user's location via the browser's Geolocation API.</p>
      
      <div class="${styles.card}">
        <button class="${styles.button}" data-action="get-location" ${state.loading ? 'disabled' : ''}>
          ${state.loading ? 'Getting Location...' : 'Get Current Location'}
        </button>
        
        ${state.error ? `<div style="color: #ff7b72; margin-top: 12px;">Error: ${state.error}</div>` : ''}
        
        ${state.coords ? `
          <div class="${styles.info}">
            <div>Latitude: ${state.coords.latitude}</div>
            <div>Longitude: ${state.coords.longitude}</div>
            <div>Accuracy: ${state.coords.accuracy} meters</div>
          </div>
          <div style="margin-top: 20px;">
            <a href="https://www.google.com/maps?q=${state.coords.latitude},${state.coords.longitude}" target="_blank" style="color: ${theme.accentColor};">View on Google Maps</a>
          </div>
        ` : ''}
      </div>
    </div>
  `,
  events: {
    'click [data-action="get-location"]': (_e, { setState }) => {
      setState(() => ({ loading: true, error: null }));
      if (!navigator.geolocation) {
        setState(() => ({ loading: false, error: 'Geolocation is not supported by your browser' }));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState(() => ({ loading: false, coords: position.coords }));
        },
        (error) => {
          setState(() => ({ loading: false, error: error.message }));
        }
      );
    }
  }
});
