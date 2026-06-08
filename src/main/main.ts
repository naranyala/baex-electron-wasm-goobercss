import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url);

/**
 * Resolves the correct path to the native SQLite wrapper.
 * Handles differences between development mode and packaged ASAR archives.
 * 
 * @returns {string} The absolute path to the native sqlite-native index.js.
 */
function getSqlitePath() {
  const isPackaged = app.isPackaged;
  const appPath = app.getAppPath();
  
  if (isPackaged) {
    // In production, natively unpacked files are in app.asar.unpacked
    return path.join(appPath.replace('app.asar', 'app.asar.unpacked'), 'native/sqlite-native/index.js');
  }
  // In development
  return path.join(appPath, 'native/sqlite-native/index.js');
}

const sqlitePath = getSqlitePath();
console.log('Loading SQLite wrapper from:', sqlitePath);

let sqlite: any;
try {
  // Set an environment variable so the manual wrapper knows where the .node file is
  const binaryPath = sqlitePath.replace('index.js', 'index.node');
  process.env.NATIVE_BINARY_PATH = binaryPath;
  
  sqlite = require(sqlitePath);
  console.log('SQLite native module loaded successfully');
} catch (e) {
  console.error('Failed to load SQLite native module:', e);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))


// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

/** The URL of the Vite development server, if applicable. */
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
/** Path to the compiled Electron main process files. */
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
/** Path to the compiled renderer process files. */
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

/** Absolute path to the application's SQLite database file in the user data directory. */
const DB_PATH = path.join(app.getPath('userData'), 'app.db');

/**
 * Initializes the relational database schema and seeds it with demo data.
 * Creates tables for categories, users, products, orders, and order items.
 * 
 * @async
 * @returns {Promise<void>}
 */
async function bootstrapDb() {
  if (!sqlite) {
    console.error('Cannot bootstrap: SQLite module not loaded');
    return;
  }

  try {
    console.log('Starting relational database seeding...');
    
    // Enable foreign keys in SQLite
    await sqlite.execute_sql(DB_PATH, 'PRAGMA foreign_keys = ON;');

    const seedQueries = [
      // 1. Categories Table
      'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL)',
      "INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'Electronics')",
      "INSERT OR IGNORE INTO categories (id, name) VALUES (2, 'Books')",
      "INSERT OR IGNORE INTO categories (id, name) VALUES (3, 'Clothing')",

      // 2. Users Table
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)',
      "INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Alice Johnson', 'alice@example.com')",
      "INSERT OR IGNORE INTO users (id, name, email) VALUES (2, 'Bob Smith', 'bob@example.com')",
      "INSERT OR IGNORE INTO users (id, name, email) VALUES (3, 'Charlie Brown', 'charlie@example.com')",

      // 3. Products Table (Relates to Categories)
      'CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL, category_id INTEGER, FOREIGN KEY(category_id) REFERENCES categories(id))',
      "INSERT OR IGNORE INTO products (id, name, price, category_id) VALUES (1, 'Smartphone', 699.99, 1)",
      "INSERT OR IGNORE INTO products (id, name, price, category_id) VALUES (2, 'Laptop', 1200.00, 1)",
      "INSERT OR IGNORE INTO products (id, name, price, category_id) VALUES (3, 'Rust Programming Book', 45.00, 2)",
      "INSERT OR IGNORE INTO products (id, name, price, category_id) VALUES (4, 'T-Shirt', 19.99, 3)",

      // 4. Orders Table (Relates to Users)
      'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, user_id INTEGER, order_date TEXT, FOREIGN KEY(user_id) REFERENCES users(id))',
      `INSERT OR IGNORE INTO orders (id, user_id, order_date) VALUES (1, 1, '${new Date().toISOString().split('T')[0]}')`,
      `INSERT OR IGNORE INTO orders (id, user_id, order_date) VALUES (2, 2, '${new Date().toISOString().split('T')[0]}')`,

      // 5. Order Items Table (Relates to Orders and Products)
      'CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(product_id) REFERENCES products(id))',
      "INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity) VALUES (1, 1, 1, 1)",
      "INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity) VALUES (2, 1, 3, 2)",
      "INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity) VALUES (3, 2, 2, 1)",
    ];

    for (const query of seedQueries) {
      await sqlite.execute_sql(DB_PATH, query);
    }
    
    console.log('Relational database seeded successfully: categories, users, products, orders, order_items');
  } catch (e) {
    console.error('Relational database bootstrap failed:', e);
  }
}

/**
 * IPC handler for executing SQL statements.
 * @param {any} _ - Unused event argument.
 * @param {string} sql - The SQL statement to execute.
 * @returns {Promise<string>} The result of the operation.
 */
ipcMain.handle('db:execute', (_, sql: string) => {
  if (!sqlite) throw new Error('SQLite native module not loaded');
  console.log('Executing SQL:', sql);
  return sqlite.execute_sql(DB_PATH, sql);
});

/**
 * IPC handler for querying the database.
 * @param {any} _ - Unused event argument.
 * @param {string} sql - The SQL query to run.
 * @returns {Promise<any>} The result set parsed as JSON.
 */
ipcMain.handle('db:query', (_, sql: string) => {
  if (!sqlite) throw new Error('SQLite native module not loaded');
  console.log('Querying SQL:', sql);
  try {
    const result = sqlite.query_sql(DB_PATH, sql);
    return JSON.parse(result);
  } catch (e) {
    console.error('Query execution error:', e);
    throw e;
  }
});

let win: BrowserWindow | null

/**
 * Creates the main application window and configures its properties.
 */
function createWindow() {
  const projectName = path.basename(process.env.APP_ROOT);
  win = new BrowserWindow({
    title: projectName,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(async () => {
  await bootstrapDb();
  createWindow();
})
