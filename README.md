# Nexus Workspace - Desktop Integration Project

> **🤖 AI Agents:** Read [AI_PROTOCOL.md](./AI_PROTOCOL.md) before starting any work.

## Project Overview
Nexus Workspace is a comprehensive desktop workspace organization system built as a Canvas App for Poe. This handoff prepares the project for Claude Desktop to add deeper filesystem integration, local LLM support (LM Studio/Ollama), and advanced features.

## Current State

### ✅ Implemented Features
- **Dashboard Widgets**
  - Task management with priorities, due dates, tags, drag-and-drop
  - Pomodoro-style focus timer (25/5/15 min modes)
  - Color-coded quick notes with markdown
  - Mini calendar with task due date indicators
  - Project tracking with progress
  - Bookmark management

- **File Manager** (Virtual)
  - Basic folder/file organization
  - File upload UI
  - File type detection and icons

- **Layout Planner**
  - Drag-and-drop canvas for workspace design
  - Resizable zones with labels

- **AI Assistant**
  - Poe bot integration (Claude, GPT, Gemini, Grok)
  - Streaming responses with markdown rendering
  - Model switching

- **Multi-Workspace Support**
  - Separate workspaces for different contexts
  - Color-coded workspace switching

- **Data Persistence**
  - JSON export/import (no localStorage in iframe)
  - Full state serialization

### 🎨 Design System
- Google Material Design inspired
- Google Sans typography
- Auto dark/light mode detection
- Responsive layout
- Custom CSS properties for theming

## Architecture

### State Management
```javascript
AppState = {
  currentView: 'dashboard',
  currentWorkspace: 'default',
  tasks: [],
  notes: [],
  projects: [],
  workspaces: [],
  files: [],
  bookmarks: [],
  layoutItems: [],
  timerState: {},
  calendar: {}
}
```

### File Structure
```
/root/workdir/
├── index.html          # Main application (all-in-one file)
├── README.md          # This file
├── ENHANCEMENT_ROADMAP.md  # Detailed enhancement plan
└── ARCHITECTURE.md    # Technical architecture notes
```

## 🚀 Enhancement Opportunities for Claude Desktop

### 1. Real Filesystem Integration
**Current:** Virtual file system in memory
**Goal:** Actual filesystem access

- Use Node.js `fs` module to read/write actual directories
- Watch filesystem for changes (using `fs.watch` or `chokidar`)
- File preview generation (thumbnails for images, text previews)
- Quick file search across real directories
- File metadata (size, modified date, permissions)
- Drag files from OS into the app
- Open files in system default applications

**Suggested Implementation:**
```javascript
// Example structure
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');

// Watch user's desktop or selected directories
const watcher = chokidar.watch('/Users/username/Desktop', {
  persistent: true,
  ignoreInitial: false
});

watcher.on('add', path => {/* update file list */});
watcher.on('change', path => {/* handle file changes */});
```

### 2. LM Studio / Ollama Integration
**Current:** Uses Poe API only
**Goal:** Local LLM support with automatic fallback

- Detect if LM Studio/Ollama is running (check localhost:1234, localhost:11434)
- Provide model selection UI for local models
- Implement OpenAI-compatible API calls to local endpoints
- Add "local" vs "cloud" toggle in AI assistant
- Streaming support for local LLMs
- Model loading status indicators

**Suggested Implementation:**
```javascript
// Check if LM Studio is running
async function checkLocalLLM() {
  try {
    const response = await fetch('http://localhost:1234/v1/models');
    const models = await response.json();
    return models;
  } catch {
    return null; // Fallback to Poe
  }
}

// Universal chat interface
async function sendMessage(message, useLocal = true) {
  if (useLocal && await checkLocalLLM()) {
    return sendToLocalLLM(message);
  }
  return sendToPoe(message);
}
```

### 3. Google Ecosystem Deep Integration
**Current:** Basic quick links
**Goal:** Live integration

- Google Drive API integration
  - Show recent files
  - Quick file search
  - Open in browser
  - Sync status

- Google Calendar API
  - Show today's events
  - Add events from tasks
  - Sync task due dates with calendar

- Gmail API
  - Unread count badge
  - Quick inbox preview
  - Create tasks from emails

**Authentication:** OAuth2 flow with desktop callback

### 4. System-Level Features

#### Window Management (Electron/Tauri)
- Multiple workspace windows
- Always-on-top mode
- System tray integration
- Global keyboard shortcuts
- Window snapping to layout zones

#### Native Features
- System notifications for timer completion
- Badge count for pending tasks
- Native file dialogs
- Clipboard integration (copy/paste between apps)
- Spotlight/Alfred-style quick search (Cmd+Space)

#### Performance
- SQLite for data persistence (faster than JSON)
- Indexed search
- Virtual scrolling for large lists
- Background sync

### 5. Advanced Workspace Features

#### Smart Layout Engine
- Auto-organize desktop files by type/date/project
- Learn from user habits
- Suggest workspace layouts
- Template system (Developer, Designer, Writer modes)

#### AI-Powered Organization
- Auto-tag files and tasks using local LLM
- Smart project detection from file patterns
- Suggested task priorities based on deadlines
- Natural language workspace search

