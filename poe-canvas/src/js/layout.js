// layout.js - Layout planner (drag/drop zones)
import { getState, updateState, generateId } from './state.js';

export function initLayout() {
  // Layout initialization
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
    el.style.background = item.color || 'var(--accent-primary)';
    el.innerHTML = `
      <div class="layout-item-label">${item.label || 'Zone'}</div>
      <button class="layout-item-delete" onclick="window.deleteLayoutItem('${item.id}')">
        <i class="fas fa-times"></i>
      </button>
    `;

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
    x: item.x || 50,
    y: item.y || 50,
    width: item.width || 150,
    height: item.height || 100
  };

  updateState(s => s.layoutItems.push(newItem));
  renderLayout();
}

export function deleteLayoutItem(id) {
  updateState(s => {
    s.layoutItems = s.layoutItems.filter(i => i.id !== id);
  });
  renderLayout();
}

export function clearLayout() {
  updateState(s => {
    s.layoutItems = [];
  });
  renderLayout();
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
      dragState.el.style.zIndex = '';
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

export default { initLayout, renderLayout, addLayoutItem, deleteLayoutItem, clearLayout };
