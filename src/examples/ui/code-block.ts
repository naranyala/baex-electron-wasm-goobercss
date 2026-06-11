import { ExbaComponent, type ComponentProps } from '../../framework/core/component';
import { t, ease, styles as globalStyles } from '../../app/styles';

/**
 * A sophisticated code block component with syntax highlighting and copy-to-clipboard.
 * Demonstrates internal state management for the 'Copied' feedback and 
 * regex-based syntax highlighting for TypeScript/Rust.
 */
export class CodeBlockComponent extends ExbaComponent {
  /**
   * Observed properties:
   * - code: The raw source code to display.
   * - lang: The programming language (e.g., 'typescript', 'rust').
   * - title: The title for the code card header.
   */
  static props: ComponentProps = {
    code: 'string',
    lang: 'string',
    title: 'string',
  };

  /** Scoped styles for the code card, header, and copy button. */
  static styles = {
    container: 'padding: 2rem; width: 100%; max-width: 800px; margin: 0 auto;',
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); backdrop-filter: blur(12px);`,
    header: `padding: 0.75rem 1.25rem; background: ${t.zinc800a}; border-bottom: 1px solid ${t.zinc800a}; display: flex; justify-content: space-between; align-items: center;`,
    title: `font-size: 0.75rem; font-weight: 700; color: ${t.zinc400}; text-transform: uppercase; letter-spacing: 0.05em; font-family: "JetBrains Mono", "Fira Code", monospace;`,
    copyBtn: `background: transparent; border: 1px solid ${t.zinc700}; border-radius: 0.5rem; color: ${t.zinc400}; padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer; transition: all ${ease}; font-family: inherit;`,
    copyBtnHover: `&:hover { background: ${t.zinc700}; color: ${t.zinc100}; border-color: ${t.zinc500}; }`,
    copyBtnActive: `background: ${t.indigo600a}; color: ${t.indigo300}; border-color: ${t.indigo500};`,
    pre: `margin: 0; padding: 1.5rem; overflow-x: auto; background: #0d0d0e; font-family: "JetBrains Mono", "Fira Code", monospace; font-size: 0.875rem; line-height: 1.7; color: ${t.zinc300};`,
  };

  /**
   * Performs basic syntax highlighting using regex patterns.
   * Supports keywords, types, strings, numbers, and comments.
   * @param code The raw code string.
   * @param lang The language for specialized highlighting.
   */
  private highlight(code: string, lang: string): string {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (lang === 'typescript' || lang === 'ts' || lang === 'js') {
      return escaped
        // Keywords
        .replace(/\b(abstract|async|await|boolean|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|native|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|type|typeof|var|void|while|with|yield|any|number|string|symbol|unknown)\b/g, `<span style="color: ${t.indigo400}">$1</span>`)
        // Framework Globals / Core Classes
        .replace(/\b(EXBA|ExbaComponent|Router|ReactiveStateProxy|IRProcessor|ResilienceManager|Context|ThemeProvider|html|patch|signal|memo|computed|batch|effect|untrack|on)\b/g, `<span style="color: ${t.emerald400}">$1</span>`)
        // Decorators
        .replace(/@\w+/g, `<span style="color: ${t.indigo300}">$&</span>`)
        // Strings
        .replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, `<span style="color: ${t.indigo300}">$&</span>`)
        // Comments
        .replace(/\/\/.*/g, `<span style="color: ${t.zinc600}">$&</span>`)
        .replace(/\/\*[\s\S]*?\*\//g, `<span style="color: ${t.zinc600}">$&</span>`)
        // Numbers
        .replace(/\b\d+(\.\d+)?\b/g, `<span style="color: #d19a66;">$&</span>`);
    }

    if (lang === 'rust' || lang === 'rs') {
      return escaped
        // Keywords
        .replace(/\b(as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|import|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|union|unsafe|use|where|while)\b/g, `<span style="color: ${t.indigo400}">$1</span>`)
        // Common Types / Traits
        .replace(/\b(String|Vec|Option|Result|JsValue|AppState|AppCommand|IRCommand|IRResult|Mutex|OnceLock|Box|Arc|Rc|RefCell|u8|u16|u32|u64|u128|i8|i16|i32|i64|i128|f32|f64|bool|char|str)\b/g, `<span style="color: ${t.emerald400}">$1</span>`)
        // Attributes / Macros
        .replace(/#\[[\s\S]*?\]/g, `<span style="color: #d19a66;">$&</span>`)
        .replace(/\b\w+!/g, `<span style="color: ${t.indigo300}">$&</span>`)
        // Strings
        .replace(/"(?:\\.|[^"\\])*"/g, `<span style="color: ${t.indigo300}">$&</span>`)
        // Comments
        .replace(/\/\/.*/g, `<span style="color: ${t.zinc600}">$&</span>`)
        .replace(/\/\*[\s\S]*?\*\//g, `<span style="color: ${t.zinc600}">$&</span>`)
        // Numbers
        .replace(/\b\d+(\.\d+)?\b/g, `<span style="color: #d19a66;">$&</span>`);
    }

    return escaped;
  }

  /**
   * Copies the raw code to the system clipboard and triggers visual feedback.
   */
  public async copyCode() {
    const code = this.state.code || '';
    await navigator.clipboard.writeText(code);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  }

  /**
   * Renders the stylized code block with header and copy action.
   */
  render() {
    const code = this.state.code || `// No code provided\nexport class Example extends ExbaComponent {\n  render() {\n    return 'Hello World';\n  }\n}`;
    const lang = this.state.lang || 'typescript';
    const title = this.state.title || `${lang.toUpperCase()} Source`;
    const copied = this.state.copied;

    return `
      <div class="container">
        <div class="${globalStyles.viewHeading}">Styled Code Block</div>
        <p style="color: ${t.zinc500}; margin-bottom: 2rem;">A fully designed primitive for displaying source code with highlighting.</p>

        <div class="card">
          <header class="header">
            <div class="title">${title}</div>
            <button 
                class="copyBtn copyBtnHover ${copied ? 'copyBtnActive' : ''}" 
                onclick="this.getRootNode().host.copyCode()"
            >
              ${copied ? '✓ Copied' : 'Copy'}
            </button>
          </header>
          <pre class="pre"><code>${this.highlight(code, lang)}</code></pre>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-code-block-demo', CodeBlockComponent);
