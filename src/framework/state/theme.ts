import { ExbaComponent, type ComponentProps } from '../core/component';
import { Context } from '../core/context';

/**
 * Valid theme modes for the application.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Represents the structure of a theme state object.
 */
export interface ThemeState {
  /** The currently active mode. */
  mode: ThemeMode;
  /** A map of CSS variable names to color values. */
  colors: Record<string, string>;
}

const Themes = {
  light: {
    background: '#ffffff',
    foreground: '#1a1a1a',
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    border: '#e2e8f0',
    muted: '#f1f5f9',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f8fafc',
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#a78bfa',
    border: '#1e293b',
    muted: '#1e293b',
  },
};

/**
 * A provider component that manages the application's visual theme.
 * It injects CSS variables into the root document and provides the theme state
 * to child components via the Context API.
 */
export class ThemeProvider extends ExbaComponent {
  /**
   * Observed properties:
   * - initialMode: 'light', 'dark', or 'system' (defaults to 'system').
   */
  static props: ComponentProps = {
    initialMode: 'string',
  };

  static styles = {
    themeWrapper: 'display: contents;',
  };

  private currentMode: ThemeMode = 'system';

  /**
   * Initializes the theme mode from props and applies the initial theme.
   */
  protected onMount() {
    this.currentMode = (this.state.initialMode as ThemeMode) || 'system';
    this.applyTheme();
  }

  /**
   * Resolves the current colors and injects them as CSS variables into the document.
   * Also updates the Context provider for child components.
   */
  private applyTheme() {
    const mode = this.resolveMode();
    const colors = Themes[mode as keyof typeof Themes];

    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--exba-${key}`, value as string);
    });

    Context.provide(this as any, 'theme', {
      mode,
      colors,
      setMode: (m: ThemeMode) => this.updateMode(m),
    });
  }

  /**
   * Resolves the 'system' mode to either 'light' or 'dark' based on browser preferences.
   */
  private resolveMode(): ThemeMode {
    if (this.currentMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return this.currentMode;
  }

  /**
   * Updates the theme mode and triggers a re-application of styles.
   * @param mode The new theme mode.
   */
  private updateMode(mode: ThemeMode) {
    this.currentMode = mode;
    this.applyTheme();
    this.setState({ mode: this.currentMode });
  }

  /**
   * Renders a wrapper for the theme provider's children.
   */
  render() {
    return `<div class="theme-wrapper">
      <slot></slot>
    </div>`;
  }
}

customElements.define('exba-theme-provider', ThemeProvider);
