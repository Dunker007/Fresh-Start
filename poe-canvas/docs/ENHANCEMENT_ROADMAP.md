# Nexus Workspace - Enhancement Roadmap for Claude Desktop

## Priority Features for Desktop Implementation

### 🔥 P0 - Critical (Must Have)

#### 1. Real Filesystem Integration
**Status**: Not started
**Complexity**: Medium
**Time Estimate**: 1-2 days

**Requirements**:
- [ ] Use Node.js `fs` module to read actual directories
- [ ] Implement file/directory watching with `chokidar`
- [ ] Display real files from user-selected directories (Desktop, Documents, Downloads)
- [ ] Show file metadata (size, modified date, type)
- [ ] Support file operations: rename, delete, move, copy
- [ ] Open files in system default application
- [ ] Drag and drop files from OS into app
- [ ] Generate thumbnails for images

**Implementation Notes**:
```javascript
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;

class FileSystemManager {
  constructor(watchPaths) {
    this.watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    this.watcher
      .on('add', path => this.handleFileAdd(path))
      .on('change', path => this.handleFileChange(path))
      .on('unlink', path => this.handleFileDelete(path));
  }

  async getFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return Promise.all(entries.map(async entry => {
      const fullPath = path.join(directory, entry.name);
      const stats = await fs.stat(fullPath);
      return {
        name: entry.name,
        path: fullPath,
        isDirectory: entry.isDirectory(),
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime
      };
    }));
  }

  async openFile(filePath) {
    const { shell } = require('electron');
    await shell.openPath(filePath);
  }
}
```

**Testing Checklist**:
- [ ] Can read Desktop, Documents, Downloads
- [ ] Live updates when files change externally
- [ ] Handles 1000+ files without lag
- [ ] Thumbnail generation for images
- [ ] Opens files in correct default app

---

#### 2. Local LLM Integration (LM Studio + Ollama)
**Status**: Not started
**Complexity**: Medium
**Time Estimate**: 1-2 days

**Requirements**:
- [ ] Auto-detect LM Studio (localhost:1234)
- [ ] Auto-detect Ollama (localhost:11434)
- [ ] Display available local models in UI
- [ ] Implement OpenAI-compatible API calls
- [ ] Streaming response support
- [ ] Fallback to Poe if local not available
- [ ] Show connection status indicator
- [ ] Model loading/unloading controls

**Implementation Notes**:
```javascript
class LocalLLMClient {
  constructor() {
    this.endpoints = {
      lmstudio: 'http://localhost:1234/v1',
      ollama: 'http://localhost:11434/api'
    };
    this.activeProvider = null;
  }

  async detectProviders() {
    const detected = [];

    // Check LM Studio
    try {
      const res = await fetch(`${this.endpoints.lmstudio}/models`, {
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        detected.push({ name: 'lmstudio', models: data.data });
      }
    } catch {}

    // Check Ollama
    try {
      const res = await fetch(`${this.endpoints.ollama}/tags`, {
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        detected.push({ name: 'ollama', models: data.models });
      }
    } catch {}

    return detected;
  }

  async chat(messages, options = {}) {
    if (!this.activeProvider) {
      throw new Error('No local LLM provider available');
    }

    const endpoint = this.activeProvider === 'lmstudio'
      ? `${this.endpoints.lmstudio}/chat/completions`
      : `${this.endpoints.ollama}/chat`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || 'default',
        messages,
        stream: options.stream || false
      })
    });

    if (options.stream) {
      return this.handleStream(response);
    }

    return response.json();
  }

  async *handleStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          yield data;
        }
      }
    }
  }
}
```

**UI Changes**:
- Add "Local LLM" section in AI assistant settings
- Model dropdown showing available local models
- Connection status indicator (green = connected, red = offline)
- "Refresh models" button
- Toggle: "Use local LLM when available"

**Testing Checklist**:
- [ ] Detects LM Studio when running
- [ ] Detects Ollama when running
- [ ] Falls back to Poe gracefully
- [ ] Streaming works correctly
- [ ] Model switching works
- [ ] Shows helpful error messages

---

#### 3. SQLite Data Persistence
**Status**: Not started
**Complexity**: Low
**Time Estimate**: 1 day

**Requirements**:
- [ ] Replace JSON export/import with SQLite database
- [ ] Create schema for tasks, notes, projects, workspaces
- [ ] Implement CRUD operations
- [ ] Add database migrations system
- [ ] Automatic backups
- [ ] Export to JSON for portability

**Schema**:
```sql
-- Workspaces
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  due TEXT,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')),
  workspace_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_due ON tasks(due);

-- Task Tags (many-to-many)
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE task_tags (
  task_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Notes
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT DEFAULT 'blue',
  workspace_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  workspace_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Bookmarks
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Layout Items
CREATE TABLE layout_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- AI Chat History
CREATE TABLE ai_messages (
  id TEXT PRIMARY KEY,
  role TEXT CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Implementation**:
```javascript
const Database = require('better-sqlite3');
const db = new Database('nexus.db');

