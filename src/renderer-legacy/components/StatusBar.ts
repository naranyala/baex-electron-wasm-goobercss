import { defineComponent } from '../core/ui/Component.js';
import { rustState } from '../core/reactivity/RustState.js';
import { styles } from '../styles/theme.ts';
import { html } from '../core/ui/Templates.js';

export const StatusBar = defineComponent({
  name: 'status-bar',
  useShadow: false,
  initialState: {
    projectName: rustState.projectName.get()
  },
  render: (state) => html`
    <div class="${styles.statusBar}">
      <div class="${styles.statusMeta}">
        <span class="${styles.statusDot}"></span>
        <span id="status-project">${state.projectName}</span>
      </div>
      <span style="flex: 1;"></span>
      <div class="${styles.statusMeta}">
        WASM: Core Active
        <span class="${styles.statusDivider}"></span>
        State: Rust-Driven
      </div>
    </div>
  `,
  bindings: {
    text: {
      '#status-project': () => rustState.projectName.get(),
    }
  }
});
