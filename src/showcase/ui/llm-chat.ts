import { ExbaComponent } from '../../kernel/core/component';
import { customElement, eventListener } from '../../kernel/core/decorators';
import { EXBA } from '../../kernel/core/exba';
import { t, ease } from '../../shell/styles';

/**
 * A sophisticated Multimodal LLM Chat interface.
 * Demonstrates complex UI composition, stateful lists, and 
 * simulated multimodal (image/file) processing.
 */
@customElement('exba-llm-chat')
export class LLMChatComponent extends ExbaComponent {
  static useShadow = true;

  static styles = {
    container: `display: flex; flex-direction: column; height: 600px; width: 100%; max-width: 900px; margin: 0 auto; background: ${t.zinc950}; border: 1px solid ${t.zinc800}; border-radius: 1.25rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);`,
    header: `padding: 1rem 1.5rem; border-bottom: 1px solid ${t.zinc800}; background: ${t.zinc900a}; display: flex; align-items: center; justify-content: space-between;`,
    headerTitle: `font-size: 1rem; font-weight: 600; color: ${t.zinc100}; display: flex; align-items: center; gap: 0.75rem;`,
    status: `width: 0.5rem; height: 0.5rem; border-radius: 50%; background: ${t.emerald400}; box-shadow: 0 0 8px ${t.emerald600};`,
    history: `flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; scroll-behavior: smooth;`,
    message: `display: flex; flex-direction: column; max-width: 80%;`,
    userMessage: 'align-self: flex-end; align-items: flex-end;',
    aiMessage: 'align-self: flex-start; align-items: flex-start;',
    bubble: `padding: 0.875rem 1.25rem; border-radius: 1.25rem; font-size: 0.9375rem; line-height: 1.5;`,
    userBubble: `background: ${t.indigo600}; color: ${t.white}; border-bottom-right-radius: 0.25rem;`,
    aiBubble: `background: ${t.zinc800}; color: ${t.zinc200}; border-bottom-left-radius: 0.25rem; border: 1px solid ${t.zinc700};`,
    attachment: `margin-top: 0.5rem; border-radius: 0.75rem; overflow: hidden; border: 1px solid ${t.zinc700}; background: ${t.zinc900}; display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem;`,
    attachmentImg: `width: 3rem; height: 3rem; object-fit: cover; border-radius: 0.375rem;`,
    attachmentInfo: `display: flex; flex-direction: column; gap: 0.125rem;`,
    attachmentName: `font-size: 0.75rem; font-weight: 600; color: ${t.zinc200};`,
    attachmentSize: `font-size: 0.65rem; color: ${t.zinc500};`,
    inputArea: `padding: 1.25rem; background: ${t.zinc900a}; border-top: 1px solid ${t.zinc800};`,
    inputWrapper: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; border-radius: 1rem; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; transition: border-color ${ease};`,
    inputWrapperFocus: `border-color: ${t.indigo500}; box-shadow: 0 0 0 2px ${t.indigo600a};`,
    input: `background: transparent; border: none; outline: none; color: ${t.white}; font-family: inherit; font-size: 0.9375rem; padding: 0.5rem 0.75rem; resize: none; min-height: 2.5rem;`,
    toolbar: `display: flex; align-items: center; justify-content: space-between; padding: 0 0.5rem 0.25rem;`,
    toolGroup: 'display: flex; gap: 0.25rem;',
    toolBtn: `pading: 0.5rem; background: transparent; border: none; border-radius: 0.5rem; color: ${t.zinc400}; cursor: pointer; transition: all ${ease}; display: flex; align-items: center; justify-content: center; width: 2.25rem; height: 2.25rem;`,
    toolBtnHover: `&:hover { background: ${t.zinc700}; color: ${t.zinc100}; }`,
    sendBtn: `background: ${t.indigo600}; color: ${t.white}; width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: all ${ease}; display: flex; align-items: center; justify-content: center;`,
    sendBtnHover: `&:hover { background: ${t.indigo500}; transform: scale(1.05); }`,
    previewArea: `display: flex; gap: 0.5rem; padding: 0.5rem; border-bottom: 1px solid ${t.zinc700}; margin-bottom: 0.25rem;`,
    previewItem: `position: relative; width: 4rem; height: 4rem; border-radius: 0.5rem; overflow: hidden; border: 1px solid ${t.zinc600};`,
    previewImg: `width: 100%; height: 100%; object-fit: cover;`,
    removePreview: `position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 1rem; height: 1rem; font-size: 0.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center;`
  };

  protected onMount() {
    this.setState({
      messages: [
        { role: 'ai', text: 'Hello! I am your EXBA Multimodal Assistant. How can I help you today? You can send text or "upload" simulated images.' }
      ],
      currentInput: '',
      attachments: [],
      isThinking: false
    });
  }

  @eventListener('#chat-input', 'input')
  protected handleInputChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.setState({ currentInput: target.value });
    
    // Auto-resize textarea
    target.style.height = 'auto';
    target.style.height = (target.scrollHeight) + 'px';
  }

  @eventListener('#chat-input', 'keydown')
  protected handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  @eventListener('#upload-trigger', 'click')
  protected simulateUpload() {
    const demoImages = [
      { name: 'architecture_diagram.png', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=200&fit=crop' },
      { name: 'code_snippet.jpg', size: '840 KB', url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200&h=200&fit=crop' },
      { name: 'ui_mockup.webp', size: '1.1 MB', url: 'https://images.unsplash.com/photo-1586717791821-3f44a563de4c?w=200&h=200&fit=crop' }
    ];
    
    const randomImg = demoImages[Math.floor(Math.random() * demoImages.length)];
    const currentAttachments = this.state.attachments || [];
    
    this.setState({
      attachments: [...currentAttachments, { ...randomImg, id: Math.random().toString(36).substr(2, 9) }]
    });
  }

  protected removeAttachment(id: string) {
    const attachments = (this.state.attachments || []).filter((a: any) => a.id !== id);
    this.setState({ attachments });
  }

  protected async sendMessage() {
    const text = this.state.currentInput.trim();
    const attachments = [...(this.state.attachments || [])];
    
    if (!text && attachments.length === 0) return;
    if (this.state.isThinking) return;

    const userMsg = { role: 'user', text, attachments };
    const messages = [...(this.state.messages || []), userMsg];
    
    this.setState({
      messages,
      currentInput: '',
      attachments: [],
      isThinking: true
    });

    const inputEl = this.shadowRoot?.querySelector('#chat-input') as HTMLTextAreaElement;
    if (inputEl) inputEl.style.height = 'auto';

    this.scrollToBottom();

    // Simulate AI response delay
    setTimeout(() => {
      let aiResponse = "I've received your request.";
      if (attachments.length > 0) {
        aiResponse = `I see you've attached ${attachments.length} file(s). Analyzing ${attachments[0].name}... This looks like a complex system visualization. How should we proceed with the analysis?`;
      } else if (text.toLowerCase().includes('help')) {
        aiResponse = "I can help you analyze images, write code, or explain framework concepts. Just ask!";
      } else {
        aiResponse = "That's an interesting point. As an EXBA-integrated LLM interface, I can process these requests with high performance. Would you like to see a WASM-powered computation example?";
      }

