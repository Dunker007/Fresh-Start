// filesystem.js - Real filesystem access via Node bridge
import * as google from './google/index.js';

const BRIDGE_URL = 'http://localhost:3456';

let appState = null;

export function setAppState(state) {
  appState = state;
}

export async function checkFilesystemBridge() {
  const statusEl = document.getElementById('bridgeStatus');
  const statusText = document.getElementById('bridgeStatusText');

  try {
    const res = await fetch(`${BRIDGE_URL}/status`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (appState) {
        appState.fs.bridgeConnected = true;
        appState.fs.paths = data.paths;
      }
      if (statusEl) statusEl.style.display = 'none';
      return true;
    }
  } catch (e) {
    console.log('Bridge not available');
  }

  if (appState) appState.fs.bridgeConnected = false;
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
  if (!appState?.fs.bridgeConnected) {
    const connected = await checkFilesystemBridge();
    if (!connected) return;
  }

  try {
    const res = await fetch(`${BRIDGE_URL}/list?path=${encodeURIComponent(dirPath)}`);
    if (res.ok) {
      const data = await res.json();
      if (appState) {
        appState.fs.currentPath = data.path;
        appState.fs.realFiles = data.files;
      }
      renderRealFiles(data.files);

      // Update path display
      const pathParts = data.path.split(/[\/\\]/);
      const pathEl = document.getElementById('currentPath');
      if (pathEl) pathEl.textContent = pathParts.slice(-2).join('/');
    }
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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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



export async function loadDriveFiles(folderId = 'root') {
  if (!google.auth.isAuthenticated()) {
    if (window.showToast) window.showToast('Please sign in to Google first', 'info');
    return;
  }

  try {
    // Show loading state
    const container = document.getElementById('fileGrid');
    if (container) container.innerHTML = '<div class="loading-spinner"></div>';

    const query = `'${folderId}' in parents and trashed = false`;
    const response = await google.drive.listFiles(query);

    if (response.files) {
      const files = response.files.map(f => ({
        name: f.name,
        path: f.mimeType === 'application/vnd.google-apps.folder' ? f.id : f.webViewLink,
        isDirectory: f.mimeType === 'application/vnd.google-apps.folder',
        type: getDriveFileType(f.mimeType),
        source: 'drive'
      }));

      if (appState) {
        appState.fs.currentPath = folderId === 'root' ? 'Google Drive' : 'Google Drive / ...';
        appState.fs.realFiles = files;
      }

      renderRealFiles(files);

      // Update path display
      const pathEl = document.getElementById('currentPath');
      if (pathEl) pathEl.textContent = appState.fs.currentPath;
    }
  } catch (e) {
    console.error(e);
    if (window.showToast) window.showToast('Failed to load Drive files', 'error');
  }
}

function getDriveFileType(mimeType) {
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('text') || mimeType.includes('javascript') || mimeType.includes('json')) return 'code';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
  return 'other';
}

export function goUpDirectory() {
  if (!appState?.fs.currentPath) return;

  // Basic check for Drive vs Local
  if (appState.fs.currentPath.startsWith('Google Drive')) {
    // Simple "Up" for Drive just goes to root for now as we don't track full breadcrumbs yet
    loadDriveFiles('root');
    return;
  }

  const parentPath = appState.fs.currentPath.split(/[\/\\]/).slice(0, -1).join('\\');
  if (parentPath) loadDirectory(parentPath);
}

// Make handleFileClick available globally
window.handleFileClick = function (el) {
  const filePath = el.dataset.path;
  const isDir = el.dataset.isdir === 'true';
  const source = el.dataset.source; // 'drive' or undefined (local)

  if (isDir) {
    if (source === 'drive') {
      loadDriveFiles(filePath);
    } else {
      loadDirectory(filePath);
    }
  } else {
    if (source === 'drive') {
      window.open(filePath, '_blank');
    } else {
      openFile(filePath);
    }
  }
};

export async function openFile(filePath) {
  try {
    await fetch(`${BRIDGE_URL}/open?path=${encodeURIComponent(filePath)}`);
  } catch (e) {
    if (window.showToast) window.showToast('Failed to open file', 'error');
  }
}

export default { checkFilesystemBridge, loadDirectory, loadDriveFiles, openFile, goUpDirectory, setAppState };
