# Handoff Notes for Claude Desktop

## Quick Start for Claude Desktop

**Current Status**: Fully functional Poe Canvas App (browser-based)
**Goal**: Transform into native desktop app with deep system integration

## What Works Right Now

✅ All features in `index.html` are functional in a browser/Poe Canvas
✅ Tasks, notes, projects, workspaces, timer, calendar
✅ AI chat via Poe bots
✅ Virtual file system
✅ Layout planner with drag/drop
✅ Export/import JSON data
✅ Dark/light mode
✅ Responsive design

## What Needs Your Magic (Claude Desktop)

### 🔥 Top Priority: Real Filesystem Access
The current virtual file system is just in-memory arrays. You have access to Node.js and can:

1. **Read actual directories**:
   ```javascript
   const fs = require('fs').promises;
   const files = await fs.readdir('/Users/username/Desktop');
   ```

2. **Watch for changes**:
   ```javascript
   const chokidar = require('chokidar');
   const watcher = chokidar.watch('/path/to/watch');
   watcher.on('change', handleFileChange);
   ```

3. **Get file metadata** (size, dates, type)
4. **Open files** in default apps
5. **Generate thumbnails** for images

### 🤖 Top Priority: Local LLM Integration
User mentioned they run **LM Studio** and **Ollama**. You can:

1. **Detect if running**:
   ```javascript
   // LM Studio runs on http://localhost:1234
   // Ollama runs on http://localhost:11434

   async function checkLMStudio() {
     try {
       const res = await fetch('http://localhost:1234/v1/models');
       return res.ok;
     } catch {
       return false;
     }
   }
   ```

2. **Send chat messages**:
   ```javascript
   const response = await fetch('http://localhost:1234/v1/chat/completions', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       messages: [{ role: 'user', content: 'Hello!' }],
       stream: true
     })
   });
   ```

3. **Show available models** in UI
4. **Fallback to Poe** if local LLM not available

### 📊 Top Priority: SQLite Database
Replace the in-memory state with persistent SQLite:

```javascript
const Database = require('better-sqlite3');
const db = new Database('nexus.db');

// Create tables (see ENHANCEMENT_ROADMAP.md for full schema)
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    ...
  );
`);

