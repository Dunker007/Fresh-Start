// layout.js - Layout planner (drag/drop zones)
import { getState, updateState, generateId, subscribe } from './state.js';
import { escapeHtml, switchView } from './ui.js';

export function initLayout() {
  // Layout initialization
  subscribe((state, event, data) => {
    if (event === 'stateUpdated' || event === 'stateChanged') {
      // Only render if we are in the canvas view to save performance
      if (state.currentView === 'canvas') {
        renderLayout();
      }
    }
  });
}

export function renderLayout() {
  const state = getState();
  if (!state) return;

  const canvas = document.getElementById('layoutCanvas');
  if (!canvas) return;

  // Clear existing items (keep grid)
  canvas.querySelectorAll('.layout-item').forEach(el => el.remove());

  state.layoutItems.forEach(item => {
    const el = document.createElement('div');
    el.className = 'layout-item';
    el.dataset.id = item.id;
    el.style.left = item.x + 'px';
    el.style.top = item.y + 'px';
    el.style.width = item.width + 'px';
    el.style.height = item.height + 'px';
    el.style.zIndex = item.zIndex || 1;

    // Type-specific rendering
    if (item.type === 'note') {
      const note = state.notes.find(n => n.id === item.dataId);
      if (note) {
        el.style.background = note.color || '#fff9c4';
        el.style.borderLeft = `4px solid ${note.color ? 'rgba(0,0,0,0.1)' : '#fbbc04'}`;
        el.innerHTML = `
          <div class="layout-item-header">
            <i class="fas fa-sticky-note"></i>
            <span class="layout-item-label">${escapeHtml(note.title)}</span>
          </div>
          <div class="layout-item-content" style="font-size: 12px; padding: 4px; overflow: hidden;">
            ${escapeHtml(note.content || '').substring(0, 100)}
          </div>
        `;
      } else {
        el.innerHTML = `<div class="layout-item-label">Missing Note</div>`;
      }
    } else if (item.type === 'task') {
      const task = state.tasks.find(t => t.id === item.dataId);
      if (task) {
        el.style.background = 'var(--bg-secondary)';
        el.innerHTML = `
          <div class="layout-item-header">
            <i class="fas fa-check-circle" style="color: ${task.completed ? 'var(--accent-success)' : 'var(--text-muted)'}"></i>
            <span class="layout-item-label" style="${task.completed ? 'text-decoration: line-through;' : ''}">${escapeHtml(task.title)}</span>
          </div>
        `;
      } else {
        el.innerHTML = `<div class="layout-item-label">Missing Task</div>`;
      }
    } else {
      // Default Zone
      el.style.background = item.color || 'var(--accent-primary)';
      el.innerHTML = `<div class="layout-item-label">${item.label || 'Zone'}</div>`;
    }

    // Delete button (common)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'layout-item-delete';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteLayoutItem(item.id);
    };
    el.appendChild(deleteBtn);

    makeDraggable(el);
    makeResizable(el);
    canvas.appendChild(el);
  });
}

export function addLayoutItem(item) {
  const newItem = {
    id: generateId(),
    label: item.label || 'New Zone',
    color: item.color || '#4285f4',
    type: item.type || 'zone',
    dataId: item.dataId || null,
    x: item.x || 50,
    y: item.y || 50,
    width: item.width || 150,
    height: item.height || 100,
    zIndex: 1
  };

  updateState(s => s.layoutItems.push(newItem));
}

export function addNoteToCanvas(noteId) {
  const state = getState();
  const note = state.notes.find(n => n.id === noteId);
  if (!note) return;

  addLayoutItem({
    label: note.title,
    type: 'note',
    dataId: noteId,
    color: note.color,
    width: 200,
    height: 150
  });

  switchView('canvas');
  showToast('Note pinned to canvas', 'success');
}

export function addTaskToCanvas(taskId) {
  const state = getState();
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  addLayoutItem({
    label: task.title,
    type: 'task',
    dataId: taskId,
    width: 200,
    height: 80
  });

  switchView('canvas');
  showToast('Task pinned to canvas', 'success');
}

export function deleteLayoutItem(id) {
  updateState(s => {
    s.layoutItems = s.layoutItems.filter(i => i.id !== id);
  });
}

export function clearLayout() {
  updateState(s => {
    s.layoutItems = [];
  });
}

// Drag state - single instance to avoid listener leaks
let dragState = {
  el: null,
  startX: 0,
  startY: 0,
  origX: 0,
  origY: 0
};

// Single document listeners (initialized once)
let dragListenersInitialized = false;

function initDragListeners() {
  if (dragListenersInitialized) return;
  dragListenersInitialized = true;

  document.addEventListener('mousemove', (e) => {
    if (!dragState.el) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    dragState.el.style.left = (dragState.origX + dx) + 'px';
    dragState.el.style.top = (dragState.origY + dy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (dragState.el) {
      dragState.el.style.zIndex = dragState.el.dataset.zIndex || 1;
      saveLayoutItemPosition(dragState.el);
      dragState.el = null;
    }
  });
}

function makeDraggable(el) {
  initDragListeners();

  el.addEventListener('mousedown', (e) => {
    if (e.target.closest('.layout-item-delete')) return;
    dragState.el = el;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.origX = el.offsetLeft;
    dragState.origY = el.offsetTop;

    // Bring to front
    el.style.zIndex = 1000;
  });
}

function makeResizable(el) {
  // Simplified - full implementation would add resize handles
}

function saveLayoutItemPosition(el) {
  const id = el.dataset.id;

  updateState(s => {
    const item = s.layoutItems.find(i => i.id === id);
    if (item) {
      item.x = el.offsetLeft;
      item.y = el.offsetTop;
      item.width = el.offsetWidth;
      item.height = el.offsetHeight;
    }
  });
}

window.deleteLayoutItem = deleteLayoutItem;
window.addNoteToCanvas = addNoteToCanvas;
window.addTaskToCanvas = addTaskToCanvas;

export default { initLayout, renderLayout, addLayoutItem, deleteLayoutItem, clearLayout, addNoteToCanvas, addTaskToCanvas };
