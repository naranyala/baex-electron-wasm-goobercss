import { MENU_CATEGORIES } from '../../layouts/constants';
import { styles } from '../../styles';
import { ExbaComponent } from '../../../framework/core/component';
import { EXAMPLE_REGISTRY } from '../../../examples/registry';

/**
 * The primary dashboard component for the application.
 * Renders a categorized grid of menu items and provides a search filter
 * for quick navigation across framework examples and demos.
 */
export class HomeComponent extends ExbaComponent {
  /** HomeComponent does not use Shadow DOM to allow global style interaction. */
  static useShadow = false;
  /** Component properties (none). */
  static props = {};
  /** Styles are inherited from the global styles module. */
  static styles = {};

  /**
   * Renders the search input and the container for the categorized menu grid.
   */
  render() {
    return `
      <div class="${styles.menuContainer}">
        <div class="${styles.sidebarSearch}">
          <input 
              type="text" 
              id="menu-search" 
              class="${styles.searchInput}" 
              placeholder="Search menu..." 
          />
        </div>
        <div id="menu-grid"></div>
      </div>
    `;
  }

  /**
   * Initializes the menu grid and attaches a reactive search listener 
   * to filter menu items in real-time.
   */
  connectedCallback() {
    super.connectedCallback();
    this.renderGridMenu();

    const searchEl = document.querySelector<HTMLInputElement>('#menu-search');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value;
        const filtered = EXAMPLE_REGISTRY.filter((item: any) => 
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.id.toLowerCase().includes(query.toLowerCase())
        );
        this.updateGrid(filtered);
      });
    }
  }

  /** Initial render of the full menu grid. */
  private renderGridMenu() {
    this.updateGrid(EXAMPLE_REGISTRY);
  }

  /**
   * Dynamically updates the menu grid HTML based on a filtered list of items.
   * Organizes items by their respective categories.
   * @param items The list of menu items to display.
   */
  private updateGrid(items: typeof EXAMPLE_REGISTRY) {
    const grid = document.querySelector<HTMLDivElement>('#menu-grid');
    if (!grid) return;

    const itemsSet = new Set(items.map((i: any) => i.id));

    grid.innerHTML = MENU_CATEGORIES.map((category: any) => {
      const categoryItems = category.items.filter((item: any) =>
        itemsSet.has(item.id),
      );
      if (categoryItems.length === 0) return '';

      // Determine initial collapsed state
      const isCollapsed = category.id === 'component-examples' || category.id === 'browser-api';
      const bodyDisplay = isCollapsed ? 'none' : 'block';
      const arrowRotation = isCollapsed ? 'transform: rotate(0deg);' : 'transform: rotate(180deg);';

      return `
        <div class="${styles.sectionCard}" style="margin-bottom: 1.5rem; width: 100%; max-width: 720px;">
          <div class="${styles.sectionHeader}" onclick="
            const body = this.nextElementSibling;
            const arrow = this.querySelector('span');
            if (body.style.display === 'none') {
              body.style.display = 'block';
              arrow.style.transform = 'rotate(180deg)';
            } else {
              body.style.display = 'none';
              arrow.style.transform = 'rotate(0deg)';
            }
          ">
            <div class="${styles.sectionTitle}">${category.label}</div>
            <span class="${styles.sectionArrow}" style="${arrowRotation}">▼</span>
          </div>
          <div class="${styles.sectionBody}" style="display: ${bodyDisplay};">
            <div class="${styles.menuGrid}" style="max-width: none; margin: 0;">
              ${categoryItems
                .map(
                  (item: any) => `
                <div class="${styles.menuItem}" onclick="window.dispatchMenuAction('${item.id}')">
                  <div class="${styles.menuItemIcon}">${item.icon}</div>
                  <div class="${styles.menuItemLabel}">${item.label}</div>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

customElements.define('exba-home', HomeComponent as any);