class DataStore {
  constructor() {
    this.db = db;
    this.initSchema();
  }

  initSchema() {
    // Run schema creation from above
    this.db.exec(SCHEMA_SQL);
  }

  // Tasks
  getTasks(workspaceId) {
    return this.db.prepare(`
      SELECT t.*, GROUP_CONCAT(tag.name) as tags
      FROM tasks t
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      LEFT JOIN tags tag ON tt.tag_id = tag.id
      WHERE t.workspace_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `).all(workspaceId);
  }

  createTask(task) {
    const insert = this.db.prepare(`
      INSERT INTO tasks (id, title, completed, due, priority, workspace_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    return insert.run(
      task.id,
      task.title,
      task.completed ? 1 : 0,
      task.due,
      task.priority,
      task.workspace_id
    );
  }

  updateTask(id, updates) {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    return this.db.prepare(`
      UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values);
  }

  deleteTask(id) {
    return this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }

  // Export to JSON for portability
  exportToJSON() {
    return {
      workspaces: this.db.prepare('SELECT * FROM workspaces').all(),
      tasks: this.db.prepare('SELECT * FROM tasks').all(),
      notes: this.db.prepare('SELECT * FROM notes').all(),
      projects: this.db.prepare('SELECT * FROM projects').all(),
      bookmarks: this.db.prepare('SELECT * FROM bookmarks').all(),
      layoutItems: this.db.prepare('SELECT * FROM layout_items').all()
    };
  }

  // Import from JSON
  importFromJSON(data) {
    const transaction = this.db.transaction((data) => {
      // Clear existing data
      this.db.exec('DELETE FROM tasks; DELETE FROM notes; DELETE FROM projects;');

      // Insert new data
      data.tasks?.forEach(task => this.createTask(task));
      data.notes?.forEach(note => this.createNote(note));
      // ... etc
    });

    transaction(data);
  }
}
```

---

### ⭐ P1 - High Priority (Should Have)

#### 4. Google Ecosystem Integration
**Status**: Not started
**Complexity**: High
**Time Estimate**: 3-4 days

**Requirements**:

**Google Drive**:
- [ ] OAuth2 authentication flow
- [ ] Show recent files (last 10-20)
- [ ] Quick search across Drive
- [ ] Click to open in browser
- [ ] Show sync status
- [ ] Upload files from app

**Google Calendar**:
- [ ] Show today's events in widget
- [ ] Sync task due dates to calendar
- [ ] Create calendar events from tasks
- [ ] Show upcoming events (next 7 days)

**Gmail**:
- [ ] Unread count badge
- [ ] Quick inbox preview (last 5 emails)
- [ ] Create tasks from emails (drag email to tasks)
- [ ] Click to open in browser

**Implementation**:
```javascript
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

class GoogleIntegration {
  constructor() {
    this.auth = oauth2Client;
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  async authenticate() {
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly'
      ]
    });

    // Open browser for OAuth
    require('electron').shell.openExternal(authUrl);

    // Handle redirect and get tokens
    const { tokens } = await this.getTokensFromRedirect();
    this.auth.setCredentials(tokens);

    // Store tokens securely
    await this.storeTokens(tokens);
  }

  async getRecentDriveFiles() {
    const res = await this.drive.files.list({
      pageSize: 10,
      orderBy: 'modifiedByMeTime desc',
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink)'
    });
    return res.data.files;
  }

  async getTodaysEvents() {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59);

    const res = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    return res.data.items;
  }

  async getUnreadCount() {
    const res = await this.gmail.users.labels.get({
      userId: 'me',
      id: 'INBOX'
    });
    return res.data.messagesUnread;
  }

  async getRecentEmails(maxResults = 5) {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults,
      labelIds: ['INBOX']
    });

    const messages = await Promise.all(
      res.data.messages.map(msg =>
        this.gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        })
      )
    );

    return messages.map(msg => ({
      id: msg.data.id,
      from: msg.data.payload.headers.find(h => h.name === 'From')?.value,
      subject: msg.data.payload.headers.find(h => h.name === 'Subject')?.value,
      date: msg.data.payload.headers.find(h => h.name === 'Date')?.value
    }));
  }
}
```

**UI Additions**:
- New "Google" widget on dashboard showing:
  - Drive: Recent files (3-5)
  - Calendar: Today's events
  - Gmail: Unread count + recent emails
- Settings panel for Google account connection
- "Connect Google Account" button

---

#### 5. Desktop App Framework (Tauri)
**Status**: Not started
**Complexity**: Medium
**Time Estimate**: 2-3 days

**Why Tauri over Electron**:
- 600KB bundle vs 100MB+ for Electron
- Lower memory usage (Rust backend)
- Better security model
- Native OS APIs
- Faster startup

**Setup**:
```bash
npm install -g @tauri-apps/cli
npm install @tauri-apps/api
cargo install tauri-cli
tauri init
```

**Project Structure**:
```
nexus-workspace/
├── src/               # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src-tauri/         # Rust backend
│   ├── src/
│   │   ├── main.rs   # App entry point
│   │   ├── fs.rs     # Filesystem commands
│   │   ├── llm.rs    # LLM integration
│   │   └── google.rs # Google APIs
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

