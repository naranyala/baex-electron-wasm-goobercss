import { ExbaComponent } from '../../framework/core/component';
import { ease, t } from '../../styles';

export class DrawerComponent extends ExbaComponent {
  static useShadow = true;
  
  static styles = {
    container: 'padding: 2rem; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;',
    backdrop: `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 1000; opacity: 0; pointer-events: none; transition: opacity 0.3s ${ease};`,
    backdropVisible: 'opacity: 1; pointer-events: auto;',
    drawer: `position: fixed; bottom: 0; left: 0; width: 100%; background: ${t.zinc900a}; border-top: 1px solid ${t.zinc800a}; border-radius: 1.5rem 1.5rem 0 0; padding: 2rem; z-index: 1001; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1); box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.4); box-sizing: border-box;`,
    drawerVisible: 'transform: translateY(0);',
    handle: `width: 40px; height: 4px; background: ${t.zinc700}; border-radius: 2px; margin: -0.5rem auto 1.5rem;`,
    title: `font-size: 1.25rem; font-weight: 700; color: ${t.zinc100}; margin-bottom: 1rem;`,
    content: `font-size: 0.9375rem; color: ${t.zinc400}; line-height: 1.6; margin-bottom: 2rem;`,
    btnOpen: `padding: 0.75rem 1.5rem; background: ${t.indigo600}; color: white; border: none; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: background ${ease};`,
    btnOpenHover: `&:hover { background: ${t.indigo500}; }`,
    btnClose: `width: 100%; padding: 0.75rem; background: ${t.zinc800}; color: ${t.zinc200}; border: none; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: background ${ease};`,
    btnCloseHover: `&:hover { background: ${t.zinc700}; }`
  };

  protected onMount() {
    this.setState({ isOpen: false });
  }

  private open() { this.setState({ isOpen: true }); }
  private close() { this.setState({ isOpen: false }); }

  render() {
    const isOpen = this.state.isOpen;

    return `
      <div class="container">
        <button class="btnOpen btnOpenHover" onclick="this.getRootNode().host.open()">Open Drawer</button>
        
        <div class="backdrop ${isOpen ? 'backdropVisible' : ''}" onclick="this.getRootNode().host.close()"></div>
        
        <div class="drawer ${isOpen ? 'drawerVisible' : ''}">
          <div class="handle"></div>
          <div class="title">System Notification</div>
          <div class="content">
            This is a bottom-up sliding panel primitive. It utilizes hardware-accelerated transforms for smooth performance and a backdrop filter for depth. Perfect for mobile menus or detailed inspection panels.
          </div>
          <button class="btnClose btnCloseHover" onclick="this.getRootNode().host.close()">Dismiss</button>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    (window as any).openDrawer = () => this.open();
    (window as any).closeDrawer = () => this.close();
  }
}

customElements.define('exba-drawer', DrawerComponent);
