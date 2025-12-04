// tasks.js - Task CRUD + rendering
import { getState, updateState, generateId, getTodayStr, subscribe } from './state.js';
import { escapeHtml } from './ui.js';

export function initTasks() {
  renderTasks();
  // Subscribe to state changes to auto-render
  subscribe((state, event, data) => {
    if (event === 'stateUpdated' || event === 'stateChanged') {
      renderTasks();
    }
  });
}

export function renderTasks() {
  const container = document.getElementById('taskList'); // Fixed ID from tasksList to taskList based on index.html
  const state = getState();
  if (!container || !state) return;

  const workspaceTasks = state.tasks.filter(t =>
    t.workspace === state.currentWorkspace || !t.workspace
  );

  if (workspaceTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-tasks"></i></div>
        <h3 class="empty-state-title">No Tasks Yet</h3>
        <p class="empty-state-description">Click the "+" button to add your first task and get organized.</p>
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
         data-task-id="${task.id}"
         oncontextmenu="window.showTaskAIMenu(event, '${task.id}'); return false;">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
        onchange="window.toggleTask('${task.id}')">
      <div class="task-content">
        <div class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          ${task.due ? `<span class="tag ${isOverdue(task.due) ? 'tag-red' : 'tag-blue'}">${task.due}</span>` : ''}
          ${task.tags ? task.tags.map(tag => `<span class="tag tag-purple">${tag}</span>`).join('') : ''}
        </div>
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
}

export function toggleTask(id) {
  updateState(s => {
    const task = s.tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
  });
}

export function deleteTask(id) {
  updateState(s => {
    s.tasks = s.tasks.filter(t => t.id !== id);
  });
}

export function editTask(id) {
  const state = getState();
  if (!state) return;
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    state.editingTask = id;
    window.openModal?.('taskModal');
    // Populate modal
    document.getElementById('taskTitleInput').value = task.title;
    document.getElementById('taskDueInput').value = task.due || '';
    document.getElementById('taskTagsInput').value = task.tags ? task.tags.join(', ') : '';
    // Reset priority selection
    document.querySelectorAll('.priority-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.priority === task.priority);
    });
  }
}

// Make functions globally available
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.editTask = editTask;

export default { initTasks, renderTasks, addTask, toggleTask, deleteTask, editTask };
