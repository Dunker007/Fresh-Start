# Claude Code Handoff - Deep Optimization Refactor

> **Date**: December 3, 2025
> **From**: Claude Desktop (Opus 4.5)
> **Task**: Code quality refactor before AI feature additions

---

## Mission

Audit and refactor for production quality. **Don't change functionality** - improve structure, patterns, maintainability.

---

## Codebase Location

```
C:\Repos GIT\Fresh-Start\poe-canvas\src\
├── index-modular.html    # Working app (617 lines)
├── js/                   # 12 ES6 modules
│   ├── main.js           # Entry point
│   ├── state.js          # State management
│   ├── llm.js            # LM Studio integration (WORKING - careful)
│   ├── filesystem.js     # Bridge client (WORKING - careful)
│   ├── ai-assistant.js   # Chat UI
│   ├── tasks.js
│   ├── notes.js
│   ├── projects.js
│   ├── timer.js
│   ├── calendar.js
│   ├── layout.js
│   └── ui.js
└── styles/main.css       # All CSS (1188 lines)
```

---

## Refactor Priorities

### 1. State Management
- Multiple modules hold their own `appState` refs via `setAppState()`
- Should be: single import, one source of truth
- Pattern: `import { state } from './state.js'` everywhere

### 2. Global Window Pollution
- `window.toggleTask`, `window.deleteTask`, etc scattered
- Should be: proper event delegation or module exports
- Keep `window.showToast` if needed for inline onclick

### 3. Import/Export Consistency
- Mixed: `export default` + named exports in same files
- Pick one pattern, stick to it

### 4. Error Handling
- Minimal try/catch, silent failures
- Add: consistent error boundaries, user feedback

### 5. Dead Code Audit
- Check for unused functions
- Check for unreachable code paths
- Remove commented-out code

### 6. DRY Violations
- Render functions repeat similar patterns
- Extract: `renderList()`, `renderCard()` utilities

### 7. Event Listener Cleanup
- No cleanup on view switches
- Memory leak potential on long sessions

### 8. JSDoc Annotations
- Zero type hints currently
- Add: function signatures, param types, return types

---

## Don't Touch

- `llm.js` detection logic - **tested, working with LM Studio**
- `filesystem.js` bridge logic - **tested, working with node bridge.js**
- `main.css` - CSS is complete
- Feature behavior - this is structure-only refactor

---

## Workflow

1. **Audit first** - read all modules, identify issues
2. **Propose changes** - list what you'll change before doing it
3. **Execute in stages** - one concern at a time, test between
4. **Commit incrementally** - small, focused commits

---

## Test After Refactor

```powershell
cd "C:\Repos GIT\Fresh-Start\poe-canvas\src"
npx serve .
# Open http://localhost:3000/index-modular.html
```

Verify:
- [ ] App loads, no console errors
- [ ] Tasks CRUD works
- [ ] Notes CRUD works
- [ ] Timer works
- [ ] View switching works
- [ ] Dark/light mode works

---

## Git

```powershell
cd "C:\Repos GIT\Fresh-Start"
git checkout -b refactor/code-quality  # optional branch
git add -A
git commit -m "refactor: [specific change]"
git push
```

---

## Context

This is a "mega crane" job - get the foundation solid so AI features can be added cleanly. Future development happens in Antigravity IDE. This refactor sets the stage.

---

*Ready for execution. Start with the audit.*
