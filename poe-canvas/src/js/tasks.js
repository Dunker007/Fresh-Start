// tasks.js - Task CRUD + rendering
import { updateState, generateId, getTodayStr } from './state.js';
import { escapeHtml } from './ui.js';

let appState = null;

export function setAppState(state) {
  appState = state;
}

export function initTasks(state) {
  appState = state;
  renderTasks();
}

export function renderTasks() {
  const container = document.getElementById('tasksList');
  if (!container || !appState) return;
  
  const workspaceTasks = appState.tasks.filter(t => 
    t.workspace === appState.currentWorkspace || !t.workspace
  );
  
  if (workspaceTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-tasks"></i>
        <p>No tasks yet. Add one!</p>
      </div>
    `;
    return;
  }
  
  const sorted = [...workspaceTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
  });
  
  container.innerHTML = sorted.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
        onchange="window.toggleTask('${task.id}')">
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.due ? `<div class="task-due ${isOverdue(task.due) ? 'overdue' : ''}">${task.due}</div>` : ''}
      </div>
      <div class="task-priority priority-${task.priority || 'medium'}"></div>
      <button class="btn-icon" onclick="window.editTask('${task.id}')">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn-icon" onclick="window.deleteTask('${task.id}')">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

function isOverdue(dateStr) {
  return new Date(dateStr) < new Date(getTodayStr());
}

export function addTask(task) {
  if (!appState) return;
  const newTask = {
    id: generateId(),
    title: task.title,
    completed: false,
    due: task.due || null,
    priority: task.priority || 'medium',
    tags: task.tags || [],
    workspace: appState.currentWorkspace,
    createdAt: new Date().toISOString()
  };
  updateState(appState, s => s.tasks.push(newTask));
  renderTasks();
}

export function toggleTask(id) {
  if (!appState) return;
  updateState(appState, s => {
    const task = s.tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
  });
  renderTasks();
}

export function deleteTask(id) {
  if (!appState) return;
  updateState(appState, s => {
    s.tasks = s.tasks.filter(t => t.id !== id);
  });
  renderTasks();
}

export function editTask(id) {
  if (!appState) return;
  const task = appState.tasks.find(t => t.id === id);
  if (task) {
    appState.editingTask = id;
    // Populate modal fields - implement based on your modal structure
    window.openModal?.('taskModal');
  }
}

// Make functions globally available
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.editTask = editTask;

export default { initTasks, renderTasks, addTask, toggleTask, deleteTask, editTask, setAppState };
