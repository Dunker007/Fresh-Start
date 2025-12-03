// projects.js - Projects CRUD + rendering
import { updateState, generateId } from './state.js';
import { escapeHtml } from './ui.js';

let appState = null;

export function setAppState(state) {
  appState = state;
}

export function initProjects(state) {
  appState = state;
  renderProjects();
}

export function renderProjects() {
  const container = document.getElementById('projectsList');
  if (!container || !appState) return;

  const workspaceProjects = appState.projects.filter(p =>
    p.workspace === appState.currentWorkspace || !p.workspace
  );

  if (workspaceProjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-project-diagram"></i>
        <p>No projects yet. Add one!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = workspaceProjects.map(project => {
    const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = project.tasks?.length || 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return `
      <div class="project-card" data-id="${project.id}" 
           style="border-left: 4px solid ${project.color || '#4285f4'}"
           oncontextmenu="window.showProjectAIMenu(event, '${project.id}'); return false;">
        <div class="project-header">
          <div class="project-name">${escapeHtml(project.name)}</div>
          <div class="project-actions">
            <button class="ai-action-btn" onclick="window.showProjectAIMenu(event, '${project.id}')" title="AI Actions">
              <i class="fas fa-magic"></i>
            </button>
            <button class="btn-icon" onclick="window.editProject('${project.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" onclick="window.deleteProject('${project.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        ${project.description ? `<div class="project-description">${escapeHtml(project.description)}</div>` : ''}
        <div class="project-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <span class="progress-text">${completedTasks}/${totalTasks} tasks</span>
        </div>
      </div>
    `;
  }).join('');

  // Enable AI context menu if available
  if (window.initProjectAIMenu) {
    window.initProjectAIMenu();
  }
}

export function addProject(project) {
  if (!appState) return;
  const newProject = {
    id: generateId(),
    name: project.name,
    description: project.description || '',
    color: project.color || '#4285f4',
    tasks: [],
    workspace: appState.currentWorkspace,
    createdAt: new Date().toISOString()
  };
  updateState(appState, s => s.projects.push(newProject));
  renderProjects();
}

export function deleteProject(id) {
  if (!appState) return;
  updateState(appState, s => {
    s.projects = s.projects.filter(p => p.id !== id);
  });
  renderProjects();
}

export function editProject(id) {
  if (!appState) return;
  window.openModal?.('projectModal');
}

window.deleteProject = deleteProject;
window.editProject = editProject;

export default { initProjects, renderProjects, addProject, deleteProject, editProject, setAppState };
