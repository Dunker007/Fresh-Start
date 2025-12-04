// tasks.js - Task CRUD + rendering
import { getState, updateState, generateId, getTodayStr } from './state.js';
import { escapeHtml } from './ui.js';

export function initTasks() {
  renderTasks();
}

export function renderTasks() {
  const container = document.getElementById('tasksList');
  const state = getState();
  if (!container || !state) return;

  const workspaceTasks = state.tasks.filter(t =>
    t.workspace === state.currentWorkspace || !t.workspace
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
    <div class="task-item ${task.completed ? 'completed' : ''}"
         data-id="${task.id}"
         oncontextmenu="window.showTaskAIMenu(event, '${task.id}'); return false;">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
        onchange="window.toggleTask('${task.id}')">
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.due ? `<div class="task-due ${isOverdue(task.due) ? 'overdue' : ''}">${task.due}</div>` : ''}
      </div>
      <div class="task-priority priority-${task.priority || 'medium'}"></div>
      <button class="ai-action-btn" onclick="window.showTaskAIMenu(event, '${task.id}')" title="AI Actions">
        <i class="fas fa-magic"></i>
      </button>
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
  const state = getState();
  if (!state) return;
  const newTask = {
    id: generateId(),
    title: task.title,
    completed: false,
    due: task.due || null,
    priority: task.priority || 'medium',
    tags: task.tags || [],
    workspace: state.currentWorkspace,
    createdAt: new Date().toISOString()
  };
  updateState(s => s.tasks.push(newTask));
  renderTasks();
}

export function toggleTask(id) {
  updateState(s => {
    const task = s.tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
  });
  renderTasks();
}

export function deleteTask(id) {
  updateState(s => {
    s.tasks = s.tasks.filter(t => t.id !== id);
  });
  renderTasks();
}

export function editTask(id) {
  const state = getState();
  if (!state) return;
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    state.editingTask = id;
    window.openModal?.('taskModal');
  }
}

// Make functions globally available
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.editTask = editTask;

export default { initTasks, renderTasks, addTask, toggleTask, deleteTask, editTask };
