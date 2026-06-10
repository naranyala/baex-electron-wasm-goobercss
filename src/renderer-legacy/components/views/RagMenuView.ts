import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';
import { css } from 'goober';

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.5rem;
  `,
  categoryHeader: css`
    font-size: 0.875rem;
    color: ${theme.subtitleColor};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  `
};

export const RagMenuView = defineComponent({
  name: 'rag-menu-view',
  useShadow: false,
  initialState: {
    activeCategory: 'Ingestion'
  },
  render: (_state) => {
    const categories = {
      'Ingestion': [
        { id: 'loader', label: 'Data Loader', icon: '📥' },
        { id: 'chunker', label: 'Chunking', icon: '✂️' }
      ],
      'Embedding': [
        { id: 'embedder', label: 'Embeddings', icon: '🧬' },
        { id: 'models', label: 'Models', icon: '🧠' }
      ],
      'Retrieval': [
        { id: 'search', label: 'Vector Search', icon: '🔍' },
        { id: 'context', label: 'Context Mgmt', icon: '📄' }
      ],
      'Generation': [
        { id: 'chat', label: 'Chat Engine', icon: '💬' },
        { id: 'prompt', label: 'Prompt Lab', icon: '📝' }
      ],
      'Evaluation': [
        { id: 'eval', label: 'Evaluator', icon: '📊' },
        { id: 'traces', label: 'Traces', icon: '🕵️' }
      ]
    };

    return html`
      <div class="${styles.wrapper}">
        ${Object.entries(categories).map(([catName, items]) => html`
          <div class="rag-category-section">
            <h3 class="${styles.categoryHeader}">${catName}</h3>
            <div class="${theme.menuGrid}">
              ${items.map(item => html`
                <div class="${theme.menuItem}" data-action="select-module" data-id="${item.id}">
                  <div style="font-size: 1.75rem; line-height: 1;">${item.icon}</div>
                  <div style="margin-top: 0.375rem; font-size: 0.875rem;">${item.label}</div>
                </div>
              `)}
            </div>
          </div>
        `)}
      </div>
    `;
  },
  events: {
    'click [data-action="select-module"]': (_e, { target }) => {
      const id = target.getAttribute('data-id');
      if (id) {
        console.log(`RAG Module Selected: ${id}`);
      }
    }
  }
});
