// layout.js - Layout planner (drag/drop zones)
import { updateState, generateId } from './state.js';

let appState = null;

export function setAppState(state) {
  appState = state;
}

export function initLayout(state) {
  appState = state;
}

export function renderLayout() {
  if (!appState) return;
  
  const canvas = document.getElementById('layoutCanvas');
  if (!canvas) return;
  
  // Clear existing items (keep grid)
  canvas.querySelectorAll('.layout-item').forEach(el => el.remove());
  
  appState.layoutItems.forEach(item => {
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
  if (!appState) return;
  
  const newItem = {
    id: generateId(),
    label: item.label || 'New Zone',
    color: item.color || '#4285f4',
    x: item.x || 50,
    y: item.y || 50,
    width: item.width || 150,
    height: item.height || 100
  };
  
  updateState(appState, s => s.layoutItems.push(newItem));
  renderLayout();
}

export function deleteLayoutItem(id) {
  if (!appState) return;
  
  updateState(appState, s => {
    s.layoutItems = s.layoutItems.filter(i => i.id !== id);
  });
  renderLayout();
}

export function clearLayout() {
  if (!appState) return;
  
  updateState(appState, s => {
    s.layoutItems = [];
  });
  renderLayout();
}

function makeDraggable(el) {
  let isDragging = false;
  let startX, startY, origX, origY;
  
  el.addEventListener('mousedown', (e) => {
    if (e.target.closest('.layout-item-delete')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origX = el.offsetLeft;
    origY = el.offsetTop;
    el.style.zIndex = 1000;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.left = (origX + dx) + 'px';
    el.style.top = (origY + dy) + 'px';
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      el.style.zIndex = '';
      saveLayoutItemPosition(el);
    }
  });
}

function makeResizable(el) {
  // Simplified - full implementation would add resize handles
}

function saveLayoutItemPosition(el) {
  if (!appState) return;
  const id = el.dataset.id;
  
  updateState(appState, s => {
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

export default { initLayout, renderLayout, addLayoutItem, deleteLayoutItem, clearLayout, setAppState };
