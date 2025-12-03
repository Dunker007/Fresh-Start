# Nexus Workspace - Technical Architecture

## Current Implementation (Poe Canvas App)

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS via CDN + Custom CSS
- **Fonts**: Google Fonts (Google Sans)
- **Icons**: Font Awesome 6
- **Markdown**: Marked.js
- **Drag & Drop**: Sortable.js
- **API**: Poe Embed API (window.Poe)

### Constraints (Poe Canvas Environment)
- No localStorage/sessionStorage
- No direct filesystem access
- No local server connections (CORS)
- Sandboxed iframe environment
- alert(), confirm(), prompt() not allowed
- Relative links not supported

### Workarounds Implemented
1. **State Persistence**: JSON export/import instead of localStorage
2. **File Management**: Virtual filesystem in memory
3. **AI Integration**: Poe bot API instead of local LLMs
4. **User Prompts**: Custom modal dialogs instead of native dialogs

## Code Organization (Current - Single File)

### HTML Structure
```
<body>
  <div class="app-container">
    <aside class="sidebar">
      - Logo
      - Navigation (Dashboard, Files, Canvas, AI)
      - Workspace list
      - Quick access links (Google ecosystem)
      - Export button
    </aside>

    <main class="main-content">
      <header class="header">
        - Sidebar toggle
        - Global search
        - Settings dropdown
      </header>

      <!-- Views (hidden/shown based on state) -->
      <div id="dashboardView">
        - Tasks widget
        - Timer widget
        - Notes widget
        - Calendar widget
        - Projects widget
        - Bookmarks widget
      </div>

      <div id="filesView">
        - File grid
        - Upload controls
      </div>

      <div id="canvasView">
        - Layout planner canvas
      </div>

      <div id="aiView">
        - Chat messages
        - Input area
      </div>
    </main>
  </div>

  <!-- Modals for various actions -->
  <div id="taskModal">...</div>
  <div id="noteModal">...</div>
  <div id="projectModal">...</div>
  <!-- etc... -->

  <!-- Toast notification container -->
  <div id="toastContainer"></div>
</body>
```

### JavaScript Architecture

#### 1. State Management (Global Object)
```javascript
const AppState = {
  // View state
  currentView: 'dashboard',
  currentWorkspace: 'default',

  // Data
  tasks: [],
  notes: [],
  projects: [],
  workspaces: [],
  files: [],
  bookmarks: [],
  layoutItems: [],

  // UI state
  timerState: { time, running, interval },
  calendar: { month, year },

  // Edit state
  editingTask: null,
  editingNote: null,

  aiMessages: []
}
```

#### 2. Core Functions

**Initialization**
- `init()` - Entry point
- `setupTheme()` - Dark/light mode detection
- `loadDemoData()` - Populate with example data
- `setupEventListeners()` - Bind all UI events
- `renderAll()` - Initial render of all components

**View Management**
- `switchView(view)` - Change main content area
- `toggleSidebar()` - Mobile sidebar toggle

**Modal Management**
- `openModal(id)` / `closeModal(id)` - Generic modal control
- `openTaskModal(task)` - Task-specific modal with edit support
- `openNoteModal(note)` - Note-specific modal with edit support
- `showConfirm(title, msg, callback)` - Confirmation dialog

**Rendering Functions**
- `renderTasks()` - Render task list with checkboxes, drag-drop
- `renderNotes()` - Render note cards
- `renderProjects()` - Render project cards with progress
- `renderWorkspaces()` - Render workspace navigation
- `renderFiles()` - Render file grid
- `renderBookmarks()` - Render bookmark links
- `renderCalendar()` - Generate calendar grid with events
- `renderLayoutCanvas()` - Create draggable layout zones

**Data Operations**
- `saveTask()` - Add/update task
- `toggleTask(id)` - Mark complete/incomplete
- `deleteTask(id)` - Remove task with confirmation
- `saveNote()` - Add/update note
- `saveProject()` - Create project
- `saveWorkspace()` - Create workspace
- `switchWorkspace(id)` - Change active workspace
- `saveBookmark()` - Add bookmark
- `createFolder()` - Create virtual folder
- `handleFileUpload(e)` - Process file uploads

**Timer Functions**
- `toggleTimer()` - Start/pause timer
- `resetTimer()` - Reset to selected time
- `setTimerType(btn)` - Switch between Focus/Break modes
- `updateTimerDisplay()` - Update time display

**Calendar Functions**
- `navigateCalendar(direction)` - Next/prev month

