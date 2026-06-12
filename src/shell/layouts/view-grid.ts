import { styles } from '../styles';
import { MENU_CATEGORIES, MENU_ITEMS } from './constants';
import '../../kernel/state/theme';

/**
 * Synchronizes the global tab bar with the provided tabs map.
 * @param tabs Map of tab IDs to their labels and actions.
 * @param activeTabId The ID of the tab to highlight.
 */
export function renderTabBar(
  tabs: Map<string, { label: string; action: () => void }>,
  activeTabId: string | null,
) {
  const tabBar = document.querySelector('tab-bar') as HTMLElement & {
    setActive: (id: string | null) => void;
  };
  if (tabBar) {
    tabBar.setAttribute(
      'tabs',
      JSON.stringify(
        Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label })),
      ),
    );
    if (activeTabId) {
      tabBar.setActive(activeTabId);
    } else {
      tabBar.setActive(null);
    }
  }
}

/**
 * Renders a list of menu items organized by category into the grid container.
 * @param filteredItems The list of items to include in the grid.
 */
export function renderGridMenu(filteredItems: typeof MENU_ITEMS) {
  const grid = document.querySelector<HTMLDivElement>('#menu-grid');
  if (!grid) return;

  const itemsSet = new Set(filteredItems.map((i) => i.id));

  grid.innerHTML = MENU_CATEGORIES.map((category) => {
    const categoryItems = category.items.filter((item) =>
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
                (item) => `
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

/**
 * Bootstraps the primary application layout within the #app container.
 * Sets up the theme provider, tab bar, and main content area.
 */
export function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    console.error('Element #app not found');
    return;
  }

  app.innerHTML = `
    <exba-theme-provider initial-mode="system">
      <div class="${styles.layoutShell}">
        <tab-bar id="main-tab-bar"></tab-bar>
        <main class="${styles.mainContent}">
          <div id="view-container" class="${styles.viewContainer}"></div>
        </main>
      </div>
    </exba-theme-provider>
  `;
}
