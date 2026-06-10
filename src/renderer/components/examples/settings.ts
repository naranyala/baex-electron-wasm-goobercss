import { ExbaComponent, type ComponentProps } from '../../framework/core/component';
import { ease, t } from '../../styles';

const STYLES = `
  .container {
    padding: 2rem;
    color: ${t.zinc100};
    font-family: inherit;
  }
  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: ${t.zinc200};
  }
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: ${t.zinc800a};
    border-radius: 0.75rem;
    margin-bottom: 0.75rem;
    border: 1px solid ${t.zinc700};
  }
  .label {
    font-size: 0.9375rem;
    color: ${t.zinc300};
  }
  .toggle {
    width: 2.5rem;
    height: 1.25rem;
    background: ${t.zinc700};
    border-radius: 1rem;
    position: relative;
    cursor: pointer;
    transition: background ${ease};
  }
  .toggle.active {
    background: ${t.indigo600};
  }
  .toggle::after {
    content: '';
    position: absolute;
    width: 1rem;
    height: 1rem;
    background: ${t.white};
    border-radius: 50%;
    top: 0.125rem;
    left: 0.125rem;
    transition: transform ${ease};
  }
  .toggle.active::after {
    transform: translateX(1.25rem);
  }
`;

export class SettingsComponent extends ExbaComponent {
  static props: ComponentProps = {
    darkMode: 'boolean',
    notifications: 'boolean',
    autoUpdate: 'boolean',
  };

  static styles = STYLES;

  render() {
    const {
      darkMode = true,
      notifications = false,
      autoUpdate = true,
    } = this.state;
    return `
      <div class="container">
        <div class="title">Settings</div>
        <div class="setting-item">
          <span class="label">Dark Mode</span>
          <div class="toggle ${darkMode ? 'active' : ''}" onclick="this.getRootNode().host.setState({ darkMode: ${!darkMode} })"></div>
        </div>
        <div class="setting-item">
          <span class="label">Notifications</span>
          <div class="toggle ${notifications ? 'active' : ''}" onclick="this.getRootNode().host.setState({ notifications: ${!notifications} })"></div>
        </div>
        <div class="setting-item">
          <span class="label">Auto Update</span>
          <div class="toggle ${autoUpdate ? 'active' : ''}" onclick="this.getRootNode().host.setState({ autoUpdate: ${!autoUpdate} })"></div>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-settings', SettingsComponent);