      this.setState({
        messages: [...this.state.messages, { role: 'ai', text: aiResponse }],
        isThinking: false
      });
      
      this.scrollToBottom();
    }, 1500);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const history = this.shadowRoot?.querySelector('.history');
      if (history) history.scrollTop = history.scrollHeight;
    }, 50);
  }

  render() {
    const { messages = [], currentInput = '', attachments = [], isThinking = false } = this.state;

    return `
      <div class="container">
        <header class="header">
          <div class="headerTitle">
            <div class="status"></div>
            EXBA Multimodal Assistant
          </div>
          <div style="color: ${t.zinc500}; font-size: 0.75rem; font-weight: 500;">GPT-4o Equivalent</div>
        </header>

        <div class="history">
          ${messages.map((msg: any) => `
            <div class="message ${msg.role === 'user' ? 'userMessage' : 'aiMessage'}">
              <div class="bubble ${msg.role === 'user' ? 'userBubble' : 'aiBubble'}">
                ${msg.text}
              </div>
              ${msg.attachments && msg.attachments.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">
                  ${msg.attachments.map((a: any) => `
                    <div class="attachment">
                      <img src="${a.url}" class="attachmentImg" />
                      <div class="attachmentInfo">
                        <span class="attachmentName">${a.name}</span>
                        <span class="attachmentSize">${a.size}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
          
          ${isThinking ? `
            <div class="message aiMessage">
              <div class="bubble aiBubble" style="display: flex; gap: 0.35rem; padding: 0.75rem 1rem;">
                <span style="animation: bounce 1.4s infinite ease-in-out; background: ${t.zinc500}; width: 0.4rem; height: 0.4rem; border-radius: 50%;"></span>
                <span style="animation: bounce 1.4s infinite ease-in-out 0.2s; background: ${t.zinc500}; width: 0.4rem; height: 0.4rem; border-radius: 50%;"></span>
                <span style="animation: bounce 1.4s infinite ease-in-out 0.4s; background: ${t.zinc500}; width: 0.4rem; height: 0.4rem; border-radius: 50%;"></span>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="inputArea">
          <div class="inputWrapper">
            ${attachments.length > 0 ? `
              <div class="previewArea">
                ${attachments.map((a: any) => `
                  <div class="previewItem">
                    <img src="${a.url}" class="previewImg" />
                    <button class="removePreview" onclick="this.getRootNode().host.removeAttachment('${a.id}')">×</button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <textarea 
              id="chat-input" 
              class="input" 
              placeholder="Message EXBA Assistant..."
              rows="1"
            >${currentInput}</textarea>
            
            <div class="toolbar">
              <div class="toolGroup">
                <button id="upload-trigger" class="toolBtn toolBtnHover" title="Attach simulated file">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
                <button class="toolBtn toolBtnHover" title="Web Search">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>
              <button 
                class="sendBtn sendBtnHover" 
                onclick="this.getRootNode().host.sendMessage()"
                style="${(!currentInput.trim() && attachments.length === 0) ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
          <div style="margin-top: 0.75rem; text-align: center; font-size: 0.65rem; color: ${t.zinc600};">
            EXBA Assistant can make mistakes. Verify important information.
          </div>
        </div>

        <style>
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
          }
          #chat-input::-webkit-scrollbar { width: 0px; }
          .history::-webkit-scrollbar { width: 6px; }
          .history::-webkit-scrollbar-track { background: transparent; }
          .history::-webkit-scrollbar-thumb { background: ${t.zinc800}; border-radius: 10px; }
        </style>
      </div>
    `;
  }
}
