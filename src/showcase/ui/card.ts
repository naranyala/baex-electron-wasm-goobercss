import { ExbaWidget } from '../../kernel/core/widget';
import { customElement, property } from '../../kernel/core/decorators';
import { t, ease } from '../../shell/styles';

/**
 * ExbaCard: A structural container widget.
 * Demonstrates composition via named slots and stylistic variants.
 */
@customElement('exba-card')
export class ExbaCard extends ExbaWidget {
  @property('boolean') hoverable: boolean = false;

  static styles = {
    root: `
      border-radius: 1rem;
      border: 1px solid ${t.zinc800};
      background: ${t.zinc900};
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all ${ease};
    `,
    hover: `&:hover { border-color: ${t.zinc700}; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }`,
    header: `padding: 1.25rem; border-bottom: 1px solid ${t.zinc800}; background: ${t.zinc900a};`,
    content: 'padding: 1.25rem; flex: 1;',
    footer: `padding: 1rem 1.25rem; background: ${t.zinc950}; border-top: 1px solid ${t.zinc800}; display: flex; gap: 0.75rem; justify-content: flex-end;`
  };

  static variants = {
    default: {},
    glass: {
      root: `
        background: rgba(24, 24, 27, 0.4);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      `,
      header: 'background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.05);',
      footer: 'background: transparent; border-top: 1px solid rgba(255, 255, 255, 0.05);'
    },
    outlined: {
      root: 'background: transparent; border: 2px dashed ' + t.zinc800 + ';'
    }
  };

  build(classes: Record<string, string>) {
    const hoverClass = this.hoverable ? classes.hover : '';
    
    return `
      <div class="${classes.root} ${hoverClass}">
        <div class="${classes.header}">
          <slot name="header"></slot>
        </div>
        <div class="${classes.content}">
          <slot></slot>
        </div>
        <div class="${classes.footer}">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
