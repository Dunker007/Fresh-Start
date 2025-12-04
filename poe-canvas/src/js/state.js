// state.js - Central app state + persistence

// Single source of truth for app state
let _appState = null;

/**
 * Get the current app state
 * @returns {Object} The app state object
 */
export function getState() {
  return _appState;
}

/**
 * Initialize app state (call once at startup)
 * @returns {Object} The initialized state
 */
/**
 * Initialize app state (call once at startup)
 * @returns {Object} The initialized state
 */
export async function initAppState() {
  _appState = await loadState();
  return _appState;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function createInitialState() {
  return {
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
    llm: {
      provider: null,
      model: null,
      models: [],
      connected: false
    },
    fs: {
      bridgeConnected: false,
      currentPath: null,
      paths: {},
      realFiles: []
    }
  };
}

// Listeners for state changes
const listeners = new Set();

/**
 * Subscribe to state changes
 * @param {Function} listener - Function to call when state changes
 * @returns {Function} Unsubscribe function
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners of a state change
 * @param {string} event - Event name (optional)
 * @param {any} data - Associated data (optional)
 */
export function notify(event = 'stateChanged', data = null) {
  listeners.forEach(listener => listener(_appState, event, data));
}

export async function loadState() {
  // Try loading from Electron DB
  if (window.electronAPI?.db) {
    try {
      const dbState = await window.electronAPI.db.loadState();
      if (dbState && (dbState.tasks.length > 0 || dbState.projects.length > 0)) {
        console.log('Loaded state from SQLite');
        return { ...createInitialState(), ...dbState };
      }
    } catch (e) {
      console.error('Failed to load from DB:', e);
    }
  }

  // Fallback to LocalStorage
  try {
    const raw = localStorage.getItem('nexusWorkspaceState');
    return raw ? { ...createInitialState(), ...JSON.parse(raw) } : createInitialState();
  } catch {
    return createInitialState();
  }
}

// Debounce save to avoid hammering DB
let saveTimeout;
export function saveState(state) {
  // Always save to localStorage as backup/fast cache
  try {
    localStorage.setItem('nexusWorkspaceState', JSON.stringify(state));
  } catch { }

  // Save to DB if available
  if (window.electronAPI?.db) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        // Save collections
        for (const task of state.tasks) await window.electronAPI.db.saveItem('tasks', task);
        for (const note of state.notes) await window.electronAPI.db.saveItem('notes', note);
        for (const project of state.projects) await window.electronAPI.db.saveItem('projects', project);
        for (const workspace of state.workspaces) await window.electronAPI.db.saveItem('workspaces', workspace);
        for (const bookmark of state.bookmarks) await window.electronAPI.db.saveItem('bookmarks', bookmark);
        for (const item of state.layoutItems) await window.electronAPI.db.saveItem('layout_items', item);

        // Save KV state
        await window.electronAPI.db.setKV('timerState', state.timerState);
        await window.electronAPI.db.setKV('calendar', state.calendar);
        await window.electronAPI.db.setKV('currentView', state.currentView);
        await window.electronAPI.db.setKV('currentWorkspace', state.currentWorkspace);

        console.log('State synced to SQLite');
      } catch (e) {
        console.error('Failed to sync to DB:', e);
      }
    }, 1000); // 1 second debounce
  }
}

export function updateState(stateOrFn, fn) {
  // Support both updateState(fn) and updateState(state, fn) for backwards compatibility
  const state = typeof stateOrFn === 'function' ? _appState : stateOrFn;
  const updateFn = typeof stateOrFn === 'function' ? stateOrFn : fn;

  updateFn(state);
  saveState(state);
  notify('stateUpdated', state); // Notify listeners
  return state;
}

export default { getState, initAppState, createInitialState, loadState, saveState, updateState, generateId, getTodayStr, getTomorrowStr, subscribe, notify };
