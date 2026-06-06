import { describe, it, expect } from 'vitest';
import './Counter';

describe('ReactiveCounter', () => {
  it('should increment count when increment button is clicked', () => {
    const el = document.createElement('baex-reactive-counter');
    document.body.appendChild(el);
    
    const btn = el.shadowRoot?.querySelector('#inc');
    btn?.click();
    
    const count = el.shadowRoot?.querySelector('.count');
    expect(count?.textContent).toBe('1');
  });

  it('should decrement count when decrement button is clicked', () => {
    const el = document.createElement('baex-reactive-counter');
    document.body.appendChild(el);
    
    const btn = el.shadowRoot?.querySelector('#dec');
    btn?.click();
    
    const count = el.shadowRoot?.querySelector('.count');
    expect(count?.textContent).toBe('-1');
  });
});