#### Collaboration
- Export workspace configurations
- Share layout templates
- Team workspace sync (optional cloud backend)

### 6. Plugin System
- JavaScript plugin API
- Custom widgets
- Third-party integrations
- Theme marketplace

## Technical Stack Recommendations

### Desktop Framework Options
1. **Electron** (Most mature, heavy)
   - Full Node.js access
   - Chrome rendering
   - Large bundle size

2. **Tauri** (Recommended - lightweight, secure)
   - Rust backend, web frontend
   - 600KB vs 100MB for Electron
   - Better security model
   - Native system APIs

3. **NW.js** (Alternative)
   - Similar to Electron but different architecture

### Database Options
- **SQLite** - Local structured data
- **LevelDB** - Fast key-value store
- **IndexedDB** - Browser-based (if staying web-native)

### File Watching
- `chokidar` - Cross-platform file watcher
- Native `fs.watch` - Built-in Node.js

### Google APIs
- `googleapis` npm package
- OAuth2 client for authentication

### Local LLM
- Fetch API to localhost endpoints
- Server-Sent Events (SSE) for streaming

## Development Setup for Claude Desktop

### Prerequisites
```bash
# Install Node.js (v18+)
# Install npm or yarn

# For Tauri (recommended)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# For file watching
npm install chokidar

# For Google APIs
npm install googleapis

# For SQLite
npm install better-sqlite3
```

### Project Structure (Suggested)
```
nexus-workspace/
├── src/
│   ├── index.html          # Main UI (current file)
│   ├── main.js            # Electron/Tauri main process
│   ├── preload.js         # Bridge between main and renderer
│   ├── renderer.js        # UI logic (extract from current index.html)
│   └── styles.css         # Extract styles
├── src-tauri/             # Tauri Rust backend (if using Tauri)
│   ├── src/
│   │   └── main.rs
│   └── Cargo.toml
├── package.json
└── README.md
```

### Migration Steps
1. **Extract code from index.html**
   - Separate HTML, CSS, JavaScript
   - Create proper module structure

2. **Set up desktop framework**
   - Initialize Tauri or Electron
   - Configure build process

3. **Implement filesystem access**
   - File reading/writing
   - Directory watching
   - File metadata

4. **Add local LLM support**
   - Endpoint detection
   - API client
   - Streaming support

5. **Google API integration**
   - OAuth setup
   - API clients
   - Data sync

6. **Database migration**
   - Convert JSON to SQLite
   - Migration scripts
   - Query optimization

## Configuration Files Needed

### config.json
```json
{
  "watchDirectories": [
    "~/Desktop",
    "~/Documents",
    "~/Downloads"
  ],
  "localLLM": {
    "enabled": true,
    "endpoint": "http://localhost:1234/v1",
    "fallbackToPoe": true
  },
  "google": {
    "enableDrive": true,
    "enableCalendar": true,
    "enableGmail": true,
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET"
  },
  "appearance": {
    "theme": "auto",
    "accentColor": "#4285f4"
  }
}
```

### package.json (Starter)
```json
{
  "name": "nexus-workspace",
  "version": "1.0.0",
  "description": "Comprehensive desktop workspace organization",
  "main": "src/main.js",
  "scripts": {
    "start": "electron .",
    "tauri": "tauri dev",
    "build": "tauri build"
  },
  "dependencies": {
    "chokidar": "^3.5.3",
    "googleapis": "^118.0.0",
    "better-sqlite3": "^9.0.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.5.0",
    "electron": "^28.0.0"
  }
}
```

## Security Considerations

1. **API Keys**: Never hardcode - use environment variables or secure storage
2. **OAuth Tokens**: Store encrypted in system keychain
3. **File Access**: Sandbox user-selected directories only
4. **Local LLM**: Validate all inputs, rate limit requests
5. **Updates**: Implement secure auto-update mechanism

## Testing Strategy

1. **Unit Tests**: Test core functions (task management, file operations)
2. **Integration Tests**: Test API integrations
3. **E2E Tests**: Test full user workflows
4. **Performance Tests**: File watching with 10K+ files
5. **Cross-Platform**: Test on macOS, Windows, Linux

## License & Distribution

- Choose license (MIT recommended for open source)
- Code signing for macOS/Windows
- Auto-update server setup
- Distribution channels (website, GitHub releases, app stores)

## Next Steps Priority

### Phase 1 - Foundation (Week 1)
1. Set up Tauri project structure
2. Migrate current code to proper file structure
3. Implement basic filesystem reading

### Phase 2 - Core Features (Week 2)
1. File watching and live updates
2. SQLite integration
3. Local LLM detection and integration

### Phase 3 - Google Integration (Week 3)
1. OAuth flow
2. Drive API integration
3. Calendar API integration

### Phase 4 - Polish (Week 4)
1. System tray and notifications
2. Global shortcuts
3. Performance optimization
4. Testing and bug fixes

## Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [LM Studio API Docs](https://lmstudio.ai/docs/api)
- [Ollama API Reference](https://github.com/ollama/ollama/blob/main/docs/api.md)

---

**Ready for Claude Desktop to take over! 🚀**

All current functionality is working in the browser/Poe Canvas environment. The next phase is adding native desktop capabilities, filesystem integration, and local LLM support.
