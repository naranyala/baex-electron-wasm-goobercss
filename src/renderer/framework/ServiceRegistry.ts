export interface ServiceRegistry {
  register<T>(id: string, service: T): void;
  get<T>(id: string): T;
  has(id: string): boolean;
}

class ServiceRegistryImpl implements ServiceRegistry {
  private services = new Map<string, any>();

  register<T>(id: string, service: T): void {
    this.services.set(id, service);
  }

  get<T>(id: string): T {
    const service = this.services.get(id);
    if (!service) throw new Error(`Service ${id} not found in registry`);
    return service as T;
  }

  has(id: string): boolean {
    return this.services.has(id);
  }
}

export const services = new ServiceRegistryImpl();
