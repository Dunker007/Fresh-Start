# Nexus Workspace - Handoff to AI Quartet
> **From**: Claude Desktop (local access session)
> **To**: GPT-5.1, Claude-Opus-4.5, Gemini-3.0-Pro, Grok-4
> **Date**: December 3, 2025
> **Status**: Foundation complete, ready for expansion

---

## TL;DR

Browser-based workspace app with **working local LLM integration** (LM Studio) and **real filesystem access** (Desktop/Documents/Downloads via Node bridge). All sandbox-escaping features implemented. Ready for UI polish, feature expansion, and modularization.

---

## What This Is

A productivity workspace combining:
- Task management with priorities, due dates, tags
- Notes with color coding
- Projects with task grouping
- Focus timer (Pomodoro)
- Calendar view
- Layout planner (drag/drop zones)
- **AI chat connected to local LLM** ✅
- **Real filesystem browser** ✅
- Workspace switching
- Dark/light mode (system-aware)
- JSON export/import

---

## What Was Done This Session

### 1. LM Studio Integration (COMPLETE)
- Auto-detects LM Studio (localhost:1234) and Ollama (localhost:11434)
- Status indicator shows connection state
- Model dropdown populates from running LLM
- Refresh button to reconnect
- Falls back to Poe API when in Poe Canvas, demo mode otherwise

### 2. Real Filesystem Access (COMPLETE)
- Node.js bridge server (`bridge.js`) on port 3456
- Reads Desktop, Documents, Downloads
- Click folders to navigate
- Click files to open with system default app
- Quick nav buttons for common locations
- Up-directory navigation

---

## File Structure

```
C:\Repos GIT\Fresh-Start\poe-canvas\
├── src/
│   ├── index.html          # Main app (3164 lines, self-contained)
│   ├── js/
│   │   ├── state.js        # AppState module (for future extraction)
│   │   └── llm.js          # LLM client module (for future extraction)
│   └── styles/
│       └── main.css        # Partial CSS extraction (incomplete)
├── src-original/
│   └── index.html          # Original from Poe Canvas (backup)
├── src-tauri/              # Tauri scaffold (requires Rust)
│   ├── src/main.rs         # Rust backend commands
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
├── docs/
│   ├── ARCHITECTURE.md     # Original architecture doc
│   ├── ENHANCEMENT_ROADMAP.md
│   └── HANDOFF_NOTES.md    # Original handoff from Poe
├── bridge.js               # Filesystem bridge server ⭐
├── package.json            # Minimal deps (vite only)
├── vite.config.js
├── README.md
├── NEXT_STEPS.md
└── HANDOFF_QUARTET.md      # This file
```

---

## How to Run

### Basic (Browser Only)
```
Open: C:\Repos GIT\Fresh-Start\poe-canvas\src\index.html
```
Works immediately. LLM and filesystem show "not connected" states.

### With Local LLM
1. Start LM Studio, load a model
2. Open index.html
3. Go to AI Assistant - should show "LM Studio" with green dot

### With Filesystem Access
```powershell
cd "C:\Repos GIT\Fresh-Start\poe-canvas"
node bridge.js
```
Then open index.html, click File Manager - shows your Desktop.

### Both Together
1. Start LM Studio
2. Run `node bridge.js`
3. Open index.html
4. Full functionality

---

## Key Code Locations

### LLM Detection (index.html ~line 2690)
```javascript
async function detectLocalLLM() {
  // Tries localhost:1234 (LM Studio) then localhost:11434 (Ollama)
  // Updates AppState.llm and UI status indicator
}
```

### LLM Chat (index.html ~line 2780)
```javascript
async function sendToLocalLLM(message) {
  // Handles both LM Studio (OpenAI-compatible) and Ollama APIs
}
```

### Filesystem Bridge (index.html ~line 2800)
```javascript
const BRIDGE_URL = 'http://localhost:3456';
async function loadDirectory(dirPath) { ... }
async function checkFilesystemBridge() { ... }
```

### AppState (index.html ~line 1780)
```javascript
const AppState = {
  // ... existing state ...
  llm: { provider, model, models, connected },
  fs: { bridgeConnected, currentPath, paths, realFiles }
};
```

---

## What Quartet Should Do Next

### Priority 1: Modularization
The index.html is 3164 lines. Extract into modules:
- `js/tasks.js` - Task CRUD operations
- `js/notes.js` - Notes CRUD operations  
- `js/projects.js` - Project management
- `js/ui.js` - Modal handling, toasts, rendering
- `js/timer.js` - Focus timer logic
- `js/calendar.js` - Calendar rendering
- `js/main.js` - Init, event listeners

### Priority 2: CSS Extraction
- Extract all `<style>` content (~1200 lines) to `styles/main.css`
- Currently only partially done

### Priority 3: Feature Polish
- File manager: Add file size, modified date display
- File manager: Search/filter files
- AI chat: Conversation history persistence
- AI chat: System prompt customization
- Tasks: Recurring tasks
- Calendar: Drag tasks to reschedule

### Priority 4: Persistence Options
- SQLite via better-sqlite3 (native build failed, needs VS fix)
- Or IndexedDB (browser-native, no build issues)
- Or keep JSON export/import (current)

---

## Technical Constraints

### User's Stack (LOCKED - Don't Suggest Alternatives)
- **Primary Builder**: Antigravity IDE + Gemini 3 Pro
- **Hardware**: AMD Ryzen 7, RTX 3060 12GB, 32GB RAM
- **Local AI**: LM Studio (qwen2.5-vl-7b-instruct)
- **Version Control**: Git (source of truth)
- **Domain**: dlxstudios.ai

### What Requires Local Access
These can ONLY be done by Claude Desktop or user locally:
- Running `node bridge.js`
- Git commits/pushes
- File creation outside sandbox
- Tauri builds (when Rust installed)

### What Quartet CAN Do
- All code modifications to index.html
- New JS/CSS module files (user copies them)
- Documentation updates
- Architecture decisions
- UI/UX improvements
- Feature logic

---

## Git Status

**Repository**: `C:\Repos GIT\Fresh-Start`
**Branch**: main
**Remote**: origin (up to date)

**Pending commit** (poe-canvas folder is new):
```
Untracked: poe-canvas/ (entire project)
```

User should run:
```powershell
cd "C:\Repos GIT\Fresh-Start"
git add poe-canvas/
git commit -m "Add Nexus Workspace - LM Studio + filesystem integration"
git push
```

---

## API Reference

### Bridge Server Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Server health + paths |
| `/paths` | GET | System paths object |
| `/list?path=...` | GET | Directory listing |
| `/open?path=...` | GET | Open file with default app |

### LM Studio API (OpenAI-compatible)
```
POST http://localhost:1234/v1/chat/completions
GET  http://localhost:1234/v1/models
```

### Ollama API
```
POST http://localhost:11434/api/chat
GET  http://localhost:11434/api/tags
```

---

## Questions for Quartet

1. **Modularization approach**: ES modules with import/export, or bundle with Vite?
2. **State management**: Keep simple object, or add reactivity (Preact signals, etc)?
3. **Persistence**: IndexedDB vs SQLite vs file-based JSON?
4. **Styling**: Keep Tailwind-like utilities, or switch to component CSS?

---

## Session Notes

- Native SQLite build failed due to corrupted VS props file - not blocking, can use IndexedDB
- Tauri scaffold exists but Rust not installed on user's machine
- Bridge server is intentionally simple - expand as needed
- All Poe Canvas features preserved and working
- User prefers conversational pace, no rushing

---

*Generated by Claude Desktop with filesystem + LM Studio access*
