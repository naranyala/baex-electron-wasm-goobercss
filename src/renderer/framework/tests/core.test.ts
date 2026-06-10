import { describe, expect, it } from 'vitest';
import { ExbaComponent } from '../core/component';
import { Router } from '../core/router';

class TestComponent extends ExbaComponent {
  static props = {
    name: 'string',
    count: 'number',
  } as const;

  render() {
    return `<div>Hello ${this.state.name || 'User'}, count: ${this.state.count || 0}</div>`;
  }
}

customElements.define('test-component', TestComponent);

describe('ExbaComponent', () => {
  it('should render initial state', () => {
    const el = document.createElement('test-component') as TestComponent;
    document.body.appendChild(el);
    expect(el.shadowRoot?.innerHTML).toContain('Hello User, count: 0');
  });

  it('should update when setState is called', () => {
    const el = document.createElement('test-component') as TestComponent;
    document.body.appendChild(el);
    el.setState({ name: 'Alice', count: 5 });
    expect(el.shadowRoot?.innerHTML).toContain('Hello Alice, count: 5');
  });

  it('should react to attribute changes (Prop System)', () => {
    const el = document.createElement('test-component') as TestComponent;
    document.body.appendChild(el);
    el.setAttribute('name', 'Bob');
    el.setAttribute('count', '10');
    expect(el.shadowRoot?.innerHTML).toContain('Hello Bob, count: 10');
  });
});

describe('Router', () => {
  it('should navigate and render components', () => {
    const container = document.createElement('div');
    container.id = 'router-container';
    document.body.appendChild(container);

    const router = new Router('router-container');
    router.register({ path: '/test', component: 'test-component' });
    router.navigate('/test');

    expect(container.querySelector('test-component')).toBeDefined();
  });
});
