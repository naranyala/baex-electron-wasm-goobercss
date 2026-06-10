import { ExbaComponent, type ComponentProps } from '../core/component';
import { Context } from '../core/context';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
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

export class ThemeProvider extends ExbaComponent {
  static props: ComponentProps = {
    initialMode: 'string',
  };

  static styles = {
    themeWrapper: 'display: contents;',
  };

  private currentMode: ThemeMode = 'system';

  protected onMount() {
    this.currentMode = (this.state.initialMode as ThemeMode) || 'system';
    this.applyTheme();
  }

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

  private resolveMode(): ThemeMode {
    if (this.currentMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return this.currentMode;
  }

  private updateMode(mode: ThemeMode) {
    this.currentMode = mode;
    this.applyTheme();
    this.setState({ mode: this.currentMode });
  }

  render() {
    return `<div class="theme-wrapper">
      <slot></slot>
    </div>`;
  }
}

customElements.define('exba-theme-provider', ThemeProvider);
