import { createSignal } from './Reactivity';
import * as wasm from '../../../../core/rust/pkg/wasm_rust';

export interface AppState {
  userName: string;
  theme: string;
  projectName: string;
  isLoading: boolean;
  notifications: string[];
}

class RustStateStore {
  // Local signals that mirror the Rust state
  // This allows TS components to stay reactive without polling Rust
  public userName = createSignal('Guest');
  public theme = createSignal('dark');
  public projectName = createSignal('New Project');
  public isLoading = createSignal(false);
  public notifications = createSignal<string[]>([]);

  constructor() {
    // We don't sync in constructor anymore because WASM needs async initialization
  }

  /**
   * Initializes the WASM module and syncs initial state
   */
  public async initialize() {
    try {
      // @ts-ignore - wasm.default is the init function for web target
      await wasm.default();
      this.sync();
      console.log('Rust state initialized and synced');
    } catch (e) {
      console.error('Failed to initialize WASM in main thread:', e);
    }
  }

  /**
   * Initial sync to get the current state from Rust
   */
  public sync() {
    try {
      const state = wasm.get_app_state() as AppState;
      this.updateSignals(state);
    } catch (e) {
      console.error('Failed to sync with Rust state:', e);
    }
  }

  /**
   * Updates TS signals based on a state object from Rust
   */
  private updateSignals(state: AppState) {
    this.userName.set(state.userName);
    this.theme.set(state.theme);
    this.projectName.set(state.projectName);
    this.isLoading.set(state.isLoading);
    this.notifications.set(state.notifications);
  }

  /**
   * Dispatches a command to Rust and updates local signals with the result
   */
  public dispatch(type: string, payload: any) {
    const command = JSON.stringify({ type, payload });
    try {
      const updatedState = wasm.dispatch_app_command(command) as AppState;
      this.updateSignals(updatedState);
    } catch (e) {
      console.error(`Rust dispatch error [${type}]:`, e);
    }
  }
}

export const rustState = new RustStateStore();
