import { openModal, closeModal } from './ui.js';
import { switchView, toggleTheme } from './main.js';
import { toggleTimer } from './timer.js';

let commandPaletteCallback = () => console.warn('Command palette not registered');

export function registerCommandPalette(callback) {
  commandPaletteCallback = callback;
}

const shortcutMappings = {
  'Ctrl+N': () => openModal('taskModal'),
  'Ctrl+Shift+N': () => openModal('noteModal'),
  'Ctrl+K': () => commandPaletteCallback(),
  'Ctrl+F': () => document.getElementById('globalSearch')?.focus(),
  'Ctrl+1': () => switchView('dashboard'),
  'Ctrl+2': () => switchView('files'),
  'Ctrl+3': () => switchView('canvas'),
  'Ctrl+4': () => switchView('ai'),
  'Escape': () => {
    // Close any open modal
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
      activeModal.classList.remove('active');
      return; // Prioritize closing modals over command palette
    }
    // If no modal, close command palette
    const palette = document.getElementById('commandPalette');
    if (palette && palette.classList.contains('active')) {
      palette.classList.remove('active');
    }
  },
  'Ctrl+D': toggleTheme,
  'Ctrl+T': toggleTimer,
};

function handleKeyDown(e) {
  // Ignore shortcuts in inputs, textareas, or contenteditable elements
  if (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
    // Allow Escape to work in inputs to close modals/palette
    if (e.key !== 'Escape') return;
  }

  const key = e.key.toUpperCase();
  const ctrl = e.ctrlKey || e.metaKey; // Meta for macOS
  const shift = e.shiftKey;

  let shortcutId = '';
  if (ctrl && shift) shortcutId = `Ctrl+Shift+${key}`;
  else if (ctrl) shortcutId = `Ctrl+${key}`;
  else if (key === 'ESCAPE') shortcutId = 'Escape';

  const command = shortcutMappings[shortcutId];

  if (command) {
    e.preventDefault();
    command();
  }
}

export function initShortcuts() {
  document.addEventListener('keydown', handleKeyDown);
  console.log('Keyboard shortcuts initialized');
}
