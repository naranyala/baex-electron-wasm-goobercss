import { describe, expect, it } from 'vitest';
import './index';

describe('tab-bar component', () => {
  it('should render', () => {
    document.body.innerHTML =
      '<tab-bar id="test-tab-bar" data-testid="test-tab-bar"></tab-bar>';
    const tabBar = document.querySelector('[data-testid="test-tab-bar"]');
    expect(tabBar).toBeDefined();
  });
});
