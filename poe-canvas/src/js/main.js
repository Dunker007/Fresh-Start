// main.js - App initialization and event binding
import { loadState, saveState } from './state.js';
import { detectLocalLLM, sendToLocalLLM, setAppState as setLLMState } from './llm.js';
import { checkFilesystemBridge, loadDirectory, goUpDirectory, setAppState as setFSState } from './filesystem.js';
import { initUI, showToast, openModal, closeModal } from './ui.js';
import { initTasks, renderTasks, addTask, setAppState as setTasksState } from './tasks.js';
import { initNotes, renderNotes, addNote, setAppState as setNotesState } from './notes.js';
import { initProjects, renderProjects, addProject, setAppState as setProjectsState } from './projects.js';
import { initTimer, renderTimer, setAppState as setTimerState } from './timer.js';
import { initCalendar, renderCalendar, setAppState as setCalendarState } from './calendar.js';
import { initLayout, renderLayout, addLayoutItem, clearLayout, setAppState as setLayoutState } from './layout.js';
import { setAppState as setAIState, showAIContextMenu, setupAITemplates } from './ai-assistant.js';

let appState = null;

// Initialize app
window.addEventListener('DOMContentLoaded', async () => {
  appState = loadState();
  window.appState = appState;

  // Pass state to all modules
  setLLMState(appState);
  setFSState(appState);
  setTasksState(appState);
  setNotesState(appState);
  setProjectsState(appState);
  setTimerState(appState);
  setCalendarState(appState);
  setLayoutState(appState);
  setAIState(appState);

  // Setup theme
  setupTheme();

  // Initialize UI components
  initUI(appState);
  initTasks(appState);
  initNotes(appState);
  initProjects(appState);
  initTimer(appState);
  initCalendar(appState);
  initLayout(appState);

  // Setup event listeners
  setupEventListeners();
  setupAITemplates();

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

  // Gemini Settings handlers
  document.getElementById('geminiSettingsBtn')?.addEventListener('click', () => {
    const key = localStorage.getItem('gemini_api_key');
    if (key) {
      document.getElementById('geminiKeyInput').value = key;
    }
    openModal('geminiSettingsModal');
  });

  document.getElementById('saveGeminiKeyBtn')?.addEventListener('click', async () => {
    const keyInput = document.getElementById('geminiKeyInput');
    const apiKey = keyInput.value.trim();

    if (!apiKey) {
      localStorage.removeItem('gemini_api_key');
      showToast('Gemini key removed', 'info');
      closeModal('geminiSettingsModal');
      detectLocalLLM();
      return;
    }

    // Validate key
    const btn = document.getElementById('saveGeminiKeyBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Validating...';
    btn.disabled = true;

    try {
      const { validateKey } = await import('./gemini-client.js');
      const isValid = await validateKey(apiKey);

      if (isValid) {
        localStorage.setItem('gemini_api_key', apiKey);
        showToast('Gemini API Key saved!', 'success');
        closeModal('geminiSettingsModal');
        detectLocalLLM(); // Refresh connection status
      } else {
        showToast('Invalid API Key', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Validation failed', 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  // Filesystem handlers
  document.getElementById('goDesktop')?.addEventListener('click', () => loadDirectory(appState.fs.paths.desktop || ''));
  document.getElementById('goDocuments')?.addEventListener('click', () => loadDirectory(appState.fs.paths.documents || ''));
  document.getElementById('goDownloads')?.addEventListener('click', () => loadDirectory(appState.fs.paths.downloads || ''));
  document.getElementById('goUp')?.addEventListener('click', goUpDirectory);
  document.getElementById('refreshFiles')?.addEventListener('click', () => {
    if (appState.fs.currentPath) loadDirectory(appState.fs.currentPath);
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
  appState.currentView = view;

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
      if (connected && !appState.fs.currentPath) {
        loadDirectory(appState.fs.paths.desktop);
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

  if (appState.llm.connected) {
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
