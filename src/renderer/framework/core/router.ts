export interface Route {
  path: string;
  component: string; // The tag name of the component to render
  props?: Record<string, any>;
}

export class Router {
  private routes: Map<string, Route> = new Map();
  private currentPath: string = '/';
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  register(route: Route) {
    this.routes.set(route.path, route);
  }

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

  getCurrentPath() {
    return this.currentPath;
  }
}
