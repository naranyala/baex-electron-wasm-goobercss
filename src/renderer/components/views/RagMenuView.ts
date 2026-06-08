import { theme, menuItem, menuGrid } from '../../styles/theme.ts';

/**
 * A high-level menu view for the RAG (Retrieval-Augmented Generation) pipeline.
 * Organizes system capabilities into functional categories like Ingestion, Embedding, and Generation.
 */
export const RagMenuView = {
    /** Unique identifier for the component. */
    name: 'rag-menu-view',
    /** Initial state for the menu view. */
    initialState: {
        /** The currently active category. */
        activeCategory: 'Ingestion'
    },
    /**
     * Renders the RAG capability grid.
     * Maps a predefined category list to a grid of interactive menu items.
     */
    render: (_state: any) => {
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
        return `
      <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1.5rem;">
        ${Object.entries(categories).map(([catName, items]) => `
          <div class="rag-category-section">
            <h3 style="font-size: 0.875rem; color: ${theme.textDim}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">${catName}</h3>
            <div class="${menuGrid}">
              ${items.map(item => `
                <div class="${menuItem}" data-rag-id="${item.id}" data-category="${catName}">
                  <div style="font-size: 1.75rem; line-height: 1;">${item.icon}</div>
                  <div style="margin-top: 0.375rem; font-size: 0.875rem;">${item.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    },
    /**
     * Lifecycle hook: attaches click listeners to the menu grid.
     * @param {HTMLElement} el - The root element of the component.
     */
    mounted: (el: any) => {
        el.addEventListener('click', (e: Event) => {
            const target = e.target as HTMLElement | null;
            const id = target?.closest('[data-rag-id]')?.getAttribute('data-rag-id');
            if (id) {
                console.log(`RAG Module Selected: ${id}`);
                // In a real app, this would navigate to the specific module view
            }
        });
    }
};
