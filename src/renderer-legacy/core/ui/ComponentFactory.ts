import { defineComponent } from './Component.js';
import { ComponentDefinition } from '../bridge/types.js';
import { html } from './Templates.js';
import { styles as theme } from '../../styles/theme.ts';


export interface DynamicComponentConfig {
  tag: string;
  title: string;
  initialState?: Record<string, any>;
  renderSchema: {
    type: 'text' | 'input' | 'container';
    label: string;
    binding?: string; // Path to state property
    children?: DynamicComponentConfig[];
  }[];
}

export class ComponentFactory {
  /**
   * Creates a ComponentDefinition from a dynamic configuration.
   * This allows for data-driven UI generation.
   */
  static createFromConfig(config: DynamicComponentConfig): ComponentDefinition<any> {
    return {
      name: config.tag,
      initialState: config.initialState || {},
      render: (state) => {
        // Map the render schema to an HTML template
        const content = config.renderSchema.map(item => {
          if (item.type === 'text') {
            return `<div class="${theme.menuLabel}">${item.label}: ${item.binding ? state[item.binding] : 'N/A'}</div>`;
          }
          if (item.type === 'input') {
            return `<div class="${theme.menuItem}">
              <label>${item.label}</label>
              <input type="text" value="${item.binding ? state[item.binding] : ''}" 
                     oninput="this.dispatchEvent(new CustomEvent('update-state', {detail: {key: '${item.binding}', value: this.value}}))">
            </div>`;
          }
          if (item.type === 'container') {
            return `<div class="${theme.sectionContainer}">${item.children?.map(c => `<div>${c.title}</div>`).join('') || ''}</div>`;
          }
          return '';
        }).join('');

        return html`
          <div class="${theme.appContainer}">
            <h3 class="${theme.sectionHeader}">${config.title}</h3>
            ${content}
          </div>
        `;
      },
      events: {
        'update-state': (e: any, { setState }) => {
          const { key, value } = e.detail;
          setState(() => ({ [key]: value }));
        }
      }
    };
  }

  /**
   * Helper to define and register a dynamic component in one call.
   */
  static registerDynamic(config: DynamicComponentConfig) {
    const definition = this.createFromConfig(config);
    defineComponent(definition);
  }
}