**Tauri Configuration** (`tauri.conf.json`):
```json
{
  "build": {
    "distDir": "../src",
    "devPath": "http://localhost:3000"
  },
  "package": {
    "productName": "Nexus Workspace",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "readDir": true,
        "readFile": true,
        "writeFile": true,
        "scope": ["$HOME/Desktop/*", "$HOME/Documents/*", "$HOME/Downloads/*"]
      },
      "shell": {
        "open": true
      },
      "http": {
        "request": true,
        "scope": ["http://localhost:*"]
      },
      "notification": {
        "all": true
      }
    },
    "windows": [{
      "title": "Nexus Workspace",
      "width": 1200,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600,
      "resizable": true,
      "fullscreen": false
    }],
    "systemTray": {
      "iconPath": "icons/icon.png",
      "menuOnLeftClick": false
    }
  }
}
```

**Main Rust Backend** (`src-tauri/src/main.rs`):
```rust
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;

#[tauri::command]
async fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
  // Implementation
}

#[tauri::command]
async fn check_local_llm() -> Result<LLMStatus, String> {
  // Check localhost:1234 and localhost:11434
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      read_directory,
      check_local_llm
    ])
    .system_tray(/* system tray config */)
    .on_system_tray_event(|app, event| {
      // Handle tray clicks
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

**Frontend API Usage**:
```javascript
import { invoke } from '@tauri-apps/api/tauri';

// Call Rust commands
const files = await invoke('read_directory', { path: '/Users/me/Desktop' });
const llmStatus = await invoke('check_local_llm');
```

---

### 💡 P2 - Nice to Have

#### 6. System-Level Features
- [ ] **System Tray**: Always-on-top, quick access
- [ ] **Global Shortcuts**: Cmd/Ctrl+Shift+N for quick capture
- [ ] **Notifications**: Timer completion, task reminders
- [ ] **Badge Count**: Pending tasks in dock/taskbar
- [ ] **Spotlight/Alfred Integration**: Quick search

#### 7. Advanced AI Features
- [ ] **Context-Aware Suggestions**: "You have 3 tasks due today"
- [ ] **Auto-tagging**: Use LLM to suggest task tags
- [ ] **Smart Prioritization**: AI suggests priorities based on due dates
- [ ] **Meeting Summaries**: Paste meeting notes, AI creates tasks

#### 8. Workspace Templates
- [ ] **Developer Mode**: Code editor layout, terminal zones
- [ ] **Designer Mode**: Design tools, inspiration boards
- [ ] **Writer Mode**: Distraction-free writing zones
- [ ] **Student Mode**: Study timer, assignment tracker

#### 9. Collaboration (Future)
- [ ] Export workspace as shareable JSON
- [ ] Import community templates
- [ ] Optional cloud sync (Firebase/Supabase)

---

## Migration Checklist

### Phase 1: Setup (Day 1)
- [ ] Initialize Tauri project
- [ ] Extract HTML/CSS/JS from single file
- [ ] Set up development environment
- [ ] Configure build process

### Phase 2: Core Features (Days 2-4)
- [ ] Implement SQLite database
- [ ] Add filesystem reading
- [ ] Add file watching
- [ ] Implement local LLM detection

### Phase 3: Integrations (Days 5-7)
- [ ] Google OAuth flow
- [ ] Drive integration
- [ ] Calendar integration
- [ ] Gmail integration

### Phase 4: Native Features (Days 8-9)
- [ ] System tray
- [ ] Global shortcuts
- [ ] Notifications
- [ ] Badge counts

### Phase 5: Polish (Days 10-12)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing
- [ ] Documentation
- [ ] Build and package

---

## Success Metrics

**Performance**:
- [ ] App startup < 2 seconds
- [ ] File list refresh < 500ms for 1000 files
- [ ] AI response starts streaming < 1 second
- [ ] Database queries < 50ms

**Reliability**:
- [ ] No crashes in 1 hour of use
- [ ] Graceful error handling
- [ ] Data never lost (auto-save every 30s)

**Usability**:
- [ ] User can complete common task in < 3 clicks
- [ ] Keyboard shortcuts for all major actions
- [ ] Helpful error messages

---

**Ready for implementation! Let's build something amazing. 🚀**
