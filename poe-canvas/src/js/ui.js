// ui.js - Modal handling, toasts, dropdowns, common UI
import { updateState } from './state.js';

// ============================================
// Utility Functions: Debounce & Throttle
// ============================================

/**
 * Debounce a function - only executes after delay since last call
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds (default 300)
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function - executes at most once per limit period
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between executions in ms (default 100)
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 100) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// UI Initialization
// ============================================

export function initUI(state) {
  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

export function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) dropdown.classList.toggle('active');
}

export function closeDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) dropdown.classList.remove('active');
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer') || createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Make utilities globally available
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.debounce = debounce;
window.throttle = throttle;

export function toggleTheme() {
  document.documentElement.classList.toggle('dark');
}

export function switchView(view) {
  updateState(s => {
    s.currentView = view;
  });

  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  const views = ['dashboard', 'files', 'canvas', 'ai'];
  views.forEach(v => {
    const el = document.getElementById(`${v}View`);
    if (el) el.style.display = v === view ? '' : 'none';
  });

  // Trigger specific view renders via event for things not using state subscription yet (like files)
  window.dispatchEvent(new CustomEvent('view-changed', { detail: { view } }));
}

export default { initUI, openModal, closeModal, toggleDropdown, closeDropdown, showToast, escapeHtml, debounce, throttle, toggleTheme, switchView };
