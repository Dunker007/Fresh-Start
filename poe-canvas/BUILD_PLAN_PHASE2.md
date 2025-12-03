# Claude Code Build Plan - Phase 2

> **From**: Claude Desktop (Opus 4.5)
> **Date**: December 3, 2025
> **Status**: Post-refactor, ready for UX sprint

---

## Current State

✅ **Done:**
- Centralized state management (singleton `getState()`)
- AI assistant module (610 lines, all AI functions)
- AI buttons in task/note/project UI
- Window exports for context menus
- All CRUD working
- LLM integration working

❌ **Missing:**
- Keyboard shortcuts (zero)
- Debounce/throttle utilities (zero)
- Command palette (zero)
- Loading states for AI actions (minimal)
- Search functionality (broken/incomplete)

---

## Build Tasks

### Task 1: Keyboard Shortcuts Module
**File**: `src/js/shortcuts.js` (new)
**Priority**: HIGH
**Time**: 2-3 hours

```javascript
// Shortcuts to implement:
Ctrl+N        → New task modal
Ctrl+Shift+N  → New note modal
Ctrl+K        → Command palette (Task 2)
Ctrl+F        → Focus global search
Ctrl+1        → Dashboard view
Ctrl+2        → Files view
Ctrl+3        → Layout view
Ctrl+4        → AI view
Escape        → Close any open modal
Ctrl+D        → Toggle dark/light mode
Ctrl+T        → Start/pause timer
```

**Implementation:**
1. Create `shortcuts.js` module
2. Single `keydown` listener on document
3. Check for modifier keys + key combos
4. Map to actions via lookup object
5. Import and init in `main.js`

---

### Task 2: Command Palette
**File**: `src/js/commands.js` (new)
**Priority**: HIGH
**Time**: 4-5 hours

**Features:**
- Ctrl+K opens fuzzy search modal
- Search across: commands, tasks, notes, projects
- Arrow keys to navigate, Enter to execute
- Recent commands at top

**Structure:**
```javascript
const commands = [
  { id: 'new-task', label: 'New Task', keywords: ['add', 'create', 'task'], action: () => openModal('taskModal') },
  { id: 'new-note', label: 'New Note', keywords: ['add', 'create', 'note'], action: () => openModal('noteModal') },
  { id: 'ai-breakdown', label: 'AI: Break Down Task', keywords: ['ai', 'split', 'subtask'], action: showTaskPicker },
  { id: 'toggle-theme', label: 'Toggle Theme', keywords: ['dark', 'light', 'mode'], action: toggleTheme },
  { id: 'view-dashboard', label: 'Go to Dashboard', keywords: ['home', 'main'], action: () => switchView('dashboard') },
  // ... more commands
];
```

**UI needed in HTML:**
```html
<div class="command-palette-overlay" id="commandPalette">
  <div class="command-palette">
    <input type="text" id="commandInput" placeholder="Type a command...">
    <div class="command-results" id="commandResults"></div>
  </div>
</div>
```

**CSS needed:**
- Centered modal overlay
- Search input styling
- Result list with hover/selected states
- Keyboard navigation highlight

---

### Task 3: Debounce Utility
**File**: `src/js/ui.js` (add to existing)
**Priority**: MEDIUM
**Time**: 30 minutes

```javascript
export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 100) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

**Apply to:**
- Global search input
- Command palette filtering
- Window resize handlers
- Scroll handlers (if any)

---

### Task 4: Global Search Fix
**File**: `src/js/main.js` (fix existing)
**Priority**: MEDIUM
**Time**: 1-2 hours

**Current issue:** Search input exists but handler may be broken/incomplete

**Should search across:**
- Task titles
- Note titles and content
- Project names
- Bookmarks

**Implementation:**
1. Find `#globalSearch` handler
2. Debounce the input (use Task 3)
3. Filter all item types
4. Show results dropdown
5. Click result → navigate to item

---

### Task 5: AI Loading States
**File**: `src/js/ai-assistant.js` (enhance)
**Priority**: LOW
**Time**: 1 hour

**Current:** Shows toast "AI is breaking down..."
**Enhance:** 
- Disable the triggering button
- Show spinner on button
- Re-enable on complete/error

```javascript
function setAILoading(buttonEl, loading) {
  if (loading) {
    buttonEl.disabled = true;
    buttonEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  } else {
    buttonEl.disabled = false;
    buttonEl.innerHTML = '<i class="fas fa-magic"></i>';
  }
}
```

---

### Task 6: Empty State Improvements
**File**: Various render functions
**Priority**: LOW
**Time**: 1 hour

**Enhance empty states with:**
- Helpful icons
- Actionable text ("Click + to add your first task")
- Maybe a subtle animation

---

## File Map

```
src/js/
├── main.js          # Add shortcuts init, command palette init
├── shortcuts.js     # NEW - keyboard shortcuts
├── commands.js      # NEW - command palette
├── ui.js            # Add debounce, throttle
├── ai-assistant.js  # Add loading states
├── tasks.js         # (no changes needed)
├── notes.js         # (no changes needed)
├── projects.js      # (no changes needed)
└── ...
```

---

## Order of Operations

1. **shortcuts.js** - Quick win, immediate UX improvement
2. **debounce in ui.js** - Foundation for search/commands
3. **Fix global search** - Uses debounce
4. **commands.js** - Bigger feature, uses shortcuts
5. **AI loading states** - Polish
6. **Empty states** - Polish

---

## Testing Checklist

After each task:
- [ ] No console errors
- [ ] Feature works as expected
- [ ] Doesn't break existing features
- [ ] Commit with clear message

**Server**: `npx serve . -p 3000` from `src/` folder
**Test URL**: http://localhost:3000/index-modular.html

---

## Git Workflow

```bash
# Work on feature branch
git checkout -b feature/keyboard-shortcuts

# Commit often
git add -A
git commit -m "feat: add keyboard shortcuts module"

# Push for review
git push -u origin feature/keyboard-shortcuts
```

---

## Don't Touch

- `llm.js` - Working LLM integration
- `filesystem.js` - Working bridge client
- `state.js` - Just refactored, solid
- `main.css` - CSS is complete

---

*Ready for execution. Start with Task 1 (shortcuts.js).*
