import { describe, it, expect } from 'vitest';
import './ParentChild';

describe('ParentChild', () => {
  it('should update parent message when child sends event', () => {
    const el = document.createElement('exba-parent');
    document.body.appendChild(el);
    
    const child = el.shadowRoot?.querySelector('exba-child');
    const childBtn = child?.shadowRoot?.querySelector('#msg-btn');
    
    childBtn?.click();
    
    const strong = el.shadowRoot?.querySelector('strong');
    expect(strong?.textContent).toBe('Hello from Child!');
  });
});
