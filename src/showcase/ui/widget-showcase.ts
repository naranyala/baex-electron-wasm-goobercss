import { ExbaComponent } from '../../kernel/core/component';
import { customElement } from '../../kernel/core/decorators';
import { t } from '../../shell/styles';
// Import widgets to ensure they are registered
import './button';
import './card';

/**
 * Showcase component for Flutter-inspired Widgets and Variants.
 */
@customElement('exba-widget-showcase')
export class WidgetShowcase extends ExbaComponent {
  render() {
    return `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 3rem; max-width: 800px; margin: 0 auto;">
        
        <section>
          <h2 style="color: ${t.zinc100}; margin-bottom: 1rem;">Button Variants</h2>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <exba-button variant="primary">Primary Action</exba-button>
            <exba-button variant="secondary">Secondary</exba-button>
            <exba-button variant="outline" icon="★">Outline</exba-button>
            <exba-button variant="ghost">Ghost</exba-button>
            <exba-button variant="danger" icon="×">Danger</exba-button>
            <exba-button variant="primary" disabled>Disabled</exba-button>
          </div>
        </section>

        <section>
          <h2 style="color: ${t.zinc100}; margin-bottom: 1rem;">Card Composition</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            
            <exba-card hoverable="true">
              <h3 slot="header" style="margin: 0; font-size: 1rem; color: ${t.zinc100};">Standard Card</h3>
              <p style="color: ${t.zinc400}; font-size: 0.875rem; line-height: 1.5;">
                This card uses the default variant and demonstrates slot-based composition for headers and footers.
              </p>
              <div slot="footer">
                <exba-button variant="ghost">Cancel</exba-button>
                <exba-button variant="primary">Confirm</exba-button>
              </div>
            </exba-card>

            <exba-card variant="glass" hoverable="true">
              <h3 slot="header" style="margin: 0; font-size: 1rem; color: ${t.indigo300};">Glass Variant</h3>
              <p style="color: ${t.zinc300}; font-size: 0.875rem; line-height: 1.5;">
                A Flutter-inspired 'glass' variant using backdrop-filters and transparent backgrounds for a modern look.
              </p>
              <div slot="footer">
                <exba-button variant="outline">Learn More</exba-button>
              </div>
            </exba-card>

          </div>
        </section>

        <section>
          <h2 style="color: ${t.zinc100}; margin-bottom: 1rem;">Nested Layouts</h2>
          <exba-card variant="outlined">
            <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; padding: 1rem;">
              <span style="color: ${t.zinc500}; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Outlined Variant</span>
              <div style="display: flex; gap: 0.5rem;">
                 <exba-button variant="secondary">Inner Widget 1</exba-button>
                 <exba-button variant="secondary">Inner Widget 2</exba-button>
              </div>
            </div>
          </exba-card>
        </section>

      </div>
    `;
  }
}
