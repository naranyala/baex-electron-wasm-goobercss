import { defineExbaComponent } from '../../kernel/core/component';
import { EXBA } from '../../kernel/core/exba';
import { ease, t } from '../../shell/styles';

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

defineExbaComponent({
  tagName: 'exba-settings',
  props: {
    darkMode: 'boolean',
    notifications: 'boolean',
    autoUpdate: 'boolean',
  },
  styles: STYLES,
  state: {
    notifications: false,
    autoUpdate: true,
  },
  onMount() {
    this.subscribeToState('theme');
  },
  listeners: [
    {
      selector: '.toggle-dark',
      eventName: 'click',
      handler: function(this: any) {
        const currentTheme = this.state.theme || 'dark';
        const isDark = currentTheme === 'dark';
        if (EXBA.state) {
          EXBA.state.value.theme = isDark ? 'light' : 'dark';
        }
      }
    },
    {
      selector: '.toggle-notifications',
      eventName: 'click',
      handler: function(this: any) {
        this.state.notifications = !this.state.notifications;
      }
    },
    {
      selector: '.toggle-autoupdate',
      eventName: 'click',
      handler: function(this: any) {
        this.state.autoUpdate = !this.state.autoUpdate;
      }
    }
  ],
  render() {
    const {
      notifications = false,
      autoUpdate = true,
    } = this.state;
    const currentTheme = this.state.theme || 'dark';
    const isDark = currentTheme === 'dark';

    return `
      <div class="container">
        <div class="title">Settings</div>
        <div class="setting-item">
          <span class="label">Dark Mode</span>
          <div class="toggle ${isDark ? 'active' : ''} toggle-dark"></div>
        </div>
        <div class="setting-item">
          <span class="label">Notifications</span>
          <div class="toggle ${notifications ? 'active' : ''} toggle-notifications"></div>
        </div>
        <div class="setting-item">
          <span class="label">Auto Update</span>
          <div class="toggle ${autoUpdate ? 'active' : ''} toggle-autoupdate"></div>
        </div>
      </div>
    `;
  }
});
