import { ExbaComponent } from './component';
import { property } from './decorators';
import { css } from 'goober';

/**
 * ExbaWidget: A Flutter-inspired base class for highly reusable UI components.
 * Supports design variants and composition-first rendering.
 */
export abstract class ExbaWidget extends ExbaComponent {
  /** The active variant for the widget (e.g., 'primary', 'outline', 'ghost') */
  @property('string') variant: string = 'default';

  /** 
   * Define design variants as a map of style objects.
   * Each variant can override base styles.
   */
  static variants: Record<string, Record<string, string>> = {
    default: {}
  };

  /**
   * Helper to merge base styles with the active variant's styles.
   * Uses Goober to generate dynamic class names.
   */
  protected useStyles(baseStyles: Record<string, string>) {
    const activeVariant = this.variant || 'default';
    const variantStyles = (this.constructor as typeof ExbaWidget).variants[activeVariant] || {};
    
    const classes: Record<string, string> = {};
    
    // Combine base styles with variant overrides
    const allKeys = new Set([...Object.keys(baseStyles), ...Object.keys(variantStyles)]);
    
    allKeys.forEach(key => {
      const combinedRules = `${baseStyles[key] || ''} ${variantStyles[key] || ''}`;
      classes[key] = css(combinedRules);
    });
    
    return classes;
  }

  /**
   * Standardized render method for widgets.
   * Subclasses should implement build() instead of render() to emphasize composition.
   */
  abstract build(classes: Record<string, string>): string;

  /**
   * Implements the core render loop, injecting the variant-aware classes.
   */
  render() {
    const rawStyles = (this.constructor as typeof ExbaComponent).styles;
    const baseStyles = typeof rawStyles === 'object' ? (rawStyles as Record<string, string>) : {};
    const classes = this.useStyles(baseStyles);
    return this.build(classes);
  }
}
