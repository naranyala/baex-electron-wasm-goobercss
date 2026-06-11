/**
 * Defines a route within the EXBA application.
 */
export interface Route {
  /** The URL path (e.g., '/home'). */
  path: string;
  /** The custom element tag name to render for this route. */
  component: string;
  /** Optional default properties to pass to the component. */
  props?: Record<string, any>;
}

/**
 * A lightweight client-side router for EXBA components.
 * Manages route registration, navigation, and DOM swapping.
 */
export class Router {
  private routes: Map<string, Route> = new Map();
  private currentPath: string = '/';
  private container: HTMLElement;

  /**
   * Creates a new Router instance.
   * @param containerId The ID of the HTML element where components will be rendered.
   */
  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  /**
   * Registers a new route definition.
   * @param route The route object.
   */
  register(route: Route) {
    this.routes.set(route.path, route);
  }

  /**
   * Navigates to a specific path, rendering the associated component.
   * @param path The target path.
   * @param params Optional dynamic properties to pass to the component.
   */
  async navigate(path: string, params?: Record<string, any>) {
    this.currentPath = path;
    const route = this.routes.get(path);

    if (!route) {
      console.error(`Route not found: ${path}`);
      return;
    }

    // Clear container and render component
    this.container.innerHTML = '';
    const el = document.createElement(route.component);

    // Apply props as attributes
    const props = { ...route.props, ...params };
    for (const [key, value] of Object.entries(props)) {
      el.setAttribute(
        key,
        typeof value === 'object' ? JSON.stringify(value) : String(value),
      );
    }

    this.container.appendChild(el);

    // Update URL if needed (optional)
    window.history.pushState({}, '', path);
  }

  /**
   * Returns the current active path.
   */
  getCurrentPath() {
    return this.currentPath;
  }
}
