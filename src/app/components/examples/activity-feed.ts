import { ExbaComponent } from '../../../framework/core/component';
import { EXBA } from '../../../framework/core/exba';
import { ease, t } from '../../styles';

/**
 * A real-time activity feed component that aggregates events from across the system.
 * Listens to multiple global signals (activity, counter, route changes) and 
 * displays them as a chronological list of notifications with entry animations.
 */
export class ActivityFeedComponent extends ExbaComponent {
  /** Uses Shadow DOM for style and animation encapsulation. */
  static useShadow = true;
  
  /** Scoped styles including slide-in animations for new feed items. */
  static styles = {
    container: 'padding: 2rem; width: 100%; max-width: 800px; margin: 0 auto;',
    header: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;',
    title: 'font-size: 1.5rem; font-weight: 700; color: ${t.zinc100};',
    feed: 'display: flex; flex-direction: column; gap: 0.75rem;',
    item: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 0.75rem; padding: 1rem; display: flex; align-items: flex-start; gap: 1rem; transition: all ${ease};`,
    itemIn: 'animation: slideIn 0.3s ease-out;',
    icon: `font-size: 1.25rem; background: ${t.zinc800}; width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; border-radius: 50%;`,
    content: 'flex: 1;',
    msg: `font-size: 0.9375rem; color: ${t.zinc200}; margin-bottom: 0.25rem;`,
    time: `font-size: 0.75rem; color: ${t.zinc500};`,
    empty: 'text-align: center; color: ${t.zinc600}; padding: 3rem; border: 2px dashed ${t.zinc800a}; border-radius: 1rem;'
  };

  /**
   * Sets up reactive effects to monitor global system activity.
   * Tracks the 'activity' signal for direct logs, 'counter' for state changes,
   * and 'current_route' for navigation tracking.
   */
  protected onMount() {
    this.setState({ activities: [] });

    this.createEffect('activity', (data) => {
        const activities = [data, ...(this.state.activities || [])].slice(0, 20);
        this.setState({ activities });
    });

    this.createEffect('counter', (val) => {
        this.logActivity('🔢', `Counter updated to ${val}`);
    });

    this.createEffect('current_route', (route) => {
        this.logActivity('🌐', `Navigated to ${route}`);
    });
  }

  /**
   * Formats and broadcasts a new activity event.
   * @param icon Visual emoji representing the activity type.
   * @param msg Descriptive text for the activity.
   */
  private logActivity(icon: string, msg: string) {
    EXBA.notify('activity', {
        id: Math.random().toString(36).substr(2, 9),
        icon,
        msg,
        time: new Date().toLocaleTimeString()
    });
  }

  /**
   * Renders the feed container and maps the activity list to animated item elements.
   */
  render() {
    const activities = this.state.activities || [];

    return `
      <style>
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
      </style>
      <div class="container">
        <header class="header">
          <div class="title">Live Activity Feed</div>
          <button style="background: ${t.zinc800}; color: ${t.zinc400}; border: none; padding: 0.25rem 0.75rem; border-radius: 0.5rem; cursor: pointer;" onclick="this.getRootNode().host.setState({ activities: [] })">Clear</button>
        </header>
        
        <div class="feed">
          ${activities.length > 0 
            ? activities.map((a: any) => `
              <div class="item itemIn">
                <div class="icon">${a.icon}</div>
                <div class="content">
                  <div class="msg">${a.msg}</div>
                  <div class="time">${a.time}</div>
                </div>
              </div>
            `).join('')
            : '<div class="empty">No activity detected yet. Move some tasks or update the counter!</div>'
          }
        </div>
      </div>
    `;
  }
}

customElements.define('exba-activity-feed', ActivityFeedComponent);
