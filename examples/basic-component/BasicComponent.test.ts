import { describe, it, expect } from 'vitest';
import './BasicComponent';

describe('BasicComponent', () => {
  it('should render the correct title', () => {
    const el = document.createElement('exba-basic-component');
    document.body.appendChild(el);
    
    const h1 = el.shadowRoot?.querySelector('h1');
    expect(h1?.textContent).toBe('Hello EXBA!');
  });
});
