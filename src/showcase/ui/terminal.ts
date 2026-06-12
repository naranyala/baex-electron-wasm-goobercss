import { ExbaComponent } from '../../kernel';
import { customElement, wasmCall, wasmCommand, wasmState, eventListener } from '../../kernel';
import { EXBA } from '../../kernel';
import { t } from '../../shell/styles';

/**
 * A fully interactive terminal emulator UI component.
 * Demonstrates complex Rust WASM calling patterns (direct functions & bytecode execution)
 * and reactive synchronization with the global state.
 */
@customElement('exba-terminal')
export class TerminalComponent extends ExbaComponent {
  static useShadow = true;

  @wasmState('userName') userName!: string;
  @wasmState('theme') theme!: string;
  @wasmState('projectName') projectName!: string;

  @wasmCall() add!: (a: number, b: number) => Promise<number>;
  @wasmCall() fibonacci!: (n: number) => Promise<number>;

  @wasmCommand('Factorial') runFactorial!: (payload: { n: number }) => Promise<any>;
  @wasmCommand('PalindromeCheck') runPalindrome!: (payload: { text: string }) => Promise<any>;
  @wasmCommand('SystemFetch') runSystemFetch!: () => Promise<any>;
  @wasmCommand('Greet') runGreet!: (payload: { name: string }) => Promise<any>;

  /** Monospace styles for a realistic CLI appearance. */
  static styles = {
    container: `padding: 2rem; background: ${t.zinc950}; border-radius: 1.25rem; border: 1px solid ${t.zinc800a}; font-family: 'SF Mono', 'Fira Code', monospace; color: ${t.zinc300}; display: flex; flex-direction: column; height: 500px; box-sizing: border-box; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);`,
    header: `display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid ${t.zinc800a};`,
    title: `font-size: 0.75rem; color: ${t.zinc500};`,
    controls: 'display: flex; gap: 0.5rem;',
    dot: 'width: 0.75rem; height: 0.75rem; border-radius: 50%;',
    red: 'background: #ff5f56;',
    yellow: 'background: #ffbd2e;',
    green: 'background: #27c93f;',
    output: 'flex: 1; overflow-y: auto; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1rem; padding-right: 0.5rem; scroll-behavior: smooth;',
    line: 'margin-bottom: 0.25rem; white-space: pre-wrap;',
    inputRow: 'display: flex; align-items: center; font-size: 0.875rem; margin-top: auto;',
    prompt: `color: ${t.emerald400}; margin-right: 0.5rem; font-weight: bold; white-space: nowrap;`,
    cmd: `color: ${t.white};`,
    input: `flex: 1; background: transparent; border: none; outline: none; color: ${t.white}; font-family: inherit; font-size: inherit; padding: 0;`
  };

  protected onMount() {
    this.setState({
      history: [
        'Welcome to EXBA Interactive Wasm Shell v1.0.0',
        'Rust WASM engine initialized and active.',
        'Type "help" to see available commands.',
        ''
      ]
    });

    // Initial focus
    setTimeout(() => {
      const input = this.shadowRoot?.querySelector('#terminal-input') as HTMLInputElement;
      input?.focus();
    }, 50);
  }

