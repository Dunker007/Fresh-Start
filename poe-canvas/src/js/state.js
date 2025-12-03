// state.js - Central app state + persistence

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

export function loadState() {
  try {
    const raw = localStorage.getItem('nexusWorkspaceState');
    return raw ? { ...createInitialState(), ...JSON.parse(raw) } : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem('nexusWorkspaceState', JSON.stringify(state));
  } catch {}
}

export function updateState(state, fn) {
  fn(state);
  saveState(state);
  return state;
}

export default { createInitialState, loadState, saveState, updateState, generateId, getTodayStr, getTomorrowStr };
