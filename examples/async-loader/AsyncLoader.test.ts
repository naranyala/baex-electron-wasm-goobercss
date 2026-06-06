import { describe, it, expect, vi } from 'vitest';
import './AsyncLoader';

describe('AsyncLoader', () => {
  it('should show loading state then data', async () => {
    const el = document.createElement('baex-async-loader');
    document.body.appendChild(el);
    
    const btn = el.shadowRoot?.querySelector('#fetch-btn');
    btn?.click();
    
    expect(el.shadowRoot?.textContent).toContain('Loading...');
    
    // Wait for the mocked API call (1.5s)
    await new Promise(res => setTimeout(res, 1600));
    
    expect(el.shadowRoot?.textContent).toContain('🚀 Data fetched from BAEX API!');
  });
});
