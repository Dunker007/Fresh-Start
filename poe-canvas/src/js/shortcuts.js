// shortcuts.js - Keyboard shortcuts module
import { openModal, closeModal } from './ui.js';
import { toggleTimer } from './timer.js';

// Shortcut definitions: key combos mapped to actions
const shortcuts = {
  // New items
  'ctrl+n': { action: () => openModal('taskModal'), description: 'New Task' },
  'ctrl+shift+n': { action: () => openModal('noteModal'), description: 'New Note' },

  // Command palette (will be connected when commands.js is ready)
  'ctrl+k': { action: () => openCommandPalette(), description: 'Command Palette' },

  // Search
  'ctrl+f': { action: () => focusGlobalSearch(), description: 'Focus Search' },

  // View switching
  'ctrl+1': { action: () => switchToView('dashboard'), description: 'Dashboard View' },
  'ctrl+2': { action: () => switchToView('files'), description: 'Files View' },
  'ctrl+3': { action: () => switchToView('canvas'), description: 'Layout View' },
  'ctrl+4': { action: () => switchToView('ai'), description: 'AI View' },

  // Utilities
  'escape': { action: () => closeAllModals(), description: 'Close Modal' },
  'ctrl+d': { action: () => toggleTheme(), description: 'Toggle Theme' },
  'ctrl+t': { action: () => toggleTimer(), description: 'Start/Pause Timer' },
};

// Track if command palette is available
let commandPaletteHandler = null;

/**
 * Register command palette opener
 * Called by commands.js when it initializes
 */
export function registerCommandPalette(handler) {
  commandPaletteHandler = handler;
}

/**
 * Open command palette if available
 */
function openCommandPalette() {
  if (commandPaletteHandler) {
    commandPaletteHandler();
  } else {
    // Fallback: show toast indicating it's not yet available
    window.showToast?.('Command palette coming soon!', 'info');
  }
}

/**
 * Focus the global search input
 */
function focusGlobalSearch() {
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.focus();
    searchInput.select();
  }
}

/**
 * Switch to a specific view
 */
function switchToView(viewName) {
  // Find and click the nav item to trigger the existing switchView logic
  const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (navItem) {
    navItem.click();
  }
}

/**
 * Toggle dark/light theme
 */
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
}

/**
 * Close all open modals
 */
function closeAllModals() {
  // Close command palette first if open
  const commandPalette = document.getElementById('commandPalette');
  if (commandPalette?.classList.contains('active')) {
    commandPalette.classList.remove('active');
    return; // Only close one thing at a time
  }

  // Close any open modal overlays
  const activeModals = document.querySelectorAll('.modal-overlay.active');
  if (activeModals.length > 0) {
    activeModals.forEach(modal => modal.classList.remove('active'));
    return;
  }

  // Close any open dropdowns
  document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
    menu.classList.remove('active');
  });
}

/**
 * Parse a keyboard event into a normalized key combo string
 */
function getKeyCombo(e) {
  const parts = [];

  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');

  // Normalize key name
  let key = e.key.toLowerCase();

  // Handle special keys
  if (key === ' ') key = 'space';
  if (key === 'arrowup') key = 'up';
  if (key === 'arrowdown') key = 'down';
  if (key === 'arrowleft') key = 'left';
  if (key === 'arrowright') key = 'right';

  // Don't add modifier keys themselves to the combo
  if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}

/**
 * Check if an element is an input that should capture keyboard events
 */
function isInputElement(el) {
  const tagName = el.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || el.isContentEditable;
}

/**
 * Initialize keyboard shortcuts
 */
export function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Get the key combo
    const combo = getKeyCombo(e);

    // Check if we have a shortcut for this combo
    const shortcut = shortcuts[combo];

    if (!shortcut) return;

    // Special handling for certain shortcuts in input fields
    const inInput = isInputElement(document.activeElement);

    // Escape should always work
    if (combo === 'escape') {
      shortcut.action();
      e.preventDefault();
      return;
    }

    // Ctrl+K for command palette should always work
    if (combo === 'ctrl+k') {
      shortcut.action();
      e.preventDefault();
      return;
    }

    // Don't trigger other shortcuts when typing in an input
    if (inInput) return;

    // Execute the shortcut
    shortcut.action();
    e.preventDefault();
  });

  console.log('Keyboard shortcuts initialized');
}

/**
 * Get all available shortcuts for display (e.g., in help or command palette)
 */
export function getShortcutsList() {
  return Object.entries(shortcuts).map(([combo, { description }]) => ({
    combo: combo.replace('ctrl', 'Ctrl').replace('shift', 'Shift').replace('alt', 'Alt'),
    description
  }));
}

export default { initShortcuts, registerCommandPalette, getShortcutsList };
