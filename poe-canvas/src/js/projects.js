// projects.js - Projects CRUD + rendering
import { getState, updateState, generateId, subscribe } from './state.js';
import { escapeHtml } from './ui.js';

export function initProjects() {
  renderProjects();
  subscribe((state, event, data) => {
    if (event === 'stateUpdated' || event === 'stateChanged') {
      renderProjects();
    }
  });
}

export function renderProjects() {
  const container = document.getElementById('projectsList');
  const state = getState();
  if (!container || !state) return;

  const workspaceProjects = state.projects.filter(p =>
    p.workspace === state.currentWorkspace || !p.workspace
  );

  if (workspaceProjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-project-diagram"></i></div>
        <h3 class="empty-state-title">No Projects Yet</h3>
        <p class="empty-state-description">Click the "+" button to create your first project.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = workspaceProjects.map(project => {
    const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = project.tasks?.length || 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return `
      <div class="project-card" data-id="${project.id}" data-project-id="${project.id}"
           style="border-left: 4px solid ${project.color || '#4285f4'}"
           oncontextmenu="window.showProjectAIMenu(event, '${project.id}'); return false;">
        <div class="project-header" style="justify-content: space-between;">
          <div class="project-name">${escapeHtml(project.name)}</div>
          <div class="project-actions" style="display: flex; gap: 4px;">
            <button class="ai-action-btn" onclick="window.showProjectAIMenu(event, '${project.id}')" title="AI Actions">
              <i class="fas fa-magic"></i>
            </button>
            <button class="btn-icon" onclick="window.editProject('${project.id}')" style="width: 28px; height: 28px;">
              <i class="fas fa-edit" style="font-size: 12px;"></i>
            </button>
            <button class="btn-icon" onclick="window.deleteProject('${project.id}')" style="width: 28px; height: 28px;">
              <i class="fas fa-trash" style="font-size: 12px;"></i>
            </button>
          </div>
        </div>
        ${project.description ? `<div class="project-description" style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">${escapeHtml(project.description)}</div>` : ''}
        <div class="project-progress" style="display: flex; align-items: center; gap: 8px;">
          <div class="progress-bar" style="flex: 1; height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden;">
            <div class="progress-fill" style="width: ${progress}%; height: 100%; background: ${project.color || '#4285f4'};"></div>
          </div>
          <span class="progress-text" style="font-size: 11px; color: var(--text-muted);">${completedTasks}/${totalTasks}</span>
        </div>
      </div>
    `;
  }).join('');
}

export function addProject(project) {
  const state = getState();
  if (!state) return;
  const newProject = {
    id: generateId(),
    name: project.name,
    description: project.description || '',
    color: project.color || '#4285f4',
    tasks: [],
    workspace: state.currentWorkspace,
    createdAt: new Date().toISOString()
  };
  updateState(s => s.projects.push(newProject));
}

export function deleteProject(id) {
  updateState(s => {
    s.projects = s.projects.filter(p => p.id !== id);
  });
}

export function editProject(id) {
  const state = getState();
  if (!state) return;
  const project = state.projects.find(p => p.id === id);
  if (project) {
    window.openModal?.('projectModal');
    document.getElementById('projectNameInput').value = project.name;
    document.getElementById('projectDescInput').value = project.description || '';
    // Reset color selection
    document.querySelectorAll('.color-option').forEach(opt => {
      opt.classList.remove('selected');
    });
  }
}

window.deleteProject = deleteProject;
window.editProject = editProject;

export default { initProjects, renderProjects, addProject, deleteProject, editProject };
