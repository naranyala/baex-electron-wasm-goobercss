import { describe, it, expect, vi } from 'vitest';
import { createReactiveState } from './ReactiveState';

describe('ReactiveState', () => {
  it('should call onMutation when state changes', () => {
    const onMutation = vi.fn();
    const state = createReactiveState({ count: 0 }, onMutation);
    
    state.count = 1;
    
    expect(onMutation).toHaveBeenCalledTimes(1);
    expect(state.count).toBe(1);
  });
});
