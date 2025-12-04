// Nexus Workspace - Electron Preload Script
// Exposes safe filesystem APIs to the renderer process
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Flag to detect Electron environment
  isElectron: true,

  // Get system paths (home, desktop, documents, downloads)
  getPaths: () => ipcRenderer.invoke('fs:getPaths'),

  // Get bridge/filesystem status
  getStatus: () => ipcRenderer.invoke('fs:getStatus'),

  // List directory contents
  listDirectory: (dirPath) => ipcRenderer.invoke('fs:listDirectory', dirPath),

  // Open file with system default application
  openFile: (filePath) => ipcRenderer.invoke('fs:openFile', filePath),

  // Read file contents (returns { content: string })
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),

  // Write file contents
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),

  // Create directory
  createDirectory: (dirPath) => ipcRenderer.invoke('fs:createDirectory', dirPath),

  // Copy file
  copyFile: (sourcePath, destPath) => ipcRenderer.invoke('fs:copyFile', sourcePath, destPath),

  // Delete file or directory
  delete: (targetPath) => ipcRenderer.invoke('fs:delete', targetPath),

  // Platform info
  platform: process.platform,

  // Database API
  db: {
    loadState: () => ipcRenderer.invoke('db:loadState'),
    saveItem: (table, item) => ipcRenderer.invoke('db:saveItem', table, item),
    deleteItem: (table, id) => ipcRenderer.invoke('db:deleteItem', table, id),
    setKV: (key, value) => ipcRenderer.invoke('db:setKV', key, value)
  }
});
