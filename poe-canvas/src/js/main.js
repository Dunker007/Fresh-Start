// main.js - App initialization and event binding
import { initAppState, getState } from './state.js';
import { detectLocalLLM, sendToLocalLLM } from './llm.js';
import { checkFilesystemBridge, loadDirectory, goUpDirectory, createFolder, handleFileUpload, initFilesystem } from './filesystem.js';
import { initUI, showToast, openModal, closeModal, debounce, switchView, toggleTheme } from './ui.js';
import { initTasks, renderTasks, addTask } from './tasks.js';
import { initNotes, renderNotes, addNote } from './notes.js';
import { initProjects, renderProjects, addProject } from './projects.js';
import { initTimer, renderTimer } from './timer.js';
import { initCalendar, renderCalendar } from './calendar.js';
import { initLayout, renderLayout, addLayoutItem, clearLayout } from './layout.js';
import { showAIContextMenu } from './ai/ui.js';
import { initShortcuts } from './shortcuts.js';
import { initCommands } from './commands.js';
import * as google from './google/index.js';
import { callGemini } from './gemini-client.js';

// Initialize app
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize state once - all modules use getState()
  const appState = await initAppState();
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
  initShortcuts();
  initCommands();
  initFilesystem();

  // Setup event listeners
  setupEventListeners();
  setupGlobalSearch();

  // Detect external services
  try { await detectLocalLLM(); } catch (e) { console.log('LLM detection failed:', e); }

  // Initialize Google Auth if client ID is configured
  const googleClientId = localStorage.getItem('google_client_id');
  if (googleClientId) {
    try {
      google.auth.initAuth(googleClientId);
      console.log('Google Auth initialized');
    } catch (e) {
      console.log('Google Auth init failed:', e);
    }
  }

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

  // Settings
  document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
    openModal('settingsModal');
    updateGoogleAuthUI();
  });

  // Google Auth
  document.getElementById('googleConnectBtn')?.addEventListener('click', handleGoogleConnect);
  document.getElementById('googleDisconnectBtn')?.addEventListener('click', handleGoogleDisconnect);

  // Listen for view changes to trigger specific renders
  window.addEventListener('view-changed', (e) => {
    const view = e.detail.view;
    if (view === 'canvas') renderLayout();
    if (view === 'files') {
      checkFilesystemBridge().then(connected => {
        const state = getState();
        if (connected && !state.fs.currentPath) {
          loadDirectory(state.fs.paths.desktop);
        }
      });
    }
  });
}



// AI Chat functions
const GEMINI_API_KEY = 'AIzaSyCV65hbezqKd3wxzakujlYtFIAeDlm9KjI';

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

  // Try Local LLM first
  if (getState().llm.connected) {
    try {
      const response = await sendToLocalLLM(message);
      updateAssistantMessage(loadingId, response);
      return;
    } catch (err) {
      console.error('Local LLM error, falling back to Gemini:', err);
      updateAssistantMessage(loadingId, `Local LLM failed. Retrying with Gemini...`, true);
    }
  }

  // Fallback to Gemini API
  if (GEMINI_API_KEY) {
    try {
      const statusText = document.getElementById('llmStatusText');
      if (statusText) statusText.textContent = 'Gemini';
      const response = await callGemini(message, GEMINI_API_KEY);
      updateAssistantMessage(loadingId, response);
      if (statusText && !getState().llm.connected) statusText.textContent = 'No local LLM';
      return;
    } catch (err) {
      console.error('Gemini API error:', err);
      updateAssistantMessage(loadingId, `Gemini API Error: ${err.message}`, true);
      return;
    }
  }

  // Fallback to Demo mode
  setTimeout(() => {
    const demoMessage = `No LLM connected and no Gemini API key provided. Start <strong>LM Studio</strong> (localhost:1234) or <strong>Ollama</strong> (localhost:11434) and click refresh.`;
    updateAssistantMessage(loadingId, demoMessage, true);
  }, 500);
}

function updateAssistantMessage(elementId, content, isError = false) {
  const element = document.getElementById(elementId);
  if (element) {
    if (isError) {
      element.innerHTML = `<div class="markdown-content"><p style="color: var(--accent-danger);">${content}</p></div>`;
    } else {
      element.innerHTML = `<div class="markdown-content">${marked.parse(content)}</div>`;
    }
    element.parentElement.scrollTop = element.parentElement.scrollHeight;
  }
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

// ============================================
// Global Search
// ============================================

function setupGlobalSearch() {
  const searchInput = document.getElementById('globalSearch');
  if (!searchInput) return;

  // Create search results dropdown
  const resultsDropdown = document.createElement('div');
  resultsDropdown.id = 'searchResults';
  resultsDropdown.className = 'search-results-dropdown';
  searchInput.parentElement.appendChild(resultsDropdown);

  // Debounced search handler
  const handleSearch = debounce((query) => {
    if (!query.trim()) {
      resultsDropdown.classList.remove('active');
      return;
    }

    const results = performSearch(query.toLowerCase());
    renderSearchResults(results, resultsDropdown, query);
  }, 250);

  searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

  // Close on blur (with delay to allow clicking results)
  searchInput.addEventListener('blur', () => {
    setTimeout(() => resultsDropdown.classList.remove('active'), 200);
  });

  // Handle keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = resultsDropdown.querySelectorAll('.search-result-item');
    const activeItem = resultsDropdown.querySelector('.search-result-item.active');
    let activeIndex = Array.from(items).indexOf(activeItem);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex < items.length - 1) {
        activeIndex++;
      }
      if (activeItem) activeItem.classList.remove('active');
      items[activeIndex]?.classList.add('active');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex > 0) {
        activeIndex--;
      }
      if (activeItem) activeItem.classList.remove('active');
      items[activeIndex]?.classList.add('active');
    } else if (e.key === 'Enter') {
      if (activeItem) {
        e.preventDefault();
        activeItem.click();
      }
    }
  });
}

