import { styles } from '../styles';
import { MENU_CATEGORIES, MENU_ITEMS } from './constants';
import '../framework/state/theme';

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

export function renderGridMenu(filteredItems: typeof MENU_ITEMS) {
  const grid = document.querySelector<HTMLDivElement>('#menu-grid');
  if (!grid) return;

  const itemsSet = new Set(filteredItems.map((i) => i.id));

  grid.innerHTML = MENU_CATEGORIES.map((category) => {
    const categoryItems = category.items.filter((item) =>
      itemsSet.has(item.id),
    );
    if (categoryItems.length === 0) return '';

    return `
      <div class="${styles.categoryTitle}">${category.label}</div>
      <div class="${styles.menuGrid}">
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
    `;
  }).join('');
}

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
