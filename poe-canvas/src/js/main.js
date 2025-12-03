// main.js - App initialization and event binding
import { initAppState, getState } from './state.js';
import { detectLocalLLM, sendToLocalLLM } from './llm.js';
import { checkFilesystemBridge, loadDirectory, goUpDirectory } from './filesystem.js';
import { initUI, showToast, openModal, closeModal } from './ui.js';
import { initTasks, renderTasks, addTask } from './tasks.js';
import { initNotes, renderNotes, addNote } from './notes.js';
import { initProjects, renderProjects, addProject } from './projects.js';
import { initTimer, renderTimer } from './timer.js';
import { initCalendar, renderCalendar } from './calendar.js';
import { initLayout, renderLayout, addLayoutItem, clearLayout } from './layout.js';
import { showAIContextMenu } from './ai-assistant.js';

// Initialize app
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize state once - all modules use getState()
  const appState = initAppState();
  window.appState = appState; // Keep for debugging

  // Setup theme
  setupTheme();

  // Initialize UI components
  initUI();
  initTasks();
  initNotes();
  initProjects();
  initTimer();
  initCalendar();
  initLayout();

  // Setup event listeners
  setupEventListeners();

  // Detect external services
  try { await detectLocalLLM(); } catch (e) { console.log('LLM detection failed:', e); }

  console.log('Nexus Workspace initialized');
});

function setupTheme() {
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }

  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.documentElement.classList.toggle('dark', e.matches);
  });
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => switchView(item.dataset.view));
  });

  // Add buttons
  document.getElementById('addTaskBtn')?.addEventListener('click', () => openModal('taskModal'));
  document.getElementById('addNoteBtn')?.addEventListener('click', () => openModal('noteModal'));
  document.getElementById('addProjectBtn')?.addEventListener('click', () => openModal('projectModal'));

  // AI handlers
  document.getElementById('aiSendBtn')?.addEventListener('click', sendAIMessage);
  document.getElementById('aiInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAIMessage();
  });
  document.getElementById('clearChatBtn')?.addEventListener('click', clearAIChat);
  document.getElementById('refreshModelsBtn')?.addEventListener('click', detectLocalLLM);

  // Filesystem handlers
  document.getElementById('goDesktop')?.addEventListener('click', () => loadDirectory(getState().fs.paths.desktop || ''));
  document.getElementById('goDocuments')?.addEventListener('click', () => loadDirectory(getState().fs.paths.documents || ''));
  document.getElementById('goDownloads')?.addEventListener('click', () => loadDirectory(getState().fs.paths.downloads || ''));
  document.getElementById('goUp')?.addEventListener('click', goUpDirectory);
  document.getElementById('refreshFiles')?.addEventListener('click', () => {
    const state = getState();
    if (state.fs.currentPath) loadDirectory(state.fs.currentPath);
    else checkFilesystemBridge();
  });

  // Layout handlers
  document.getElementById('addLayoutItem')?.addEventListener('click', () => openModal('layoutItemModal'));
  document.getElementById('clearCanvas')?.addEventListener('click', clearLayout);
  document.getElementById('saveLayout')?.addEventListener('click', () => showToast('Layout saved!', 'success'));

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
}

function switchView(view) {
  const state = getState();
  state.currentView = view;

  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  document.getElementById('dashboardView').style.display = view === 'dashboard' ? '' : 'none';
  document.getElementById('filesView').style.display = view === 'files' ? '' : 'none';
  document.getElementById('canvasView').style.display = view === 'canvas' ? '' : 'none';
  document.getElementById('aiView').style.display = view === 'ai' ? '' : 'none';

  if (view === 'canvas') renderLayout();
  if (view === 'files') {
    checkFilesystemBridge().then(connected => {
      if (connected && !state.fs.currentPath) {
        loadDirectory(state.fs.paths.desktop);
      }
    });
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
}


// AI Chat functions
async function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const message = input.value.trim();
  if (!message) return;

  addChatMessage(message, 'user');
  input.value = '';

  const loadingId = 'loading-' + Date.now();
  const messagesContainer = document.getElementById('aiChatMessages');
  const loadingEl = document.createElement('div');
  loadingEl.id = loadingId;
  loadingEl.className = 'ai-message assistant';
  loadingEl.innerHTML = '<div class="loading-spinner"></div>';
  messagesContainer.appendChild(loadingEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  if (getState().llm.connected) {
    try {
      const response = await sendToLocalLLM(message);
      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) {
        loadingElement.innerHTML = `<div class="markdown-content">${marked.parse(response)}</div>`;
      }
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return;
    } catch (err) {
      console.error('Local LLM error:', err);
      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) {
        loadingElement.innerHTML = `<div class="markdown-content"><p style="color: var(--accent-danger);">Error: ${err.message}</p></div>`;
      }
      return;
    }
  }

  // Demo mode
  setTimeout(() => {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
      loadingElement.innerHTML = `<div class="markdown-content"><p>No LLM connected. Start <strong>LM Studio</strong> (localhost:1234) or <strong>Ollama</strong> (localhost:11434) and click refresh.</p></div>`;
    }
  }, 500);
}

function addChatMessage(content, role) {
  const messagesContainer = document.getElementById('aiChatMessages');
  const messageEl = document.createElement('div');
  messageEl.className = `ai-message ${role}`;

  if (role === 'user') {
    messageEl.textContent = content;
  } else {
    messageEl.innerHTML = `<div class="markdown-content">${marked.parse(content)}</div>`;
  }

  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function clearAIChat() {
  const messagesContainer = document.getElementById('aiChatMessages');
  messagesContainer.innerHTML = `
    <div class="ai-message assistant">
      <div class="markdown-content">
        <p>👋 Hello! I'm your AI workspace assistant powered by <strong>local LLM</strong>.</p>
        <p>Check the status indicator above. If no LLM is detected, start one and click refresh.</p>
      </div>
    </div>
  `;
}

// Export for potential external use
export { switchView, toggleTheme, sendAIMessage, clearAIChat };
