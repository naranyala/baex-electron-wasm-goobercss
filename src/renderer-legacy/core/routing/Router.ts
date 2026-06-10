import { eventBus } from './EventBus';

/**
 * Defines the structure of a routable page in the application.
 */
export interface Route {
  /** The URL path associated with this route. */
  path: string;
  /** The name or identifier of the component to render. */
  component: string;
  /** Optional properties to pass to the component. */
  props?: any;
}

/**
 * Simple client-side router that manages application state based on URL paths.
 * Uses a Publish-Subscribe pattern via the EventBus to notify components of route changes.
 */
export class Router {
  private routes: Route[] = [];
  private currentRoute: Route | null = null;

  /**
   * Registers a new route in the application.
   * @param {Route} route - The route configuration.
   */
  addRoute(route: Route): void {
    this.routes.push(route);
  }

  /**
   * Changes the current route and updates the browser history.
   * 
   * @param {string} path - The path to navigate to.
   * @param {any} props - Optional properties to pass to the destination component.
   * @throws {Error} If the provided path is not registered.
   */
  navigate(path: string, props?: any): void {
    const route = this.routes.find(r => r.path === path);
    if (!route) throw new Error(`Route not found: ${path}`);
    
    this.currentRoute = { ...route, props };
    window.history.pushState({}, '', path);
    eventBus.publish('route-changed', this.currentRoute);
  }

  /**
   * Returns the currently active route.
   * @returns {Route | null} The active route or null if none is set.
   */
  getCurrentRoute(): Route | null {
    return this.currentRoute;
  }

  /**
   * Starts listening for browser popstate events to enable back/forward navigation.
   */
  listen(): void {
    window.onpopstate = () => {
      const path = window.location.pathname;
      this.navigate(path);
    };
  }
}

/** Singleton instance of the Router for application-wide navigation. */
export const router = new Router();
