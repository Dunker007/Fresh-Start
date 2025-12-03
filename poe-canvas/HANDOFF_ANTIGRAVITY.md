# Nexus Workspace - Handoff to Antigravity/Sonnet 4.5

> **From**: Claude Desktop (Opus 4.5)
> **To**: Sonnet 4.5 Thinking via Antigravity IDE
> **Repo**: `C:\Repos GIT\Fresh-Start\poe-canvas\`
> **Status**: Modules created, need wiring

---

## TL;DR

ES6 modules are written. CSS is extracted. Local integrations (LM Studio, filesystem) work. 
**Your job**: Wire the modular JS to HTML and test.

---

## What's Done (Don't Rewrite)

### Working Features
- ✅ LM Studio chat (localhost:1234) - `js/llm.js`
- ✅ Filesystem browser via bridge - `js/filesystem.js`
- ✅ Full CSS extracted - `styles/main.css` (1188 lines)
- ✅ All 11 JS modules scaffolded

### Module Summary
```
js/
├── main.js        (202 lines) - Entry, events, view switching
├── state.js       (77 lines)  - AppState + localStorage
├── llm.js         (146 lines) - LM Studio/Ollama ← TESTED, WORKS
├── filesystem.js  (135 lines) - Bridge client ← TESTED, WORKS
├── tasks.js       (112 lines) - Task CRUD
├── notes.js       (85 lines)  - Notes CRUD
├── projects.js    (96 lines)  - Projects CRUD
├── timer.js       (97 lines)  - Pomodoro
├── calendar.js    (94 lines)  - Calendar view
├── layout.js      (133 lines) - Drag/drop zones
└── ui.js          (82 lines)  - Modals, toasts
```

---

## What You Need To Do

### Step 1: Complete index-modular.html

File: `src/index-modular.html` (starter shell created)

**Action**: 
1. Open `src/index.html` (the working monolithic version)
2. Copy lines 1200-1773 (the `<body>` content, HTML only)
3. Paste into `index-modular.html` replacing the placeholder
4. Remove any remaining `<script>` tags from the pasted content

### Step 2: Fix Selector Mismatches

The modules expect certain element IDs. Verify these exist in HTML:

**Tasks** (`tasks.js`):
- `#tasksList` - container for task items
- `#addTaskBtn` - opens task modal

**Notes** (`notes.js`):
- `#notesList` - container for notes
- `#addNoteBtn` - opens note modal

**Projects** (`projects.js`):
- `#projectsList` - container
- `#addProjectBtn` - opens modal

**Timer** (`timer.js`):
- `#timerDisplay` - shows MM:SS
- `#timerStartBtn` - play/pause
- `#timerResetBtn` - reset

**Calendar** (`calendar.js`):
- `#calendarGrid` - day grid
- `#calendarMonth` - month label
- `#calendarPrev` / `#calendarNext` - nav buttons

**LLM** (`llm.js`):
- `#llmStatusDot` - connection indicator
- `#llmStatusText` - "LM Studio" / "No LLM"
- `#aiModelSelect` - model dropdown
- `#aiInput` - chat input
- `#aiSendBtn` - send button
- `#aiChatMessages` - message container
- `#refreshModelsBtn` - refresh button
- `#clearChatBtn` - clear chat

**Filesystem** (`filesystem.js`):
- `#fileGrid` - file listing
- `#currentPath` - path breadcrumb
- `#bridgeStatus` / `#bridgeStatusText` - connection status
- `#goDesktop` / `#goDocuments` / `#goDownloads` - quick nav
- `#goUp` - parent directory
- `#refreshFiles` - refresh listing

**Layout** (`layout.js`):
- `#layoutCanvas` - drag/drop canvas
- `#addLayoutItem` - add zone button
- `#clearCanvas` - clear button

**Views** (`main.js`):
- `#dashboardView` / `#filesView` / `#canvasView` / `#aiView`
- `.nav-item[data-view]` - navigation items

### Step 3: Test in Browser

```
# Serve with local server (required for ES modules)
cd "C:\Repos GIT\Fresh-Start\poe-canvas\src"
npx serve .

# Or use VS Code Live Server, or Python:
python -m http.server 8000
```

Open `http://localhost:5000/index-modular.html` (or whatever port)

### Step 4: Debug Console Errors

Common issues:
- `Cannot find module` → Check import paths
- `null is not an object` → Element ID mismatch
- CORS errors → Need local server, not file://

---

## File Paths

```
C:\Repos GIT\Fresh-Start\poe-canvas\
├── src\
│   ├── index.html           ← WORKING reference (don't break)
│   ├── index-modular.html   ← YOUR WORK TARGET
│   ├── js\                  ← All modules here
│   └── styles\main.css      ← Full CSS
├── bridge.js                ← Run with: node bridge.js
└── src-original\            ← Backup from Poe Canvas
```

---

## Testing Checklist

After wiring, verify:

- [ ] App loads without console errors
- [ ] Dark/light mode works
- [ ] Navigation switches views
- [ ] Tasks: add, complete, delete
- [ ] Notes: add, delete
- [ ] Timer: start, pause, reset
- [ ] Calendar: month navigation
- [ ] AI: Shows "No LLM" or connects to LM Studio
- [ ] Files: Shows bridge status (run `node bridge.js` first)

---

## Don't Touch

- `llm.js` - The LM Studio integration is tested and working
- `filesystem.js` - The bridge client is tested and working  
- `bridge.js` - The Node server is complete
- `main.css` - CSS is fully extracted, no changes needed
- `src/index.html` - Keep as working reference

---

## Git

After completion:
```powershell
cd "C:\Repos GIT\Fresh-Start"
git add poe-canvas/src/index-modular.html
git commit -m "Wire modular architecture to HTML"
git push
```

---

## Quick Reference

**Run filesystem bridge:**
```powershell
cd "C:\Repos GIT\Fresh-Start\poe-canvas"
node bridge.js
```

**Start LM Studio:**
- Open LM Studio app
- Load any model
- Server runs on localhost:1234

**Serve for testing:**
```powershell
cd "C:\Repos GIT\Fresh-Start\poe-canvas\src"
npx serve .
```

---

## Questions?

The monolithic `index.html` has all the answers. It's the working reference.
Line numbers for key sections:
- CSS: 12-1198
- HTML body: 1200-1773  
- JavaScript: 1775-3173

---

*Created by Claude Desktop (Opus 4.5) - December 3, 2025*