  @eventListener('#terminal-input', 'keydown')
  protected handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement;
      const val = input.value;
      input.value = '';
      this.processCommand(val);
    }
  }

  @eventListener('.container', 'click')
  protected handleContainerClick() {
    const input = this.shadowRoot?.querySelector('#terminal-input') as HTMLInputElement;
    input?.focus();
  }


  async processCommand(commandStr: string) {
    const trimmed = commandStr.trim();
    if (!trimmed) return;

    const history = [...(this.state.history || [])];
    const username = this.userName || 'visitor';
    history.push(`<span style="color: ${t.emerald400}; font-weight: bold;">${username}@exba-wasm:~$</span> <span style="color: ${t.white};">${trimmed}</span>`);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        history.push(`Available commands:
  help               Show this help message
  clear              Clear terminal history
  add &lt;a&gt; &lt;b&gt;        Add two integers via direct Rust WASM call
  fib &lt;n&gt;            Calculate Fibonacci(n) via direct Rust WASM call
  fact &lt;n&gt;           Calculate Factorial(n) via Rust bytecode
  palindrome &lt;txt&gt;   Check if string is palindrome via Rust bytecode
  neofetch           Retrieve system specs via Rust bytecode SystemFetch
  greet &lt;name&gt;       Greet name & change page title via Rust bytecode
  state              Display global AppState (synced with Rust)
  name &lt;new_name&gt;    Update userName in Rust AppState
  theme &lt;light/dark&gt; Update theme in Rust AppState
  reset              Reset global state to defaults`);
        break;

      case 'clear':
        this.setState({ history: [] });
        return;

      case 'add': {
        if (args.length < 2) {
          history.push('<span style="color: #ef4444;">Error: add requires two integers, e.g. "add 5 10"</span>');
        } else {
          const a = parseInt(args[0], 10);
          const b = parseInt(args[1], 10);
          if (isNaN(a) || isNaN(b)) {
            history.push('<span style="color: #ef4444;">Error: invalid integers</span>');
          } else {
            try {
              const result = await this.add(a, b);
              history.push(`Result: ${result}`);
            } catch (e) {
              history.push(`<span style="color: #ef4444;">Execution failed: ${e}</span>`);
            }
          }
        }
        break;
      }

      case 'fib': {
        if (args.length < 1) {
          history.push('<span style="color: #ef4444;">Error: fib requires one integer, e.g. "fib 10"</span>');
        } else {
          const n = parseInt(args[0], 10);
          if (isNaN(n) || n < 0) {
            history.push('<span style="color: #ef4444;">Error: invalid integer</span>');
          } else {
            try {
              const result = await this.fibonacci(n);
              history.push(`Fibonacci(${n}) = ${result}`);
            } catch (e) {
              history.push(`<span style="color: #ef4444;">Execution failed: ${e}</span>`);
            }
          }
        }
        break;
      }

      case 'fact': {
        if (args.length < 1) {
          history.push('<span style="color: #ef4444;">Error: fact requires one integer, e.g. "fact 10"</span>');
        } else {
          const n = parseInt(args[0], 10);
          if (isNaN(n) || n < 0) {
            history.push('<span style="color: #ef4444;">Error: invalid integer</span>');
          } else {
            try {
              const irResult = await this.runFactorial({ n });
              if (irResult.type === 'Number') {
                history.push(`Factorial(${n}) = ${irResult.payload}`);
              } else {
                history.push(`Result: ${JSON.stringify(irResult)}`);
              }
            } catch (e) {
              history.push(`<span style="color: #ef4444;">Execution failed: ${e}</span>`);
            }
          }
        }
        break;
      }

      case 'palindrome': {
        if (args.length < 1) {
          history.push('<span style="color: #ef4444;">Error: palindrome requires text, e.g. "palindrome racecar"</span>');
        } else {
          const text = args.join(' ');
          try {
            const irResult = await this.runPalindrome({ text });
            if (irResult.type === 'Number') {
              const isPal = irResult.payload === 1;
              history.push(`"${text}" is ${isPal ? '' : 'NOT '}a palindrome.`);
            } else {
              history.push(`Result: ${JSON.stringify(irResult)}`);
            }
          } catch (e) {
            history.push(`<span style="color: #ef4444;">Execution failed: ${e}</span>`);
          }
        }
        break;
      }

      case 'neofetch': {
        try {
          const irResult = await this.runSystemFetch();
          if (irResult.type === 'SystemInfo') {
            history.push(irResult.payload.report);
          } else {
            history.push(`Result: ${JSON.stringify(irResult)}`);
          }
        } catch (e) {
          history.push(`<span style="color: #ef4444;">Execution failed: ${e}</span>`);
        }
        break;
      }

      case 'greet': {
        if (args.length < 1) {
          history.push('<span style="color: #ef4444;">Error: greet requires a name, e.g. "greet Antigravity"</span>');
        } else {
          const name = args.join(' ');
          try {
            await this.runGreet({ name });
            history.push(`Greeted "${name}". Check browser tab title!`);
          } catch (e) {
            history.push(`<span style="color: #ef4444;">Execution failed: ${e}</span>`);
          }
        }
        break;
      }

      case 'state': {
        try {
          const stateVal = await EXBA.api.wasm_get_app_state();
          history.push(JSON.stringify(stateVal, null, 2));
        } catch (e) {
          history.push(`<span style="color: #ef4444;">Failed to get state: ${e}</span>`);
        }
        break;
      }

      case 'name': {
        if (args.length < 1) {
          history.push('<span style="color: #ef4444;">Error: name requires a new username, e.g. "name Antigravity"</span>');
        } else {
          const newName = args.join(' ');
          this.userName = newName;
          history.push(`Username updated to "${newName}".`);
        }
        break;
      }

      case 'theme': {
        if (args.length < 1 || (args[0] !== 'light' && args[0] !== 'dark')) {
          history.push('<span style="color: #ef4444;">Error: theme requires light or dark, e.g. "theme light"</span>');
        } else {
          const newTheme = args[0];
          this.theme = newTheme;
          history.push(`Theme updated to "${newTheme}".`);
        }
        break;
      }

      case 'project': {
        if (args.length < 1) {
          history.push('<span style="color: #ef4444;">Error: project requires a project name, e.g. "project ExtensionWasm"</span>');
        } else {
          const newProj = args.join(' ');
          this.projectName = newProj;
          history.push(`Project name updated to "${newProj}".`);
        }
        break;
      }

      case 'reset': {
        try {
          const patch = JSON.stringify({ type: 'ResetState', payload: null });
          const wasmUpdate = (window as any).wasm_update_app_state || EXBA.wasmModule.wasm_update_app_state;
          if (typeof wasmUpdate === 'function') {
            wasmUpdate(patch);
          }
          if (EXBA.state) {
            EXBA.state.sync();
          }
          history.push('Global AppState reset to defaults.');
        } catch (e) {
          history.push(`<span style="color: #ef4444;">Reset failed: ${e}</span>`);
        }
        break;
      }

      default:
        history.push(`sh: command not found: ${cmd}. Type 'help' for available commands.`);
    }

    this.setState({ history });

    // Scroll output to bottom
    setTimeout(() => {
      const outputDiv = this.shadowRoot?.querySelector('.output');
      if (outputDiv) {
        outputDiv.scrollTop = outputDiv.scrollHeight;
      }
    }, 10);
  }

  render() {
    const history = this.state.history || [];
    const username = this.userName || 'visitor';
    return `
      <div class="container">
        <div class="header">
          <div class="title">Terminal Simulation — Active WASM Core</div>
          <div class="controls">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
        </div>
        <div class="output">
          ${history.map((line: string) => `<div class="line">${line}</div>`).join('')}
        </div>
        <div class="inputRow">
          <span class="prompt">${username}@exba-wasm:~$</span>
          <input type="text" class="input" id="terminal-input" placeholder="Type command..." />
        </div>
      </div>
    `;
  }
}

