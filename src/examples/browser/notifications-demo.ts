import { ExbaComponent } from '../../framework/core/component';
import { styles as globalStyles } from '../../app/styles';

/**
 * A demonstration component for the Web Notifications API.
 * Allows users to request permission and send local system notifications.
 */
export class NotificationsDemo extends ExbaComponent {
  static props = {};

  static styles = {
    container: 'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 600px; margin: 0 auto;',
    btn: 'padding: 0.75rem 1.5rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white; font-weight: 600;',
    status: 'font-size: 0.875rem; color: #a1a1aa;'
  };

  /**
   * Renders the notification trigger and permission status.
   */
  render() {
    const styles = (this.constructor as any).styles;
    const permission = Notification.permission;
    
    return `
      <div class="${styles.container}">
        <div class="${globalStyles.viewHeading}">Web Notifications API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Send system-level notifications from the browser.</p>
        <div class="${styles.status}">Permission Status: <strong>${permission}</strong></div>
        <button id="notify-btn" class="${styles.btn}">
          ${permission === 'granted' ? 'Send Notification' : 'Request Permission'}
        </button>
      </div>
    `;
  }

  protected onMount() {
    const btn = this.shadowRoot?.getElementById('notify-btn');
    btn?.addEventListener('click', () => this.handleNotify());
  }

  /**
   * Handles the notification logic: requests permission if needed, then sends.
   */
  private async handleNotify() {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("EXBA Framework", {
        body: "This is a demo notification from the Browser API Exploration!",
        icon: "/vite.svg"
      });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.handleNotify();
      }
      this.safeUpdate();
    }
  }
}

customElements.define('exba-notifications-demo', NotificationsDemo);
