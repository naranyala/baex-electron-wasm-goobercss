import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as wasm from '../../../../core/rust/pkg/wasm_rust';
import { rustState } from '../reactivity/RustState';

describe('RustState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Since rustState is a singleton, it might have been initialized already.
    // We can manually call sync if we want to test with a specific mock.
    vi.spyOn(wasm, 'get_app_state').mockReturnValue({
      userName: 'MockUser',
      theme: 'light',
      projectName: 'MockProject',
      isLoading: false,
      notifications: []
    } as any);
  });

  it('should allow syncing state from Rust', () => {
    // Manually trigger sync for testing since constructor already ran
    (rustState as any).sync();
    
    expect(rustState.userName.get()).toBe('MockUser');
    expect(rustState.projectName.get()).toBe('MockProject');
    expect(wasm.get_app_state).toHaveBeenCalled();
  });

  it('should dispatch commands and update signals', () => {
    vi.spyOn(wasm, 'dispatch_app_command').mockReturnValue({
      userName: 'MockUser',
      theme: 'light',
      projectName: 'New Project Name',
      isLoading: false,
      notifications: []
    } as any);

    rustState.dispatch('SetProjectName', { name: 'New Project Name' });
    
    expect(wasm.dispatch_app_command).toHaveBeenCalled();
    expect(rustState.projectName.get()).toBe('New Project Name');
  });
});
