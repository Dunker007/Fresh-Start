// Nexus Workspace - Electron Main Process
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Keep a global reference to prevent garbage collection
let mainWindow;

// System paths for filesystem access
const PATHS = {
  home: os.homedir(),
  desktop: path.join(os.homedir(), 'Desktop'),
  documents: path.join(os.homedir(), 'Documents'),
  downloads: path.join(os.homedir(), 'Downloads')
};

function createWindow() {
  // Try to load icon, but don't fail if it doesn't exist
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const iconExists = fs.existsSync(iconPath);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: iconExists ? iconPath : undefined,
    show: false,
    backgroundColor: '#1a1a2e'
  });

  // Load the app
  const indexPath = path.join(__dirname, '../src/index.html');
  mainWindow.loadFile(indexPath);

  // Show window when ready to avoid flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for filesystem operations

// Get system paths
ipcMain.handle('fs:getPaths', () => {
  return PATHS;
});

// Get bridge status (always connected in Electron)
ipcMain.handle('fs:getStatus', () => {
  return {
    status: 'ok',
    version: '1.0.0',
    paths: PATHS,
    isElectron: true
  };
});

// List directory contents
ipcMain.handle('fs:listDirectory', async (event, dirPath) => {
  try {
    const targetPath = dirPath || PATHS.desktop;
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });

    const files = entries.map(entry => {
      const fullPath = path.join(targetPath, entry.name);
      let stats = null;
      try {
        stats = fs.statSync(fullPath);
      } catch (e) { }

      return {
        name: entry.name,
        path: fullPath,
        isDirectory: entry.isDirectory(),
        size: stats?.size || 0,
        modified: stats?.mtime?.toISOString() || null,
        type: getFileType(entry.name, entry.isDirectory())
      };
    }).sort((a, b) => {
      // Folders first, then alphabetical
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

    return { path: targetPath, files };
  } catch (err) {
    throw new Error(`Cannot read directory: ${err.message}`);
  }
});

// Open file with system default application
ipcMain.handle('fs:openFile', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (err) {
    throw new Error(`Cannot open file: ${err.message}`);
  }
});

// Read file contents
ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { content };
  } catch (err) {
    throw new Error(`Cannot read file: ${err.message}`);
  }
});

// Write file contents
ipcMain.handle('fs:writeFile', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    throw new Error(`Cannot write file: ${err.message}`);
  }
});

// Create directory
ipcMain.handle('fs:createDirectory', async (event, dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return { success: true };
  } catch (err) {
    throw new Error(`Cannot create directory: ${err.message}`);
  }
});

// Copy file
ipcMain.handle('fs:copyFile', async (event, sourcePath, destPath) => {
  try {
    fs.copyFileSync(sourcePath, destPath);
    return { success: true };
  } catch (err) {
    throw new Error(`Cannot copy file: ${err.message}`);
  }
});

// Delete file or directory
ipcMain.handle('fs:delete', async (event, targetPath) => {
  try {
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      fs.rmdirSync(targetPath, { recursive: true });
    } else {
      fs.unlinkSync(targetPath);
    }
    return { success: true };
  } catch (err) {
    throw new Error(`Cannot delete: ${err.message}`);
  }
});

// Database Module
const db = require('./db');

// Initialize DB
try {
  db.initDatabase();
} catch (e) {
  console.error('Failed to initialize database:', e);
}

// IPC Handlers for Database
ipcMain.handle('db:loadState', () => {
  return db.loadFullState();
});

ipcMain.handle('db:saveItem', (event, table, item) => {
  return db.saveItem(table, item);
});

ipcMain.handle('db:deleteItem', (event, table, id) => {
  return db.deleteItem(table, id);
});

ipcMain.handle('db:setKV', (event, key, value) => {
  return db.setKV(key, value);
});

// Helper function to determine file type
function getFileType(filename, isDir) {
  if (isDir) return 'folder';
  const ext = path.extname(filename).toLowerCase().slice(1);
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'];
  const codeExts = ['js', 'ts', 'py', 'html', 'css', 'json', 'jsx', 'tsx', 'rs', 'go'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'];

  if (imageExts.includes(ext)) return 'image';
  if (codeExts.includes(ext)) return 'code';
  if (docExts.includes(ext)) return 'document';
  return 'other';
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
