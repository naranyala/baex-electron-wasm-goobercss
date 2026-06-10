import { ExbaComponent } from '../../framework/core/component';
import { ease, t } from '../../styles';

export class AccordionComponent extends ExbaComponent {
  static useShadow = true;
  
  static styles = {
    container: 'padding: 2rem; width: 100%; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.5rem;',
    item: `border: 1px solid ${t.zinc800a}; border-radius: 0.75rem; overflow: hidden; background: ${t.zinc900a}; transition: border-color ${ease};`,
    itemActive: `border-color: ${t.indigo500};`,
    header: `padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: background ${ease};`,
    headerHover: `&:hover { background: ${t.zinc800}; }`,
    title: `font-size: 0.9375rem; font-weight: 600; color: ${t.zinc100};`,
    icon: `font-size: 0.75rem; color: ${t.zinc500}; transition: transform ${ease};`,
    iconActive: 'transform: rotate(180deg);',
    content: `max-height: 0; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: ${t.zinc950};`,
    contentVisible: 'max-height: 200px; padding: 1.25rem; border-top: 1px solid ${t.zinc800a};',
    text: `font-size: 0.875rem; color: ${t.zinc400}; line-height: 1.6;`
  };

  protected onMount() {
    this.setState({ activeIndex: 0 });
  }

  private toggle(index: number) {
    const current = this.state.activeIndex;
    this.setState({ activeIndex: current === index ? -1 : index });
  }

  render() {
    const active = this.state.activeIndex;
    const items = [
      { title: 'What is EXBA Framework?', content: 'EXBA is a high-performance web framework that bridges TypeScript components with a Rust WASM core for heavy logic and state management.' },
      { title: 'Unified Component Pattern', content: 'Our components follow a strict blueprint: static props, static styles object, and signal-based reactivity for predictable UI updates.' },
      { title: 'Signal-based Reactivity', content: 'Signals provide a way to manage state that is decoupled from the component tree, allowing for surgical DOM updates without full tree reconciliations.' }
    ];

    return `
      <div class="container">
        <h2 style="color: ${t.zinc100}; margin-bottom: 1.5rem;">Accordion Demo</h2>
        ${items.map((item, i) => `
          <div class="item ${active === i ? 'itemActive' : ''}">
            <div class="header headerHover" onclick="this.getRootNode().host.toggle(${i})">
              <span class="title">${item.title}</span>
              <span class="icon ${active === i ? 'iconActive' : ''}">▼</span>
            </div>
            <div class="content ${active === i ? 'contentVisible' : ''}">
              <div class="text">${item.content}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    (window as any).toggleAccordion = (i: number) => this.toggle(i);
  }
}

customElements.define('exba-accordion', AccordionComponent);
