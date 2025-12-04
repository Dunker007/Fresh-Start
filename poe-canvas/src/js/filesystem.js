// filesystem.js - Real filesystem access via Electron IPC or Node bridge
import { getState } from './state.js';
import { escapeHtml } from './ui.js';

const BRIDGE_URL = 'http://localhost:3456';

// Check if running in Electron
function isElectron() {
  return window.electronAPI?.isElectron === true;
}

export async function checkFilesystemBridge() {
  const statusEl = document.getElementById('bridgeStatus');
  const statusText = document.getElementById('bridgeStatusText');
  const state = getState();

  // If running in Electron, use IPC
  if (isElectron()) {
    try {
      const data = await window.electronAPI.getStatus();
      if (state) {
        state.fs.bridgeConnected = true;
        state.fs.paths = data.paths;
        state.fs.isElectron = true;
      }
      if (statusEl) statusEl.style.display = 'none';
      return true;
    } catch (e) {
      console.error('Electron IPC error:', e);
    }
  }

  // Fallback to HTTP bridge for browser development
  try {
    const res = await fetch(`${BRIDGE_URL}/status`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (state) {
        state.fs.bridgeConnected = true;
        state.fs.paths = data.paths;
        state.fs.isElectron = false;
      }
      if (statusEl) statusEl.style.display = 'none';
      return true;
    }
  } catch (e) {
    console.log('Bridge not available');
  }

  if (state) state.fs.bridgeConnected = false;
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.style.background = 'rgba(234,67,53,0.1)';
  }
  if (statusText) {
    statusText.innerHTML = 'Bridge not running. Start with: <code>node bridge.js</code>';
  }
  return false;
}

export async function loadDirectory(dirPath) {
  const state = getState();
  if (!state?.fs.bridgeConnected) {
    const connected = await checkFilesystemBridge();
    if (!connected) return;
  }

  try {
    let data;

    // Use Electron IPC if available
    if (isElectron()) {
      data = await window.electronAPI.listDirectory(dirPath);
    } else {
      // Fallback to HTTP bridge
      const res = await fetch(`${BRIDGE_URL}/list?path=${encodeURIComponent(dirPath)}`);
      if (!res.ok) throw new Error('Failed to load directory');
      data = await res.json();
    }

    if (state) {
      state.fs.currentPath = data.path;
      state.fs.realFiles = data.files;
    }
    renderRealFiles(data.files);

    // Update path display
    const pathParts = data.path.split(/[\/\\]/);
    const pathEl = document.getElementById('currentPath');
    if (pathEl) pathEl.textContent = pathParts.slice(-2).join('/');
  } catch (e) {
    if (window.showToast) window.showToast('Failed to load directory', 'error');
  }
}

export function renderRealFiles(files) {
  const container = document.getElementById('fileGrid');
  if (!container) return;

  if (!files || files.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-folder-open"></i>
        <p>This folder is empty</p>
      </div>
    `;
    return;
  }

  container.innerHTML = files.map(file => `
    <div class="file-item" data-path="${escapeHtml(file.path)}" data-isdir="${file.isDirectory}" onclick="handleFileClick(this)">
      <div class="file-icon ${file.type}">
        <i class="fas fa-${getFileIcon(file.type)}"></i>
      </div>
      <div class="file-name">${escapeHtml(file.name)}</div>
    </div>
  `).join('');
}

function getFileIcon(type) {
  const icons = {
    folder: 'folder',
    image: 'image',
    code: 'file-code',
    document: 'file-alt',
    other: 'file'
  };
  return icons[type] || 'file';
}

// Make handleFileClick available globally
window.handleFileClick = function (el) {
  const filePath = el.dataset.path;
  const isDir = el.dataset.isdir === 'true';

  if (isDir) {
    loadDirectory(filePath);
  } else {
    openFile(filePath);
  }
};

export async function openFile(filePath) {
  try {
    // Use Electron IPC if available
    if (isElectron()) {
      await window.electronAPI.openFile(filePath);
    } else {
      // Fallback to HTTP bridge
      await fetch(`${BRIDGE_URL}/open?path=${encodeURIComponent(filePath)}`);
    }
  } catch (e) {
    if (window.showToast) window.showToast('Failed to open file', 'error');
  }
}

export function goUpDirectory() {
  const state = getState();
  if (!state?.fs.currentPath) return;
  const parentPath = state.fs.currentPath.split(/[\/\\]/).slice(0, -1).join('\\');
  if (parentPath) loadDirectory(parentPath);
}

export async function createFolder() {
  const nameInput = document.getElementById('folderNameInput');
  const name = nameInput.value.trim();
  if (!name) return;

  const state = getState();
  if (!state.fs.currentPath) {
    if (window.showToast) window.showToast('No active directory', 'error');
    return;
  }

  const newPath = state.fs.isElectron
    ? `${state.fs.currentPath}\\${name}` // Windows path
    : `${state.fs.currentPath}/${name}`;

  try {
    if (isElectron()) {
      await window.electronAPI.createDirectory(newPath);
    } else {
      await fetch(`${BRIDGE_URL}/mkdir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath })
      });
    }

    if (window.closeModal) window.closeModal('folderModal');
    nameInput.value = '';
    loadDirectory(state.fs.currentPath); // Refresh
    if (window.showToast) window.showToast('Folder created', 'success');
  } catch (e) {
    console.error(e);
    if (window.showToast) window.showToast('Failed to create folder', 'error');
  }
}

export async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const state = getState();
  if (!state.fs.currentPath) return;

  // In Electron, we can copy the file using its path
  if (isElectron() && file.path) {
    const sourcePath = file.path;
    const destPath = `${state.fs.currentPath}\\${file.name}`;

    try {
      // Use copyFile API
      await window.electronAPI.copyFile(sourcePath, destPath);

      loadDirectory(state.fs.currentPath);
      if (window.showToast) window.showToast('File uploaded', 'success');
    } catch (e) {
      console.error(e);
      if (window.showToast) window.showToast('Failed to upload file', 'error');
    }
  } else {
    // Web fallback - not fully implemented for real FS without bridge upload endpoint
    if (window.showToast) window.showToast('File upload only supported in Electron mode', 'warning');
  }

  // Reset input
  event.target.value = '';
}

export default { checkFilesystemBridge, loadDirectory, openFile, goUpDirectory, createFolder, handleFileUpload };
