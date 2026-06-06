import { BaseComponent } from '../../src/renderer/framework/BaseComponent';
import { createReactiveState } from '../../src/renderer/framework/ReactiveState';
import { css } from 'goober';

const styles = css`
  .container {
    padding: 1rem;
    border: 1px solid #3f3f46;
    border-radius: 0.5rem;
    background: #27272a;
    color: white;
    max-width: 300px;
  }
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  input {
    flex: 1;
    padding: 0.25rem;
    background: #18181b;
    color: white;
    border: 1px solid #3f3f46;
  }
  ul { list-style: none; padding: 0; }
  li {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    border-bottom: 1px solid #3f3f46;
  }
  .delete-btn {
    color: #ef4444;
    cursor: pointer;
    border: none;
    background: none;
  }
`;

export class TodoList extends BaseComponent {
  state = createReactiveState({ items: [] as string[] }, () => this.update());

  render() {
    this.shadow.innerHTML = `
      <style>${styles}</style>
      <div class="container">
        <h3>BAEX Todos</h3>
        <div class="input-group">
          <input type="text" id="todo-input" placeholder="New task...">
          <button id="add-btn">Add</button>
        </div>
        <ul id="list">
          ${this.state.items.map((item, idx) => `
            <li>
              ${item} 
              <button class="delete-btn" data-index="${idx}">×</button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    const input = this.shadow.getElementById('todo-input') as HTMLInputElement;
    this.shadow.getElementById('add-btn')?.addEventListener('click', () => {
      if (input.value) {
        this.state.items = [...this.state.items, input.value];
        input.value = '';
      }
    });

    this.shadow.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.target as HTMLElement).dataset.index || '0');
        this.state.items = this.state.items.filter((_, i) => i !== idx);
      });
    });
  }
}

customElements.define('baex-todo-list', TodoList);
