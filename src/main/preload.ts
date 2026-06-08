import { ipcRenderer, contextBridge } from 'electron'

/**
 * The contextBridge exposes a secure API to the renderer process.
 * This prevents the renderer from having direct access to Node.js or Electron internals,
 * reducing the attack surface of the application.
 */
contextBridge.exposeInMainWorld('ipcRenderer', {
  /**
   * Registers a listener for an IPC event.
   * @param {string} channel - The IPC channel to listen on.
   * @param {Function} listener - The callback function to execute when the event is received.
   */
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  /**
   * Removes a previously registered IPC event listener.
  */
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  /**
   * Sends an asynchronous message to the main process.
   */
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  /**
   * Invokes a command in the main process and waits for a response.
   */
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  /**
   * Database access API for the renderer process.
   */
  db: {
    /** Executes a write SQL operation. */
    execute: (sql: string) => ipcRenderer.invoke('db:execute', sql),
    /** Executes a read SQL query and returns the results. */
    query: (sql: string) => ipcRenderer.invoke('db:query', sql),
  },

  // You can expose other APTs you need here.
  // ...
})
