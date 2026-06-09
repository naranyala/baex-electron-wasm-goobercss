type Hotkey = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

type HotkeyHandler = () => void;

class KeyboardManager {
  private static instance: KeyboardManager;
  private handlers = new Map<string, HotkeyHandler>();

  private constructor() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  public static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  private getHotkeyString(hk: Hotkey): string {
    const parts: string[] = [];
    if (hk.ctrl) parts.push('ctrl');
    if (hk.shift) parts.push('shift');
    if (hk.alt) parts.push('alt');
    if (hk.meta) parts.push('meta');
    parts.push(hk.key.toLowerCase());
    return parts.join('+');
  }

  public register(hk: Hotkey, handler: HotkeyHandler): void {
    this.handlers.set(this.getHotkeyString(hk), handler);
  }

  public unregister(hk: Hotkey): void {
    this.handlers.delete(this.getHotkeyString(hk));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const hk: Hotkey = {
      key: e.key,
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
    };
    const key = this.getHotkeyString(hk);
    const handler = this.handlers.get(key);
    if (handler) {
      e.preventDefault();
      handler();
    }
  }
}

export const keyboardManager = KeyboardManager.getInstance();
