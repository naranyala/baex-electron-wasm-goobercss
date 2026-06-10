import { ease, t } from '../../styles';
import { ExbaComponent, type ComponentProps } from '../../framework/core/component';

export class StatusBar extends ExbaComponent {
  static props: ComponentProps = {
    primitives: 'number',
    'wasm-functions': 'number',
  };

  static styles = {
    host: `display: flex; position: fixed; bottom: 0; left: 0; width: 100%; height: 2rem; background: ${t.zinc950}; border-top: 1px solid ${t.zinc800a}; align-items: center; padding: 0 1rem; font-size: 0.6875rem; font-family: inherit; color: ${t.zinc500}; z-index: 100; gap: 1.5rem; box-sizing: border-box;`,
    stat: `cursor: pointer; transition: color ${ease}; &:hover { color: ${t.zinc200}; }`,
    counter: `margin-left: auto; color: ${t.indigo400}; font-weight: 700;`
  };

  protected onMount() {
    this.createEffect('counter', (val) => {
        this.setState({ counter: val });
    });
  }

  render() {
    const primitives = this.state.primitives || '0';
    const wasmFuncs = this.state['wasm-functions'] || '0';
    const counter = this.state.counter || 0;

    return `
      <div class="host">
        <div class="stat" onclick="(this.getRootNode() as any).host.emit('show-modal')">
            Primitives: <span>${primitives}</span>
        </div>
        <div class="stat" onclick="(this.getRootNode() as any).host.emit('show-modal')">
            WASM Functions: <span>${wasmFuncs}</span>
        </div>
        <div id="state-counter" class="counter">Counter: ${counter}</div>
      </div>
    `;
  }
}

customElements.define('status-bar', StatusBar);