**Layout Canvas Functions**
- `addLayoutItem()` - Create new zone
- `clearLayoutCanvas()` - Remove all zones
- `makeDraggable(el)` - Enable dragging
- `makeResizable(el)` - Enable resizing
- `updateLayoutItemPosition(el)` - Save position to state

**AI Chat Functions**
- `sendAIMessage()` - Send user message to Poe bot
- `addChatMessage(content, role)` - Append message to UI
- `clearAIChat()` - Reset chat

**Export/Import**
- `exportData()` - Download JSON file
- `importData(e)` - Load JSON file

**Search**
- `handleGlobalSearch(e)` - Filter all content by query

**Utilities**
- `escapeHtml(str)` - XSS protection
- `formatDate(dateStr)` - Human-readable dates
- `getPriorityColor(priority)` - Map priority to color
- `getFileIcon(type)` - Map file type to icon
- `getFileType(filename)` - Detect file type from extension
- `showToast(msg, type)` - Show notification

## CSS Architecture

### CSS Custom Properties (Design Tokens)
```css
:root {
  /* Colors - Light Mode */
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --text-primary: #1e293b;
  --accent-primary: #4285f4;
  /* ... etc ... */
}

.dark {
  /* Colors - Dark Mode */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  /* ... etc ... */
}
```

### Component Classes
- `.glass-panel` - Widget containers
- `.glass-card` - Interactive cards
- `.btn-primary` / `.btn-secondary` / `.btn-icon` - Buttons
- `.input-field` - Form inputs
- `.tag` - Labels/badges with color variants
- `.modal-overlay` / `.modal` - Modal dialogs
- `.toast` - Notifications
- `.nav-item` - Navigation items
- `.task-item` / `.note-card` / `.project-card` - Data cards

### Layout System
- Flexbox for header, sidebar, main structure
- CSS Grid for dashboard widget layout (auto-fit, minmax)
- Absolute positioning for layout canvas items

## Data Flow

### Task Creation Flow
```
User clicks "Add Task" button
  ↓
openModal('taskModal') - Show modal
  ↓
User fills form and clicks "Save"
  ↓
saveTask() - Validates input
  ↓
AppState.tasks.push(newTask) - Update state
  ↓
closeModal('taskModal') - Hide modal
  ↓
renderTasks() - Re-render task list
  ↓
showToast('Task added', 'success') - Feedback
```

### AI Chat Flow
```
User types message and clicks send
  ↓
sendAIMessage() - Capture input
  ↓
addChatMessage(msg, 'user') - Show user message
  ↓
Create loading spinner
  ↓
window.Poe.registerHandler(handlerName, callback)
  ↓
window.Poe.sendUserMessage(@model prompt, {handler, stream})
  ↓
Callback receives streaming responses
  ↓
Update message element with content (marked.parse for markdown)
  ↓
On completion, remove loading spinner
```

### Export/Import Flow
```
Export:
  exportData() → Create JSON blob → Trigger download

Import:
  importInput.click() → FileReader reads file →
  JSON.parse() → Merge into AppState → renderAll()
```

## Extension Points for Desktop Version

### 1. State Management Upgrade
**Current**: Global object
**Proposed**:
- Redux/Zustand for predictable state
- React/Vue components for reactive updates
- SQLite for persistence

### 2. File System Integration
**Replace**:
```javascript
AppState.files = []; // In-memory array
```

**With**:
```javascript
const fs = require('fs').promises;
const fileSystem = new FileSystemManager({
  watchPaths: ['/Users/username/Desktop'],
  onChange: (event, path) => {
    // Update UI when files change
    refreshFileList();
  }
});
```

### 3. Local LLM Integration
**Add abstraction layer**:
```javascript
class AIProvider {
  constructor() {
    this.providers = {
      local: new LocalLLMProvider(), // LM Studio/Ollama
      poe: new PoeProvider(),         // Current implementation
      openai: new OpenAIProvider()    // Optional
    };
  }

  async chat(message, options = {}) {
    const provider = options.useLocal && this.providers.local.isAvailable()
      ? this.providers.local
      : this.providers.poe;

    return provider.sendMessage(message, options);
  }
}
```

