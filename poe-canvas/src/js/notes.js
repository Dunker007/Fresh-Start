// notes.js - Notes CRUD + rendering
import { getState, updateState, generateId, subscribe } from './state.js';
import { escapeHtml } from './ui.js';

export function initNotes() {
  renderNotes();
  subscribe((state, event, data) => {
    if (event === 'stateUpdated' || event === 'stateChanged') {
      renderNotes();
    }
  });
}

export function renderNotes() {
  const container = document.getElementById('notesList');
  const state = getState();
  if (!container || !state) return;

  const workspaceNotes = state.notes.filter(n =>
    n.workspace === state.currentWorkspace || !n.workspace
  );

  if (workspaceNotes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-sticky-note"></i></div>
        <h3 class="empty-state-title">No Notes Yet</h3>
        <p class="empty-state-description">Click the "+" button to jot down your first note.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = workspaceNotes.map(note => `
    <div class="note-card" data-id="${note.id}" data-note-id="${note.id}"
         style="border-left-color: ${note.color || 'var(--accent-primary)'}"
         oncontextmenu="window.showNoteAIMenu(event, '${note.id}'); return false;">
      <div class="note-title">${escapeHtml(note.title)}</div>
      <div class="note-preview">${escapeHtml(note.content || '').substring(0, 100)}${(note.content?.length > 100) ? '...' : ''}</div>
      <div class="note-actions" style="margin-top: 8px; display: flex; justify-content: flex-end; gap: 4px;">
        <button class="ai-action-btn" onclick="window.showNoteAIMenu(event, '${note.id}')" title="AI Actions">
          <i class="fas fa-magic"></i>
        </button>
        <button class="btn-icon" onclick="window.editNote('${note.id}')" style="width: 28px; height: 28px;">
          <i class="fas fa-edit" style="font-size: 12px;"></i>
        </button>
        <button class="btn-icon" onclick="window.deleteNote('${note.id}')" style="width: 28px; height: 28px;">
          <i class="fas fa-trash" style="font-size: 12px;"></i>
        </button>
      </div>
    </div>
  `).join('');
}

export function addNote(note) {
  const state = getState();
  if (!state) return;
  const newNote = {
    id: generateId(),
    title: note.title,
    content: note.content || '',
    color: note.color || '#4285f4',
    workspace: state.currentWorkspace,
    createdAt: new Date().toISOString()
  };
  updateState(s => s.notes.push(newNote));
}

export function deleteNote(id) {
  updateState(s => {
    s.notes = s.notes.filter(n => n.id !== id);
  });
}

export function editNote(id) {
  const state = getState();
  if (!state) return;
  const note = state.notes.find(n => n.id === id);
  if (note) {
    state.editingNote = id;
    window.openModal?.('noteModal');
    document.getElementById('noteTitleInput').value = note.title;
    document.getElementById('noteContentInput').value = note.content;
    // Select color
    document.querySelectorAll('.color-option').forEach(opt => {
      // Simple check if color matches (hex or name if mapped)
      // For now assume hex match or close enough
      opt.classList.remove('selected');
    });
  }
}

window.deleteNote = deleteNote;
window.editNote = editNote;

export default { initNotes, renderNotes, addNote, deleteNote, editNote };
