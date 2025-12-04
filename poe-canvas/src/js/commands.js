import { getState } from './state.js';
import { openModal, debounce, switchView } from './ui.js';
import { registerCommandPalette } from './shortcuts.js';
import { toggleTimer } from './timer.js';
import { detectLocalLLM } from './llm.js';

// ============================================
// Command Definitions
// ============================================

const commands = [
  // Navigation
  { id: 'view-dashboard', label: 'Go to Dashboard', keywords: ['home', 'main', 'view'], icon: 'fa-th-large', shortcut: 'Ctrl+1', section: 'Navigation', action: () => switchView('dashboard') },
  { id: 'view-files', label: 'Go to Files', keywords: ['folder', 'browse', 'view'], icon: 'fa-folder', shortcut: 'Ctrl+2', section: 'Navigation', action: () => switchView('files') },
  { id: 'view-layout', label: 'Go to Layout Planner', keywords: ['canvas', 'zone', 'view'], icon: 'fa-object-group', shortcut: 'Ctrl+3', section: 'Navigation', action: () => switchView('canvas') },
  { id: 'view-ai', label: 'Go to AI Assistant', keywords: ['chat', 'llm', 'view'], icon: 'fa-robot', shortcut: 'Ctrl+4', section: 'Navigation', action: () => switchView('ai') },

  // Create
  { id: 'new-task', label: 'New Task', keywords: ['add', 'create', 'todo'], icon: 'fa-check-circle', shortcut: 'Ctrl+N', section: 'Create', action: () => openModal('taskModal') },
  { id: 'new-note', label: 'New Note', keywords: ['add', 'create', 'write'], icon: 'fa-sticky-note', shortcut: 'Ctrl+Shift+N', section: 'Create', action: () => openModal('noteModal') },
  { id: 'new-project', label: 'New Project', keywords: ['add', 'create'], icon: 'fa-project-diagram', section: 'Create', action: () => openModal('projectModal') },
  { id: 'new-bookmark', label: 'New Bookmark', keywords: ['add', 'create', 'link', 'url'], icon: 'fa-bookmark', section: 'Create', action: () => openModal('bookmarkModal') },

  // AI
  { id: 'ai-ask', label: 'AI: Ask Question', keywords: ['chat', 'gpt', 'llm'], icon: 'fa-comment-alt', section: 'AI', action: () => { switchView('ai'); setTimeout(() => document.getElementById('aiInput')?.focus(), 100); } },
  { id: 'ai-refresh', label: 'AI: Refresh Models', keywords: ['reload', 'connect'], icon: 'fa-sync', section: 'AI', action: detectLocalLLM },

  // Actions
  { id: 'toggle-theme', label: 'Toggle Theme', keywords: ['dark', 'light', 'mode', 'color'], icon: 'fa-moon', shortcut: 'Ctrl+D', section: 'Actions', action: () => document.documentElement.classList.toggle('dark') },
  { id: 'toggle-timer', label: 'Start/Pause Timer', keywords: ['pomodoro', 'focus', 'time'], icon: 'fa-clock', shortcut: 'Ctrl+T', section: 'Actions', action: toggleTimer },
  { id: 'focus-search', label: 'Focus Search', keywords: ['find', 'filter'], icon: 'fa-search', shortcut: 'Ctrl+F', section: 'Actions', action: () => document.getElementById('globalSearch')?.focus() },
  { id: 'export-data', label: 'Export Data', keywords: ['save', 'backup', 'download'], icon: 'fa-download', section: 'Actions', action: () => document.getElementById('exportBtn')?.click() },
];

// Recent commands (stored in memory for session)
let recentCommandIds = [];
const MAX_RECENT = 3;

// ============================================
// Command Palette State
// ============================================

let paletteEl = null;
let inputEl = null;
let resultsEl = null;
let activeIndex = 0;
let filteredCommands = [];
let filteredItems = []; // Combined commands + items

// ============================================
// Initialization
// ============================================