### 4. Google API Integration
```javascript
class GoogleIntegration {
  constructor(credentials) {
    this.drive = new DriveAPI(credentials);
    this.calendar = new CalendarAPI(credentials);
    this.gmail = new GmailAPI(credentials);
  }

  async getRecentFiles() {
    return this.drive.files.list({
      pageSize: 10,
      orderBy: 'modifiedTime desc'
    });
  }

  async getTodaysEvents() {
    const now = new Date();
    return this.calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay(now),
      timeMax: endOfDay(now)
    });
  }
}
```

### 5. Database Layer
```javascript
const Database = require('better-sqlite3');
const db = new Database('nexus.db');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    due TEXT,
    priority TEXT,
    workspace_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_workspace ON tasks(workspace_id);
  CREATE INDEX idx_due ON tasks(due);
`);

// Queries
const getTasks = db.prepare('SELECT * FROM tasks WHERE workspace_id = ? ORDER BY created_at DESC');
const insertTask = db.prepare('INSERT INTO tasks (id, title, ...) VALUES (?, ?, ...)');
```

### 6. IPC Bridge (Electron/Tauri)
```javascript
// Main Process (Node.js)
ipcMain.handle('fs:readDir', async (event, path) => {
  return await fs.readdir(path);
});

ipcMain.handle('llm:chat', async (event, message) => {
  return await fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
  }).then(r => r.json());
});

// Renderer Process (Browser/UI)
const files = await window.api.readDir('/path/to/dir');
const response = await window.api.chat('Hello AI');
```

## Performance Considerations

### Current Bottlenecks
1. **Re-rendering entire lists** on every state change
   - Solution: Virtual scrolling, React-like diffing

2. **No pagination** for large datasets
   - Solution: Implement pagination or infinite scroll

3. **Inline event handlers** in HTML strings
   - Solution: Event delegation

4. **JSON parsing/stringifying** for export
   - Solution: Streaming JSON for large datasets

### Optimization Strategies for Desktop
1. **Lazy loading**: Load widgets on-demand
2. **Web Workers**: Heavy computations off main thread
3. **Debouncing**: Search, file watching
4. **Memoization**: Render functions, calculations
5. **IndexedDB/SQLite**: Faster than JSON for large datasets

## Security Model

### Current (Browser)
- Sandboxed iframe
- CSP restrictions
- No direct file access
- XSS protection via `escapeHtml()`

### Desktop Security Additions
1. **Filesystem permissions**: Ask user to grant access
2. **API key storage**: System keychain (macOS Keychain, Windows Credential Manager)
3. **Code signing**: Verify app integrity
4. **Auto-updates**: Signed update packages
5. **Content Security Policy**: Still enforce in desktop app
6. **Input validation**: All user inputs, file paths
7. **Rate limiting**: Local LLM requests to prevent abuse

## Testing Strategy

### Current Testing (Manual)
- Browser testing in Poe Canvas
- Manual feature verification

### Desktop Testing (Proposed)

**Unit Tests** (Jest)
```javascript
test('task creation adds to state', () => {
  const initialLength = AppState.tasks.length;
  saveTask({ title: 'Test', priority: 'high' });
  expect(AppState.tasks.length).toBe(initialLength + 1);
});
```

**Integration Tests** (Playwright)
```javascript
test('file upload flow', async ({ page }) => {
  await page.click('#uploadFileBtn');
  await page.setInputFiles('#fileUploadInput', 'test.txt');
  await expect(page.locator('.file-item:has-text("test.txt")')).toBeVisible();
});
```

**E2E Tests**
- Full user workflows
- Cross-platform testing
- Performance benchmarks

## Migration Path

### Phase 1: Extraction
1. Split `index.html` into separate files:
   - `index.html` (structure only)
   - `styles.css` (all styles)
   - `app.js` (all JavaScript)

### Phase 2: Modularization
2. Break `app.js` into modules:
   - `state.js` - State management
   - `tasks.js` - Task-related functions
   - `notes.js` - Note-related functions
   - `ai.js` - AI chat functions
   - `files.js` - File management
   - `utils.js` - Utilities

### Phase 3: Framework Setup
3. Choose and configure desktop framework:
   - Initialize Tauri/Electron
   - Set up build pipeline
   - Configure development server

### Phase 4: Backend Integration
4. Implement native features:
   - Filesystem access
   - Local LLM client
   - Google API integration
   - Database layer

### Phase 5: UI Upgrade (Optional)
5. Consider modern framework:
   - React/Vue/Svelte for reactive UI
   - TypeScript for type safety
   - Component library (Radix UI, HeadlessUI)

---

**This architecture is production-ready for Poe Canvas and well-structured for desktop migration. 🏗️**
