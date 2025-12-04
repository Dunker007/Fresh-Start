// workspaces.js - Workspace management
import { getState, updateState, generateId, notify } from './state.js';
import { showToast } from './ui.js';

/**
 * Create a new workspace
 */
export function createWorkspace(name, color = '#4285f4') {
    const id = generateId();

    updateState(s => {
        s.workspaces.push({
            id,
            name,
            color,
            createdAt: new Date().toISOString()
        });
    });

    showToast(`Created workspace: ${name}`, 'success');
    return id;
}

/**
 * Switch to a different workspace
 */
export function switchWorkspace(workspaceId) {
    const state = getState();
    const workspace = state.workspaces.find(w => w.id === workspaceId);

    if (!workspace) {
        showToast('Workspace not found', 'error');
        return;
    }

    updateState(s => {
        s.currentWorkspace = workspaceId;
    });

    // Notify all components to re-render with filtered data
    notify('workspaceChanged', { workspaceId });
    showToast(`Switched to: ${workspace.name}`, 'info');
}

/**
 * Delete a workspace (cannot delete default)
 */
export function deleteWorkspace(workspaceId) {
    if (workspaceId === 'default') {
        showToast('Cannot delete default workspace', 'error');
        return;
    }

    const state = getState();
    const workspace = state.workspaces.find(w => w.id === workspaceId);

    if (!workspace) return;

    // Move orphaned items to default workspace
    updateState(s => {
        s.tasks.forEach(t => { if (t.workspaceId === workspaceId) t.workspaceId = 'default'; });
        s.notes.forEach(n => { if (n.workspaceId === workspaceId) n.workspaceId = 'default'; });
        s.projects.forEach(p => { if (p.workspaceId === workspaceId) p.workspaceId = 'default'; });

        s.workspaces = s.workspaces.filter(w => w.id !== workspaceId);

        if (s.currentWorkspace === workspaceId) {
            s.currentWorkspace = 'default';
        }
    });

    notify('workspaceChanged', { workspaceId: 'default' });
    showToast(`Deleted workspace: ${workspace.name}`, 'info');
}

/**
 * Get current workspace
 */
export function getCurrentWorkspace() {
    const state = getState();
    return state.workspaces.find(w => w.id === state.currentWorkspace) || state.workspaces[0];
}

/**
 * Filter items by current workspace
 */
export function filterByWorkspace(items) {
    const state = getState();
    const wsId = state.currentWorkspace;

    // Include items with no workspace (legacy) or matching workspace
    return items.filter(item => !item.workspaceId || item.workspaceId === wsId);
}

/**
 * Initialize workspace UI
 */
export function initWorkspaces() {
    renderWorkspaceSwitcher();

    // Re-render switcher when workspaces change
    document.addEventListener('click', (e) => {
        const wsItem = e.target.closest('.workspace-item');
        if (wsItem) {
            switchWorkspace(wsItem.dataset.id);
            renderWorkspaceSwitcher();
        }
    });
}

function renderWorkspaceSwitcher() {
    const container = document.getElementById('workspaceSwitcher');
    if (!container) return;

    const state = getState();
    const current = getCurrentWorkspace();

    container.innerHTML = `
    <div class="workspace-current" onclick="this.nextElementSibling.classList.toggle('active')">
      <div class="workspace-dot" style="background: ${current?.color || '#4285f4'}"></div>
      <span>${current?.name || 'Default'}</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    <div class="workspace-dropdown">
      ${state.workspaces.map(ws => `
        <div class="workspace-item ${ws.id === state.currentWorkspace ? 'active' : ''}" data-id="${ws.id}">
          <div class="workspace-dot" style="background: ${ws.color}"></div>
          <span>${ws.name}</span>
        </div>
      `).join('')}
      <div class="workspace-divider"></div>
      <div class="workspace-item" onclick="window.openModal('workspaceModal')">
        <i class="fas fa-plus"></i>
        <span>New Workspace</span>
      </div>
    </div>
  `;
}

// Global exports
window.createWorkspace = createWorkspace;
window.switchWorkspace = switchWorkspace;
window.deleteWorkspace = deleteWorkspace;

export default { initWorkspaces, createWorkspace, switchWorkspace, deleteWorkspace, getCurrentWorkspace, filterByWorkspace };
