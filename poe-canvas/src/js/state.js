// Nexus Workspace - State Management
// Central state store with persistence hooks

const AppState = {
  currentView: 'dashboard',
  currentWorkspace: 'default',
  tasks: [],
  notes: [],
  projects: [],
  workspaces: [{ id: 'default', name: 'Personal', color: '#4285f4' }],
  files: [],
  bookmarks: [],
  layoutItems: [],
  timerState: {
    time: 1500,
    running: false,
    interval: null
  },
  calendar: {
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  },
  editingTask: null,
  editingNote: null,
  aiMessages: [],
  
  // LLM Configuration (for local LLM integration)
  llmConfig: {
    provider: null, // 'lmstudio' | 'ollama' | 'poe'
    endpoint: null,
    model: null,
    available: []
  }
};

// Generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Date helpers
function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// State persistence (will be replaced with SQLite)
function saveState() {
  try {
    const data = {
      tasks: AppState.tasks,
      notes: AppState.notes,
      projects: AppState.projects,
      workspaces: AppState.workspaces,
      bookmarks: AppState.bookmarks,
      layoutItems: AppState.layoutItems
    };
    localStorage.setItem('nexus-workspace', JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function loadState() {
  try {
    const data = localStorage.getItem('nexus-workspace');
    if (data) {
      const parsed = JSON.parse(data);
      Object.assign(AppState, parsed);
      return true;
    }
  } catch (e) {
    console.warn('Could not load state:', e);
  }
  return false;
}

// Export for use in other modules
export { AppState, generateId, getTodayStr, getTomorrowStr, saveState, loadState };
