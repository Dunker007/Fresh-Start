// db.js - JSON Persistence (Fallback for missing native build tools)
// Implements the same API as the SQLite version for compatibility
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let dbPath;
let data = {
  tasks: [],
  notes: [],
  projects: [],
  workspaces: [],
  bookmarks: [],
  layout_items: [],
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

function getAll(table) {
  return data[table] || [];
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

// Full State Load
function loadFullState() {
  return {
    tasks: getAll('tasks'),
    notes: getAll('notes'),
    projects: getAll('projects'),
    workspaces: getAll('workspaces'),
    bookmarks: getAll('bookmarks'),
    layoutItems: getAll('layout_items'), // Handle legacy key mapping if needed
    timerState: getKV('timerState') || { time: 1500, running: false },
    calendar: getKV('calendar') || { month: new Date().getMonth(), year: new Date().getFullYear() },
    currentView: getKV('currentView') || 'dashboard',
    currentWorkspace: getKV('currentWorkspace') || 'default'
  };
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
