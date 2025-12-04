// db.js - JSON File-based Persistence (Fallback for missing native build tools)
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

let dbPath;
let data = {
  tasks: [
    { id: '1', title: 'Review project proposal', completed: false, due: getTodayStr(), priority: 'high', tags: ['work', 'urgent'], workspace_id: 'default' },
    { id: '2', title: 'Update documentation', completed: false, due: getTomorrowStr(), priority: 'medium', tags: ['docs'], workspace_id: 'default' },
    { id: '3', title: 'Team standup meeting', completed: true, due: getTodayStr(), priority: 'low', tags: ['meeting'], workspace_id: 'default' }
  ],
  notes: [
    { id: '1', title: 'Meeting Notes', content: 'Discussed Q4 roadmap priorities and resource allocation for the new project.', color: 'blue', workspace_id: 'default' },
    { id: '2', title: 'Ideas', content: 'Implement dark mode toggle\nAdd keyboard shortcuts\nIntegrate with calendar API', color: 'yellow', workspace_id: 'default' }
  ],
  projects: [
    { id: '1', name: 'Website Redesign', description: 'Complete overhaul of company website', color: '#4285f4', tasks: 12, completed: 5, workspace_id: 'default' },
    { id: '2', name: 'Mobile App', description: 'iOS and Android app development', color: '#34a853', tasks: 8, completed: 3, workspace_id: 'default' }
  ],
  workspaces: [{ id: 'default', name: 'Personal', color: '#4285f4' }],
  bookmarks: [
    { id: '1', title: 'Google Search', url: 'https://google.com', workspace_id: 'default' },
    { id: '2', title: 'GitHub', url: 'https://github.com', workspace_id: 'default' }
  ],
  layout_items: [
    { id: '1', label: 'Code Editor', color: '#4285f4', x: 20, y: 20, width: 200, height: 150, workspace_id: 'default' },
    { id: '2', label: 'Terminal', color: '#34a853', x: 240, y: 20, width: 150, height: 100, workspace_id: 'default' }
  ],
  kv_store: {}
};

function initDatabase() {
  const userDataPath = app.getPath('userData');
  dbPath = path.join(userDataPath, 'nexus-data.json');

  // Load existing data
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      const loaded = JSON.parse(raw);
      data = { ...data, ...loaded };
      console.log('Database loaded from', dbPath);
    } catch (e) {
      console.error('Failed to load database:', e);
    }
  } else {
    saveToDisk();
  }
}

function saveToDisk() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

// Generic CRUD helpers

function getAll(table, workspaceId = 'default') {
  if (!data[table]) return [];

  if (table === 'workspaces') {
    return data.workspaces;
  }

  // Filter by workspace if applicable
  // Note: In this simple JSON DB, we assume items have workspace_id property
  return data[table].filter(item => item.workspace_id === workspaceId || !item.workspace_id);
}

function saveItem(table, item) {
  if (!data[table]) data[table] = [];

  const index = data[table].findIndex(i => i.id === item.id);
  if (index >= 0) {
    data[table][index] = item;
  } else {
    data[table].push(item);
  }

  saveToDisk();
  return { success: true };
}

function deleteItem(table, id) {
  if (!data[table]) return { success: false };

  data[table] = data[table].filter(i => i.id !== id);
  saveToDisk();
  return { success: true };
}

function getKV(key) {
  return data.kv_store[key] || null;
}

function setKV(key, value) {
  data.kv_store[key] = value;
  saveToDisk();
  return { success: true };
}

// Full State Load/Save
function loadFullState() {
  const state = {
    tasks: getAll('tasks'),
    notes: getAll('notes'),
    projects: getAll('projects'),
    workspaces: getAll('workspaces'),
    bookmarks: getAll('bookmarks'),
    layoutItems: getAll('layout_items'),
    // Load misc state from KV
    timerState: getKV('timerState') || { time: 1500, running: false },
    calendar: getKV('calendar') || { month: new Date().getMonth(), year: new Date().getFullYear() },
    currentView: getKV('currentView') || 'dashboard',
    currentWorkspace: getKV('currentWorkspace') || 'default'
  };
  return state;
}

module.exports = {
  initDatabase,
  getAll,
  saveItem,
  deleteItem,
  getKV,
  setKV,
  loadFullState
};
