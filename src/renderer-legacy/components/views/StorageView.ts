import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    padding: 60px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 750px;
    margin: 0 auto;
    color: ${theme.subtitleColor};
  `,
  card: css`
    background: #161b22;
    border: 1px solid ${theme.borderColor};
    border-radius: 12px;
    padding: 24px;
    margin-top: 24px;
  `,
  button: css`
    background: ${theme.accentColor};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  `,
  input: css`
    background: #0d1117;
    border: 1px solid ${theme.borderColor};
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    width: 100%;
    margin-bottom: 16px;
  `,
  item: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid ${theme.borderColor};
    &:last-child { border-bottom: none; }
  `
};

const refreshStorage = (setState: any) => {
  const items: { key: string; value: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    items.push({ key, value: localStorage.key(i) ? localStorage.getItem(key)! : '' });
  }
  setState(() => ({ items }));
};

export const StorageView = defineComponent({
  name: 'storage-view',
  useShadow: false,
  initialState: {
    items: [] as { key: string; value: string }[],
    newKey: '',
    newValue: ''
  },
  mounted: (el: any) => {
    refreshStorage(el.setState.bind(el));
  },
  render: (state) => html`
    <div class="${styles.container}">
      <h1>Web Storage API</h1>
      <p>Manage data in LocalStorage.</p>
      
      <div class="${styles.card}">
        <h3>Add New Item</h3>
        <input type="text" class="${styles.input}" placeholder="Key" data-bind="newKey" data-action="bind-input" value="${state.newKey}" />
        <input type="text" class="${styles.input}" placeholder="Value" data-bind="newValue" data-action="bind-input" value="${state.newValue}" />
        <button class="${styles.button}" data-action="add-item">Add to LocalStorage</button>
      </div>
      
      <div class="${styles.card}">
        <h3>Current Items (${state.items.length})</h3>
        ${state.items.length === 0 ? html`<p>No items in LocalStorage.</p>` : html`
          <div>
            ${state.items.map(item => html`
              <div class="${styles.item}">
                <div>
                  <strong>${item.key}</strong>: ${item.value}
                </div>
                <button style="background: #da3633; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;" data-action="delete-item" data-key="${item.key}">Delete</button>
              </div>
            `)}
          </div>
        `}
        <button class="${styles.button}" style="margin-top: 20px; background: #30363d;" data-action="clear-all">Clear All</button>
      </div>
    </div>
  `,
  events: {
    'input [data-action="bind-input"]': (_, { setState, target }) => {
      const el = target as HTMLInputElement;
      const key = el.getAttribute('data-bind') as string;
      setState(() => ({ [key]: el.value } as any));
    },
    'click [data-action="add-item"]': (_e, { state, setState }) => {
      if (state.newKey && state.newValue) {
        localStorage.setItem(state.newKey, state.newValue);
        setState(() => ({ newKey: '', newValue: '' }));
        refreshStorage(setState);
      }
    },
    'click [data-action="delete-item"]': (_e, { setState, target }) => {
      const key = target.getAttribute('data-key')!;
      localStorage.removeItem(key);
      refreshStorage(setState);
    },
    'click [data-action="clear-all"]': (_e, { setState }) => {
      localStorage.clear();
      refreshStorage(setState);
    }
  }
});