export function initCommands() {
  // Create command palette DOM
  createCommandPaletteDOM();

  // Register the open function with the shortcuts module
  registerCommandPalette(openCommandPalette);

  console.log('Command palette initialized');
}

function createCommandPaletteDOM() {
  // Create overlay
  paletteEl = document.createElement('div');
  paletteEl.id = 'commandPalette';
  paletteEl.className = 'command-palette-overlay';
  paletteEl.innerHTML = `
    <div class="command-palette">
      <div class="command-palette-input-wrapper">
        <i class="fas fa-terminal"></i>
        <input type="text" class="command-palette-input" id="commandInput" placeholder="Type a command or search..." autocomplete="off">
        <span class="command-palette-hint">esc to close</span>
      </div>
      <div class="command-results" id="commandResults"></div>
      <div class="command-palette-footer">
        <span><kbd>↑↓</kbd> to navigate</span>
        <span><kbd>Enter</kbd> to select</span>
        <span><kbd>Esc</kbd> to close</span>
      </div>
    </div>
  `;

  document.body.appendChild(paletteEl);

  // Get references
  inputEl = document.getElementById('commandInput');
  resultsEl = document.getElementById('commandResults');

  // Setup event listeners
  setupPaletteEvents();
}

function setupPaletteEvents() {
  // Close on overlay click
  paletteEl.addEventListener('click', (e) => {
    if (e.target === paletteEl) {
      closeCommandPalette();
    }
  });

  // Input handling with debounce
  const debouncedFilter = debounce((query) => {
    filterAndRender(query);
  }, 100);

  inputEl.addEventListener('input', (e) => {
    debouncedFilter(e.target.value);
  });

  // Keyboard navigation
  inputEl.addEventListener('keydown', (e) => {
    const items = resultsEl.querySelectorAll('.command-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        updateActiveItem(items);
        break;

      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        updateActiveItem(items);
        break;

      case 'Enter':
        e.preventDefault();
        if (items[activeIndex]) {
          items[activeIndex].click();
        }
        break;

      case 'Escape':
        e.preventDefault();
        closeCommandPalette();
        break;
    }
  });
}

function updateActiveItem(items) {
  items.forEach((item, i) => {
    item.classList.toggle('active', i === activeIndex);
  });

  // Scroll into view
  items[activeIndex]?.scrollIntoView({ block: 'nearest' });
}

// ============================================
// Open / Close
// ============================================

export function openCommandPalette() {
  paletteEl.classList.add('active');
  inputEl.value = '';
  inputEl.focus();
  activeIndex = 0;
  filterAndRender('');
}

export function closeCommandPalette() {
  paletteEl.classList.remove('active');
  inputEl.value = '';
}

// ============================================
// Filtering and Rendering
// ============================================

function filterAndRender(query) {
  const lowerQuery = query.toLowerCase().trim();

  // Get state items (tasks, notes, projects)
  const state = getState();
  const stateItems = [];

  // Add tasks
  state.tasks.forEach(task => {
    stateItems.push({
      id: `task-${task.id}`,
      type: 'task',
      label: task.title,
      keywords: task.tags || [],
      icon: 'fa-check-circle',
      section: 'Tasks',
      action: () => navigateToItem('task', task.id)
    });
  });

  // Add notes
  state.notes.forEach(note => {
    stateItems.push({
      id: `note-${note.id}`,
      type: 'note',
      label: note.title,
      keywords: [note.content || ''],
      icon: 'fa-sticky-note',
      section: 'Notes',
      action: () => navigateToItem('note', note.id)
    });
  });

  // Add projects
  state.projects.forEach(project => {
    stateItems.push({
      id: `project-${project.id}`,
      type: 'project',
      label: project.name,
      keywords: [project.description || ''],
      icon: 'fa-project-diagram',
      section: 'Projects',
      action: () => navigateToItem('project', project.id)
    });
  });

  // Combine commands and state items
  const allItems = [...commands, ...stateItems];

  // Filter
  if (!lowerQuery) {
    // Show recent + all commands when empty
    const recentItems = recentCommandIds
      .map(id => commands.find(c => c.id === id))
      .filter(Boolean);

    filteredItems = lowerQuery ? allItems : [...recentItems, ...commands.filter(c => !recentCommandIds.includes(c.id))];
  } else {
    filteredItems = allItems.filter(item => {
      const labelMatch = item.label.toLowerCase().includes(lowerQuery);
      const keywordMatch = item.keywords?.some(k => k.toLowerCase().includes(lowerQuery));
      const sectionMatch = item.section?.toLowerCase().includes(lowerQuery);
      return labelMatch || keywordMatch || sectionMatch;
    });
  }

  renderResults(lowerQuery);
}

