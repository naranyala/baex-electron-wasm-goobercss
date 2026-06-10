import { ExbaComponent } from '../../framework/core/component';
import { EXBA } from '../../framework/core/exba';
import { ease, t } from '../../styles';

export class KanbanComponent extends ExbaComponent {
  static useShadow = true;
  
  static styles = {
    container: 'padding: 2rem; width: 100%; max-width: 1100px; margin: 0 auto; min-height: 80vh;',
    header: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;',
    title: 'font-size: 1.75rem; font-weight: 800; color: ${t.zinc100}; letter-spacing: -0.02em;',
    board: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;',
    column: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1.25rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; backdrop-filter: blur(8px);`,
    colHeader: 'display: flex; align-items: center; justify-content: space-between; padding: 0 0.25rem;',
    colTitle: `font-size: 0.75rem; font-weight: 800; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.1em;`,
    colCount: `font-size: 0.75rem; background: ${t.zinc800}; color: ${t.zinc400}; padding: 0.125rem 0.5rem; border-radius: 1rem;`,
    taskList: 'flex: 1; display: flex; flex-direction: column; gap: 1rem; min-height: 200px;',
    task: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; border-radius: 1rem; padding: 1.25rem; cursor: pointer; transition: all ${ease}; position: relative; overflow: hidden;`,
    taskActive: `&:hover { transform: translateY(-4px) scale(1.02); border-color: ${t.indigo500}; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3); }`,
    taskTitle: `font-size: 1rem; font-weight: 600; color: ${t.zinc100}; margin-bottom: 0.75rem; line-height: 1.4;`,
    taskFooter: 'display: flex; justify-content: space-between; align-items: center; margin-top: auto;',
    priority: 'font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 0.375rem; text-transform: uppercase;',
    priorityHigh: `background: rgba(220, 38, 38, 0.2); color: #f87171;`,
    priorityMedium: `background: rgba(245, 158, 11, 0.2); color: #fbbf24;`,
    priorityLow: `background: rgba(5, 150, 105, 0.2); color: #34d399;`,
    tagRow: 'display: flex; gap: 0.375rem; flex-wrap: wrap;',
    tag: `font-size: 0.65rem; color: ${t.zinc500}; background: ${t.zinc900}; padding: 0.125rem 0.375rem; border-radius: 0.25rem; border: 1px solid ${t.zinc800};`,
    empty: 'flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${t.zinc700}; border: 2px dashed ${t.zinc800a}; border-radius: 1rem; gap: 0.5rem;',
    emptyIcon: 'font-size: 1.5rem; opacity: 0.5;',
    btn: `padding: 0.625rem; background: transparent; border: 1px dashed ${t.zinc700}; border-radius: 0.75rem; color: ${t.zinc500}; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;`,
    btnHover: `&:hover { background: ${t.zinc800}; color: ${t.zinc200}; border-style: solid; border-color: ${t.zinc600}; }`
  };

  protected async onMount() {
    this.refresh();
  }

  private async refresh() {
    try {
      const res = await EXBA.callBridge<any>('process_ir', JSON.stringify({
        type: 'KanbanFetch',
        payload: null
      }));
      
      if (res.type === 'KanbanData') {
        this.setState({ tasks: res.payload });
      }
    } catch (e) {
      console.error('Failed to fetch kanban tasks', e);
    }
  }

  private async moveTask(id: string) {
    try {
      const res = await EXBA.callBridge<any>('process_ir', JSON.stringify({
        type: 'MoveTask',
        payload: { id }
      }));
      
      if (res.type === 'KanbanData') {
        const tasks = res.payload;
        const task = tasks.find((t: any) => t.id === id);
        if (task) {
          EXBA.notify('activity', {
            id: Math.random().toString(36).substr(2, 9),
            icon: '📋',
            msg: `Task "${task.title}" moved to ${task.col.toUpperCase()}`,
            time: new Date().toLocaleTimeString()
          });
        }
        this.setState({ tasks });
      }
    } catch (e) {
      console.error('Failed to move task', e);
    }
  }

  render() {
    const tasks = this.state.tasks || [];
    const columns = [
      { id: 'todo', title: 'To Do' },
      { id: 'in-progress', title: 'In Progress' },
      { id: 'done', title: 'Done' }
    ];

    return `
      <div class="container">
        <header class="header">
          <h1 class="title">Engineering Board</h1>
          <div style="color: ${t.zinc500}; font-size: 0.875rem;">WASM-managed state</div>
        </header>
        
        <div class="board">
          ${columns.map(col => {
            const colTasks = tasks.filter((t: any) => t.col === col.id);
            return `
              <div class="column">
                <div class="colHeader">
                  <div class="colTitle">${col.title}</div>
                  <div class="colCount">${colTasks.length}</div>
                </div>
                <div class="taskList">
                  ${colTasks.length > 0 
                    ? colTasks.map((t: any) => `
                      <div class="task taskActive" onclick="window.dispatchKanbanMove('${t.id}')">
                        <div class="taskTitle">${t.title}</div>
                        <div class="tagRow">
                          ${t.tags.map((tag: string) => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                        <div class="taskFooter">
                          <span class="priority priority${t.priority}">${t.priority}</span>
                          <span style="color: ${t.zinc600}; font-size: 0.65rem;">ID-${t.id}</span>
                        </div>
                      </div>
                    `).join('')
                    : `
                      <div class="empty">
                        <span class="emptyIcon">📭</span>
                        <span>Empty</span>
                      </div>
                    `
                  }
                </div>
                <button class="btn btnHover" onclick="alert('Not implemented')">
                  <span>+</span> New Task
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    (window as any).dispatchKanbanMove = (id: string) => this.moveTask(id);
  }
}

customElements.define('exba-kanban', KanbanComponent);
