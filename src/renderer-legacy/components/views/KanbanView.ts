import { css } from 'goober';
import { defineComponent } from '../../core/ui/Component.js';
import { html } from '../../core/ui/Templates.js';
import { theme } from '../../styles/theme.ts';

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  `,
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  title: css`
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    background: ${theme.accentGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,
  board: css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    flex: 1;
    min-height: 400px;
  `,
  column: css`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radiusLg};
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.75rem;
  `,
  columnHeader: css`
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${theme.textDim};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid ${theme.border};
  `,
  taskCount: css`
    background: ${theme.border};
    color: ${theme.textMuted};
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.7rem;
  `,
  taskList: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  `,
  task: css`
    background: ${theme.elevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius};
    padding: 0.875rem;
    font-size: 0.875rem;
    color: ${theme.text};
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.15s ease;
    cursor: default;
    &:hover {
      border-color: ${theme.accent};
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  `,
  taskActions: css`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  `,
  actionBtn: css`
    background: none;
    border: none;
    color: ${theme.textMuted};
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s;
    &:hover {
      background: ${theme.border};
      color: ${theme.text};
    }
  `
};

type TaskStatus = 'todo' | 'doing' | 'done';

interface Task {
  id: string;
  text: string;
  status: TaskStatus;
}

export const KanbanView = defineComponent({
  name: 'kanban-view',
  useShadow: false,
  initialState: {
    tasks: [
      { id: '1', text: 'Initialize EXBA Framework', status: 'done' },
      { id: '2', text: 'Develop Kanban Component', status: 'done' },
      { id: '3', text: 'Implement Drag & Drop Support', status: 'done' },
      { id: '4', text: 'Refactor for Performance', status: 'doing' },
      { id: '5', text: 'Add Rust-based Persistence', status: 'todo' },
    ] as Task[]
  },
  events: {
    'dragstart [data-action="drag-task"]': (e: any) => {
      e.dataTransfer.setData('text/plain', e.currentTarget.dataset.id);
      e.currentTarget.style.opacity = '0.5';
    },
    'dragend [data-action="drag-task"]': (e: any) => {
      e.currentTarget.style.opacity = '1';
    },
    'dragover [data-action="drop-zone"]': (e: any) => {
      e.preventDefault();
      const col = e.currentTarget;
      col.style.borderColor = theme.accent;
      col.style.background = 'rgba(59, 130, 246, 0.05)';
    },
    'dragleave [data-action="drop-zone"]': (e: any) => {
      const col = e.currentTarget;
      col.style.borderColor = theme.border;
      col.style.background = theme.surface;
    },
    'drop [data-action="drop-zone"]': (e: any, { state, setState }) => {
      e.preventDefault();
      const col = e.currentTarget;
      col.style.borderColor = theme.border;
      col.style.background = theme.surface;
      
      const id = e.dataTransfer.getData('text/plain');
      const newStatus = col.dataset.status as TaskStatus;
      
      if (id && newStatus) {
        setState(() => ({
          tasks: state.tasks.map((t: Task) => 
            t.id === id ? { ...t, status: newStatus } : t
          )
        }));
      }
    },
    'click [data-action="add-task"]': (_e, { state, setState }) => {
      const text = prompt('Task description:');
      if (text) {
        const newTask: Task = {
          id: Date.now().toString(),
          text,
          status: 'todo'
        };
        setState(() => ({ tasks: [...state.tasks, newTask] }));
      }
    },
    'click [data-action="move-next"]': (e, { state, setState }) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      setState(() => ({
        tasks: state.tasks.map((t: Task) => {
          if (t.id === id) {
            const nextStatus: Record<TaskStatus, TaskStatus> = {
              'todo': 'doing',
              'doing': 'done',
              'done': 'done'
            };
            return { ...t, status: nextStatus[t.status] };
          }
          return t;
        })
      }));
    },
    'click [data-action="move-prev"]': (e, { state, setState }) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      setState(() => ({
        tasks: state.tasks.map((t: Task) => {
          if (t.id === id) {
            const prevStatus: Record<TaskStatus, TaskStatus> = {
              'todo': 'todo',
              'doing': 'todo',
              'done': 'doing'
            };
            return { ...t, status: prevStatus[t.status] };
          }
          return t;
        })
      }));
    },
    'click [data-action="delete-task"]': (e, { state, setState }) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (confirm('Delete this task?')) {
        setState(() => ({
          tasks: state.tasks.filter((t: Task) => t.id !== id)
        }));
      }
    }
  },
  render: (state) => {
    const columns: { label: string; status: TaskStatus }[] = [
      { label: 'To Do', status: 'todo' },
      { label: 'In Progress', status: 'doing' },
      { label: 'Completed', status: 'done' }
    ];

    const renderTask = (task: Task) => html`
      <div class="${styles.task}" draggable="true" data-action="drag-task" data-id="${task.id}">
        <div>${task.text}</div>
        <div class="${styles.taskActions}">
          ${task.status !== 'todo' ? html`
            <button class="${styles.actionBtn}" data-action="move-prev" data-id="${task.id}" title="Move back">←</button>
          ` : ''}
          <button class="${styles.actionBtn}" style="color: #ef4444;" data-action="delete-task" data-id="${task.id}" title="Delete">✕</button>
          ${task.status !== 'done' ? html`
            <button class="${styles.actionBtn}" data-action="move-next" data-id="${task.id}" title="Move forward">→</button>
          ` : ''}
        </div>
      </div>
    `;

    return html`
      <div class="${styles.container}">
        <div class="${styles.header}">
          <h2 class="${styles.title}">EXBA Kanban</h2>
          <button class="${theme.addButton}" data-action="add-task">＋ New Task</button>
        </div>
        
        <div class="${styles.board}">
          ${columns.map(col => {
            const colTasks = state.tasks.filter((t: Task) => t.status === col.status);
            return html`
              <div class="${styles.column}" data-action="drop-zone" data-status="${col.status}">
                <div class="${styles.columnHeader}">
                  <span>${col.label}</span>
                  <span class="${styles.taskCount}">${colTasks.length}</span>
                </div>
                <div class="${styles.taskList}">
                  ${colTasks.map((t: Task) => renderTask(t))}
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
});