function performSearch(query) {
  const state = getState();
  const results = [];

  // Search tasks
  state.tasks.forEach(task => {
    if (task.title.toLowerCase().includes(query) ||
      (task.tags && task.tags.some(t => t.toLowerCase().includes(query)))) {
      results.push({
        type: 'task',
        icon: 'fa-check-circle',
        title: task.title,
        subtitle: task.completed ? 'Completed' : (task.dueDate || 'No due date'),
        data: task
      });
    }
  });

  // Search notes
  state.notes.forEach(note => {
    if (note.title.toLowerCase().includes(query) ||
      (note.content && note.content.toLowerCase().includes(query))) {
      results.push({
        type: 'note',
        icon: 'fa-sticky-note',
        title: note.title,
        subtitle: note.content ? note.content.substring(0, 50) + '...' : 'Empty note',
        data: note
      });
    }
  });

  // Search projects
  state.projects.forEach(project => {
    if (project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query))) {
      results.push({
        type: 'project',
        icon: 'fa-project-diagram',
        title: project.name,
        subtitle: project.description || 'No description',
        data: project
      });
    }
  });

  // Search bookmarks
  if (state.bookmarks) {
    state.bookmarks.forEach(bookmark => {
      if (bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query)) {
        results.push({
          type: 'bookmark',
          icon: 'fa-bookmark',
          title: bookmark.title,
          subtitle: bookmark.url,
          data: bookmark
        });
      }
    });
  }

  return results.slice(0, 10); // Limit to 10 results
}

function renderSearchResults(results, container, query) {
  if (results.length === 0) {
    container.innerHTML = `
      <div class="search-no-results">
        <i class="fas fa-search"></i>
        <span>No results for "${query}"</span>
      </div>
    `;
    container.classList.add('active');
    return;
  }

  container.innerHTML = results.map((result, index) => `
    <div class="search-result-item${index === 0 ? ' active' : ''}" data-type="${result.type}" data-id="${result.data.id}">
      <i class="fas ${result.icon}"></i>
      <div class="search-result-content">
        <div class="search-result-title">${highlightMatch(result.title, query)}</div>
        <div class="search-result-subtitle">${result.subtitle}</div>
      </div>
      <span class="search-result-type">${result.type}</span>
    </div>
  `).join('');

  // Add click handlers
  container.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      handleSearchResultClick(item.dataset.type, item.dataset.id);
      container.classList.remove('active');
      document.getElementById('globalSearch').value = '';
    });
  });

  container.classList.add('active');
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function handleSearchResultClick(type, id) {
  // Switch to dashboard view for most items
  if (type !== 'bookmark') {
    switchView('dashboard');
  }

  // Scroll to or highlight the item
  setTimeout(() => {
    let element;
    switch (type) {
      case 'task':
        element = document.querySelector(`[data-task-id="${id}"]`);
        break;
      case 'note':
        element = document.querySelector(`[data-note-id="${id}"]`);
        break;
      case 'project':
        element = document.querySelector(`[data-project-id="${id}"]`);
        break;
      case 'bookmark':
        const state = getState();
        const bookmark = state.bookmarks?.find(b => b.id === id);
        if (bookmark) window.open(bookmark.url, '_blank');
        return;
    }

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-flash');
      setTimeout(() => element.classList.remove('highlight-flash'), 1500);
    }
  }, 100);
}

// Export for potential external use
export { switchView, toggleTheme, sendAIMessage, clearAIChat };

// ============================================
// Google Auth Handlers
// ============================================

function updateGoogleAuthUI() {
  const clientIdInput = document.getElementById('googleClientIdInput');
  const statusDot = document.querySelector('#googleAuthStatus .status-dot');
  const statusText = document.querySelector('#googleAuthStatus .status-text');
  const connectBtn = document.getElementById('googleConnectBtn');
  const disconnectBtn = document.getElementById('googleDisconnectBtn');

  // Load saved Client ID
  if (clientIdInput && !clientIdInput.value) {
    clientIdInput.value = localStorage.getItem('google_client_id') || '';
  }

  if (google.auth.isAuthenticated()) {
    statusDot.style.background = 'var(--accent-success)';
    statusText.textContent = 'Connected';
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'block';
    if (clientIdInput) clientIdInput.disabled = true;
  } else {
    statusDot.style.background = 'var(--text-muted)';
    statusText.textContent = 'Not Connected';
    connectBtn.style.display = 'block';
    disconnectBtn.style.display = 'none';
    if (clientIdInput) clientIdInput.disabled = false;
  }
}

function handleGoogleConnect() {
  const clientId = document.getElementById('googleClientIdInput').value.trim();
  if (!clientId) {
    showToast('Please enter a Client ID', 'error');
    return;
  }

  localStorage.setItem('google_client_id', clientId);

  try {
    google.auth.initAuth(clientId);
    google.auth.signIn();
  } catch (e) {
    console.error('Auth error:', e);
    showToast('Failed to initialize Google Auth', 'error');
  }
}

function handleGoogleDisconnect() {
  google.auth.signOut();
  updateGoogleAuthUI();
  showToast('Disconnected from Google', 'info');
}

// Listen for auth success event
window.addEventListener('google-auth-success', () => {
  updateGoogleAuthUI();
  showToast('Successfully connected to Google!', 'success');
});

window.addEventListener('google-auth-signout', () => {
  updateGoogleAuthUI();
});