function renderResults(query) {
  if (filteredItems.length === 0) {
    resultsEl.innerHTML = `
      <div class="search-no-results">
        <i class="fas fa-terminal"></i>
        <span>No commands or items found</span>
      </div>
    `;
    return;
  }

  // Group by section
  const grouped = {};
  const recentSection = 'Recent';

  // Mark recent items
  const recentIds = new Set(recentCommandIds);

  filteredItems.forEach((item, idx) => {
    let section = item.section || 'Other';

    // Show recent section for recent items when no query
    if (!query && recentIds.has(item.id) && idx < recentCommandIds.length) {
      section = recentSection;
    }

    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(item);
  });

  // Render
  let html = '';
  let globalIndex = 0;

  // Order sections
  const sectionOrder = [recentSection, 'Navigation', 'Create', 'Actions', 'Tasks', 'Notes', 'Projects', 'Other'];
  const sortedSections = Object.keys(grouped).sort((a, b) => {
    return sectionOrder.indexOf(a) - sectionOrder.indexOf(b);
  });

  for (const section of sortedSections) {
    const items = grouped[section];
    if (!items || items.length === 0) continue;

    html += `<div class="command-section-title">${section}</div>`;

    for (const item of items) {
      const isActive = globalIndex === activeIndex;
      html += `
        <div class="command-item${isActive ? ' active' : ''}" data-index="${globalIndex}" data-id="${item.id}">
          <i class="fas ${item.icon}"></i>
          <div class="command-item-content">
            <div class="command-item-label">${highlightMatch(item.label, query)}</div>
          </div>
          ${item.shortcut ? `<span class="command-item-shortcut">${item.shortcut}</span>` : ''}
        </div>
      `;
      globalIndex++;
    }
  }

  resultsEl.innerHTML = html;

  // Add click handlers
  resultsEl.querySelectorAll('.command-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const item = filteredItems.find(i => i.id === id);
      if (item) {
        executeCommand(item);
      }
    });

    el.addEventListener('mouseenter', () => {
      activeIndex = parseInt(el.dataset.index);
      updateActiveItem(resultsEl.querySelectorAll('.command-item'));
    });
  });
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ============================================
// Command Execution
// ============================================

function executeCommand(command) {
  // Track recent (only for actual commands, not items)
  if (commands.find(c => c.id === command.id)) {
    recentCommandIds = [command.id, ...recentCommandIds.filter(id => id !== command.id)].slice(0, MAX_RECENT);
  }

  // Close palette
  closeCommandPalette();

  // Execute action
  if (command.action) {
    command.action();
  }
}

// ============================================
// Navigation Helper
// ============================================

function navigateToItem(type, id) {
  // Switch to dashboard
  switchView('dashboard');

  // Find and highlight element
  setTimeout(() => {
    let selector;
    switch (type) {
      case 'task':
        selector = `[data-task-id="${id}"]`;
        break;
      case 'note':
        selector = `[data-note-id="${id}"]`;
        break;
      case 'project':
        selector = `[data-project-id="${id}"]`;
        break;
    }

    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-flash');
      setTimeout(() => el.classList.remove('highlight-flash'), 1500);
    }
  }, 100);
}

export default { initCommands, openCommandPalette, closeCommandPalette };