// Use prepared statements for speed
const getTasks = db.prepare('SELECT * FROM tasks WHERE workspace_id = ?');
const tasks = getTasks.all(workspaceId);
```

### 🔗 Google Ecosystem (User's Primary System)
User mentioned "Google ecosystem primary", so:

1. **Google Drive**: Show recent files, search
2. **Google Calendar**: Sync task due dates, show events
3. **Gmail**: Unread count, create tasks from emails

Use the `googleapis` npm package. See ENHANCEMENT_ROADMAP.md for implementation details.

## File Structure Suggestion

Instead of one huge `index.html`, split it:

```
nexus-workspace/
├── src/
│   ├── index.html      # HTML structure only
│   ├── styles/
│   │   ├── main.css    # Base styles
│   │   ├── components.css
│   │   └── themes.css
│   ├── js/
│   │   ├── app.js      # Main entry point
│   │   ├── state.js    # State management
│   │   ├── tasks.js    # Task functions
│   │   ├── notes.js    # Note functions
│   │   ├── ai.js       # AI chat
│   │   ├── files.js    # Filesystem
│   │   ├── google.js   # Google APIs
│   │   └── utils.js    # Utilities
│   └── assets/
│       └── icons/
├── main.js             # Electron/Tauri main process
├── package.json
└── README.md
```

## Key Files to Review

1. **README.md** - Project overview, features, goals
2. **ARCHITECTURE.md** - Deep technical details, current implementation
3. **ENHANCEMENT_ROADMAP.md** - Prioritized feature list with code examples
4. **index.html** - Current working app (all-in-one)

## Desktop Framework Recommendation

**Use Tauri** (not Electron):
- 600KB vs 100MB+ bundle size
- Lower memory usage (Rust backend)
- Better security
- Faster startup
- You can keep all the frontend code and just add Rust commands for native features

Quick setup:
```bash
npm install -g @tauri-apps/cli
cargo install tauri-cli
tauri init
```

## User's Specific Requests

1. **"All of the above"** - User wants EVERYTHING:
   - Virtual desktop organizer ✅ (done)
   - Productivity dashboard ✅ (done)
   - Project workspace manager ✅ (done)
   - Desktop layout planner ✅ (done)

2. **"Deeply connected to filesystem"** - This is your main task

3. **"LM Studio and Ollama"** - Add local LLM support

4. **"Google ecosystem primary"** - Deep Google integration

5. **"All features and enhancements you can imagine"** - Go wild! The user wants a comprehensive, feature-rich system.

## What You Can Do That I Couldn't

1. **Read/write actual files** - You have filesystem access
2. **Run shell commands** - You can execute git, npm, system commands
3. **Install packages** - `npm install chokidar better-sqlite3 googleapis`
4. **Create multi-file projects** - Split the monolith
5. **Set up build systems** - Webpack, Vite, Tauri build
6. **Test local LLM connections** - Actually connect to localhost:1234
7. **Implement OAuth flows** - Google API authentication
8. **Create native binaries** - Build .app/.exe files

## Testing the Current Version

The `index.html` file is fully functional. You can:
1. Open it directly in a browser
2. Test all features (tasks, notes, timer, etc.)
3. See the design system
4. Understand the data structure

## Suggested First Steps

1. **Run the current app** to understand it
2. **Initialize Tauri project** structure
3. **Install dependencies**: `npm install chokidar better-sqlite3 googleapis`
4. **Implement filesystem reading** (start with Desktop folder)
5. **Test LM Studio/Ollama detection** (if user has them running)
6. **Create SQLite database** and migrate the demo data

## Important Notes

### Design Philosophy
- Google Material Design inspired (keep this aesthetic!)
- Google Sans font family
- Auto dark/light mode
- Smooth animations
- Responsive layout

### Data Structure
All state is in `AppState` object (see index.html line ~892):
```javascript
AppState = {
  currentView: 'dashboard',
  currentWorkspace: 'default',
  tasks: [],      // Array of task objects
  notes: [],      // Array of note objects
  projects: [],   // Array of project objects
  workspaces: [], // Array of workspace objects
  files: [],      // Currently virtual, make this real!
  bookmarks: [],
  layoutItems: [],
  timerState: { time, running, interval },
  calendar: { month, year }
}
```

### User Preferences
- Clean, modern UI ✓
- Deep system integration (your job!)
- AI-powered features
- Google ecosystem
- Local-first (hence local LLM request)
- Comprehensive feature set

## Questions You Might Have

**Q: Should I use React/Vue/Svelte?**
A: User didn't specify. Current vanilla JS works fine. You could migrate, but not required. Tauri works with any frontend.

**Q: Keep the single-file structure?**
A: No, please split it for maintainability.

**Q: What about the Poe API?**
A: Keep it as fallback for AI, but prioritize local LLMs.

**Q: Testing?**
A: Add unit tests, integration tests. See ARCHITECTURE.md for strategy.

**Q: How to handle Google OAuth in desktop?**
A: Open browser for auth, catch redirect. See ENHANCEMENT_ROADMAP.md for code example.

## Success Criteria

You'll know you're done when:
- ✅ App reads real Desktop/Documents/Downloads folders
- ✅ Files update live when changed externally
- ✅ Can connect to LM Studio or Ollama if running
- ✅ SQLite stores all data persistently
- ✅ Google Drive/Calendar/Gmail show real data (if user connects)
- ✅ Builds to native .app or .exe
- ✅ All original features still work

## Final Thoughts

This is a **really good foundation**. The UI is polished, the features are well-thought-out, and the code is clean. Your job is to:

1. **Add the native hooks** (filesystem, local LLM)
2. **Make it persistent** (SQLite)
3. **Connect to user's ecosystem** (Google APIs)
4. **Package it** (Tauri build)

The user said "go as deeply connected as you can" and "all features and enhancements you can imagine" - they want a **production-grade, feature-complete desktop workspace system**. Don't hold back!

**You've got this! 🚀**

---

## Quick Reference

**Current file**: `index.html` (all-in-one)
**Tech stack**: Vanilla JS, Tailwind CSS, Marked.js, Sortable.js
**State**: Global `AppState` object
**Data**: JSON export/import (temporary, replace with SQLite)
**AI**: Poe API (add local LLM support)
**Files**: Virtual (make real)
**Google**: Quick links only (add full integration)

**Key NPM packages to install**:
```bash
npm install chokidar better-sqlite3 googleapis @tauri-apps/api
```

**Local LLM endpoints**:
- LM Studio: http://localhost:1234/v1
- Ollama: http://localhost:11434/api

**User's OS**: Unknown (build for all platforms or ask)
