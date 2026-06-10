import { describe, it, expect, vi } from 'vitest';
import { createSignal, createEffect, createDerived } from '../reactivity/Reactivity';

describe('Reactivity System', () => {
  it('should notify subscribers when signal changes', () => {
    const count = createSignal(0);
    const subscriber = vi.fn();
    
    createEffect(() => {
      subscriber(count.get());
    });
    
    expect(subscriber).toHaveBeenCalledWith(0);
    
    count.set(1);
    expect(subscriber).toHaveBeenCalledWith(1);
    
    count.set(1); // Same value, should not trigger
    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  it('should support derived signals', () => {
    const count = createSignal(2);
    const doubled = createDerived(count, c => c * 2);
    
    expect(doubled.get()).toBe(4);
    
    count.set(5);
    expect(doubled.get()).toBe(10);
  });

  it('should handle complex dependency graphs', () => {
    const firstName = createSignal('John');
    const lastName = createSignal('Doe');
    const fullName = createDerived(firstName, f => `${f} ${lastName.get()}`);
    
    const subscriber = vi.fn();
    createEffect(() => {
      subscriber(fullName.get());
    });
    
    expect(subscriber).toHaveBeenCalledWith('John Doe');
    
    firstName.set('Jane');
    expect(subscriber).toHaveBeenCalledWith('Jane Doe');
    
    lastName.set('Smith');
    expect(subscriber).toHaveBeenCalledWith('Jane Smith');
  });

  it('should cleanup effects', () => {
    const signal = createSignal(0);
    const subscriber = vi.fn();
    const cleanup = createEffect(() => {
      subscriber(signal.get());
    });
    
    expect(subscriber).toHaveBeenCalledTimes(1);
    
    cleanup();
    
    signal.set(1);
    expect(subscriber).toHaveBeenCalledTimes(1);
  });
});
