import { EXAMPLE_REGISTRY } from '../showcase/registry';
import { renderTabBar } from './layouts/view-grid';
import { Router } from '../kernel/core/router';

export class TabManager {
  private tabs = new Map<string, { label: string; action: () => void }>();
  private activeTabId: string | null = null;
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  public saveTabs() {
    localStorage.setItem('exba-tabs', JSON.stringify(Array.from(this.tabs.keys())));
    localStorage.setItem('exba-active-tab', this.activeTabId || '');
  }

  public loadTabs() {
    const saved = localStorage.getItem('exba-tabs');
    const active = localStorage.getItem('exba-active-tab');
    if (saved) {
      try {
        const ids = JSON.parse(saved) as string[];
        ids.forEach((id) => {
          const item = EXAMPLE_REGISTRY.find((i) => i.id === id);
          if (item) {
            this.tabs.set(id, {
              label: item.label,
              action: () => item.action(document.getElementById('view-container')!),
            });
          }
        });
      } catch (e) {
        console.error('Failed to restore tabs', e);
      }
    }
    this.activeTabId = active || null;
  }

  public initListeners() {
    const tabBar = document.getElementById('main-tab-bar') as any;
    if (tabBar) {
      tabBar.addEventListener('tab-selected', (e: any) => {
        const tabId = e.detail;
        this.selectTab(tabId);
      });

      tabBar.addEventListener('tab-closed', (e: any) => {
        const tabId = e.detail;
        this.closeTab(tabId);
      });
    }

    (window as any).dispatchMenuAction = (id: string) => {
      this.openTabFromMenu(id);
    };
  }

  public selectTab(tabId: string) {
    if (tabId === 'home') {
      this.activeTabId = null;
      this.router.navigate('/');
      renderTabBar(this.tabs, null);
      this.saveTabs();
      return;
    }
    this.activeTabId = tabId;
    const tab = this.tabs.get(tabId);
    if (tab) tab.action();
    this.router.navigate(`/${tabId}`);
    renderTabBar(this.tabs, this.activeTabId);
    this.saveTabs();
  }

  public closeTab(tabId: string) {
    this.tabs.delete(tabId);
    if (this.activeTabId === tabId) {
      this.activeTabId = null;
      this.router.navigate('/');
      renderTabBar(this.tabs, null);
    } else {
      renderTabBar(this.tabs, this.activeTabId);
    }
    this.saveTabs();
  }

  public openTabFromMenu(id: string) {
    const item = EXAMPLE_REGISTRY.find((i) => i.id === id);
    if (item) {
      this.tabs.set(item.id, {
        label: item.label,
        action: () => item.action(document.getElementById('view-container')!),
      });
      this.activeTabId = item.id;
      item.action(document.getElementById('view-container')!);
      this.router.navigate(`/${item.id}`);
      renderTabBar(this.tabs, this.activeTabId);
      this.saveTabs();
    }
  }

  public getActiveTabId() {
    return this.activeTabId;
  }

  public getTabs() {
    return this.tabs;
  }

  public hasTab(id: string) {
    return this.tabs.has(id);
  }

  public getTabAction(id: string) {
    return this.tabs.get(id)?.action;
  }
}
