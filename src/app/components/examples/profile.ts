import { ExbaComponent, type ComponentProps } from '../../../framework/core/component';
import { t } from '../../styles';

/**
 * A user profile card component.
 * Displays user details such as name, role, and location in a structured card layout.
 * Supports customization via properties.
 */
export class ProfileComponent extends ExbaComponent {
  /**
   * Observed properties for user details:
   * - username: The display name.
   * - role: Professional title.
   * - location: Geographical base.
   * - joined: Account creation date.
   * - status: Online/availability status.
   * - level: Expertise level badge.
   */
  static props: ComponentProps = {
    username: 'string',
    role: 'string',
    location: 'string',
    joined: 'string',
    status: 'string',
    level: 'string',
  };

  /** Scoped styles for the profile card and avatar. */
  static styles = {
    container: 'padding: 2rem; display: flex; flex-direction: column; align-items: center; font-family: inherit;',
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc700}; border-radius: 1.5rem; padding: 2rem; text-align: center; max-width: 400px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);`,
    avatar: `width: 80px; height: 80px; background: ${t.indigo600}; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: ${t.white};`,
    name: `font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem; color: ${t.zinc200};`,
    role: `font-size: 0.875rem; color: ${t.zinc400}; margin-bottom: 1.5rem;`,
    grid: `display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left; border-top: 1px solid ${t.zinc700}; padding-top: 1.5rem;`,
    item: 'display: flex; flex-direction: column; gap: 0.25rem;',
    label: `font-size: 0.75rem; text-transform: uppercase; color: ${t.zinc500}; letter-spacing: 0.05em;`,
    value: `font-size: 0.875rem; color: ${t.zinc300};`
  };

  /**
   * Renders the profile card using properties or default placeholders.
   */
  render() {
    const username = this.state.username || 'Developer User';
    const role = this.state.role || 'Fullstack Engineer @ EXBA';
    const location = this.state.location || 'Remote';
    const joined = this.state.joined || 'Jun 2026';
    const status = this.state.status || 'Active';
    const level = this.state.level || 'Pro';

    return `
      <div class="container">
        <div class="card">
          <div class="avatar">👤</div>
          <div class="name">${username}</div>
          <div class="role">${role}</div>
          <div class="grid">
            <div class="item">
              <span class="label">Location</span>
              <span class="value">${location}</span>
            </div>
            <div class="item">
              <span class="label">Joined</span>
              <span class="value">${joined}</span>
            </div>
            <div class="item">
              <span class="label">Status</span>
              <span class="value" style="color: ${t.emerald400}">${status}</span>
            </div>
            <div class="item">
              <span class="label">Level</span>
              <span class="value">${level}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-profile', ProfileComponent);
