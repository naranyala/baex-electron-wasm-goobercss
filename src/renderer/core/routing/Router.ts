import { eventBus } from './EventBus';

export interface Route {
  path: string;
  component: string;
  props?: any;
}

export class Router {
  private routes: Route[] = [];
  private currentRoute: Route | null = null;

  addRoute(route: Route): void {
    this.routes.push(route);
  }

  navigate(path: string, props?: any): void {
    const route = this.routes.find(r => r.path === path);
    if (!route) throw new Error(`Route not found: ${path}`);
    
    this.currentRoute = { ...route, props };
    window.history.pushState({}, '', path);
    eventBus.publish('route-changed', this.currentRoute);
  }

  getCurrentRoute(): Route | null {
    return this.currentRoute;
  }

  listen(): void {
    window.onpopstate = () => {
      const path = window.location.pathname;
      this.navigate(path);
    };
  }
}

export const router = new Router();
