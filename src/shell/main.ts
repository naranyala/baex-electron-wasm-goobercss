import './style.css';
import './chrome/tab-bar/index';
import './chrome/status-bar/index';
import '../showcase/ui/home/index';

// SIDE EFFECT IMPORTS (Web Component Registration)
import '../showcase/ui/settings';
import '../showcase/ui/profile';
import '../showcase/integrations/analytics';
import '../showcase/ui/terminal';
import '../showcase/ui/neofetch';
import '../showcase/ui/kanban';
import '../showcase/ui/activity-feed';
import '../showcase/ui/accordion';
import '../showcase/ui/drawer';
import '../showcase/ui/code-block';
import '../showcase/ui/date-picker';
import '../showcase/integrations/mindmap-cytoscape';
import '../showcase/integrations/mindmap-vis';
import '../showcase/integrations/vega-charts';
import '../showcase/integrations/audio-waveform';
import '../showcase/browser/audio-demo';
import '../showcase/browser/canvas-demo';
import '../showcase/browser/storage-demo';
import '../showcase/browser/geo-demo';
import '../showcase/integrations/leaflet-turf';
import '../showcase/browser/notifications-demo';
import '../showcase/browser/fullscreen-demo';
import '../showcase/browser/clipboard-demo';
import '../showcase/browser/sqlite-demo';

import { bootstrap } from './bootstrap';
import { TabManager } from './tabs';
import { Router } from '../kernel/core/router';
import { EXAMPLE_REGISTRY } from '../showcase/registry';
import { renderTabBar } from './layouts/view-grid';

/**
 * Main application entry point.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await bootstrap();
    const router = new Router('view-container');

    // 1. Register Home
    router.register({ path: '/', component: 'exba-home' });

    // 2. Automatically register all plugin routes from the Registry
    EXAMPLE_REGISTRY.forEach(example => {
      router.register({
        path: example.id === 'home' ? '/' : `/${example.id}`,
        component: example.component
      });
    });

    // 3. Initialize Tab Management
    const tabManager = new TabManager(router);
    tabManager.loadTabs();
    tabManager.initListeners();

    // Initial navigation based on active tab
    const activeTabId = tabManager.getActiveTabId();
    if (activeTabId && tabManager.hasTab(activeTabId)) {
      const activeAction = tabManager.getTabAction(activeTabId);
      if (activeAction) {
        activeAction();
      }
      router.navigate(`/${activeTabId}`);
      renderTabBar(tabManager.getTabs(), activeTabId);
    } else {
      router.navigate('/');
      renderTabBar(tabManager.getTabs(), null);
    }
  } catch (e) {
    console.error('[EXBA] Fatal initialization error:', e);
  }
});
