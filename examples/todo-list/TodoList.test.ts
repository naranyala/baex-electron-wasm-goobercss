import { describe, it, expect } from 'vitest';
import './TodoList';

describe('TodoList', () => {
  it('should add a todo item', () => {
    const el = document.createElement('exba-todo-list');
    document.body.appendChild(el);
    
    const input = el.shadowRoot?.querySelector('#todo-input') as HTMLInputElement;
    const btn = el.shadowRoot?.querySelector('#add-btn');
    
    input.value = 'Test Todo';
    btn?.click();
    
    const list = el.shadowRoot?.querySelector('ul');
    expect(list?.innerHTML).toContain('Test Todo');
  });

  it('should delete a todo item', () => {
    const el = document.createElement('exba-todo-list');
    document.body.appendChild(el);
    
    const input = el.shadowRoot?.querySelector('#todo-input') as HTMLInputElement;
    const btn = el.shadowRoot?.querySelector('#add-btn');
    
    input.value = 'To Delete';
    btn?.click();
    
    const delBtn = el.shadowRoot?.querySelector('.delete-btn');
    delBtn?.click();
    
    const list = el.shadowRoot?.querySelector('ul');
    expect(list?.innerHTML).not.toContain('To Delete');
  });
});
