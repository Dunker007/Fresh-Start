// notes.js - Notes CRUD + rendering
import { updateState, generateId } from './state.js';
import { escapeHtml } from './ui.js';

let appState = null;

export function setAppState(state) {
  appState = state;
}

export function initNotes(state) {
  appState = state;
  renderNotes();
}

export function renderNotes() {
  const container = document.getElementById('notesList');
  if (!container || !appState) return;

  const workspaceNotes = appState.notes.filter(n =>
    n.workspace === appState.currentWorkspace || !n.workspace
  );

  if (workspaceNotes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-sticky-note"></i>
        <p>No notes yet. Add one!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = workspaceNotes.map(note => `
    <div class="note-card" data-id="${note.id}" 
         style="background: ${note.color || 'var(--bg-tertiary)'}"
         oncontextmenu="window.showNoteAIMenu(event, '${note.id}'); return false;">
      <div class="note-title">${escapeHtml(note.title)}</div>
      <div class="note-content">${escapeHtml(note.content || '').substring(0, 100)}${(note.content?.length > 100) ? '...' : ''}</div>
      <div class="note-actions">
        <button class="ai-action-btn" onclick="window.showNoteAIMenu(event, '${note.id}')" title="AI Actions">
          <i class="fas fa-magic"></i>
        </button>
        <button class="btn-icon" onclick="window.editNote('${note.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon" onclick="window.deleteNote('${note.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Enable AI context menu if available
  if (window.initNoteAIMenu) {
    window.initNoteAIMenu();
  }
}

export function addNote(note) {
  if (!appState) return;
  const newNote = {
    id: generateId(),
    title: note.title,
    content: note.content || '',
    color: note.color || '#4285f4',
    workspace: appState.currentWorkspace,
    createdAt: new Date().toISOString()
  };
  updateState(appState, s => s.notes.push(newNote));
  renderNotes();
}

export function deleteNote(id) {
  if (!appState) return;
  updateState(appState, s => {
    s.notes = s.notes.filter(n => n.id !== id);
  });
  renderNotes();
}

export function editNote(id) {
  if (!appState) return;
  const note = appState.notes.find(n => n.id === id);
  if (note) {
    appState.editingNote = id;
    window.openModal?.('noteModal');
  }
}

window.deleteNote = deleteNote;
window.editNote = editNote;

export default { initNotes, renderNotes, addNote, deleteNote, editNote, setAppState };
