# HANDOFF: Google Integration Implementation

**Version:** 1.0  
**Date:** 2025-12-03  
**From:** Claude Desktop (Opus 4.5)  
**To:** Gemini 3 Pro (Antigravity IDE)

---

> **🤖 READ FIRST:** [AI_PROTOCOL.md](./AI_PROTOCOL.md)

---

## Repo & Branch

**Repo:** `github.com/Dunker007/Fresh-Start`  
**Branch:** `main` (fully synced)  
**Target OS:** Windows 11 (LuxRig)

**Clone/Pull:**
```bash
git clone https://github.com/Dunker007/Fresh-Start.git
cd Fresh-Start/poe-canvas
```

---

## Current State

### What Exists
- ✅ Electron desktop app (working, 76MB exe)
- ✅ Keyboard shortcuts (`Ctrl+K` command palette, etc.)
- ✅ Local LLM integration (LM Studio @ localhost:1234)
- ✅ Modular JS architecture (`src/js/*.js`)
- ✅ IPC bridge stubbed (`electron/preload.js`, `src/js/filesystem.js`)

### What's Missing
- ❌ Google OAuth2 flow
- ❌ Google Drive integration
- ❌ Google Calendar integration
- ❌ Gmail integration
- ❌ Secure token storage

---

## Task

Design and implement Google ecosystem integration for the Electron app.

### Scope

**In Scope:**
1. OAuth2 authentication flow (desktop app callback)
2. Google Drive - recent files, search, open in browser
3. Google Calendar - today's events, sync task due dates
4. Gmail - unread count, inbox preview

**Out of Scope (for now):**
- Google Cloud project setup (user will do this)
- File upload/sync to Drive
- Creating calendar events programmatically
- Sending emails

---

## Requirements

### Authentication
- OAuth2 with PKCE (desktop apps)
- Redirect to `http://localhost:<port>/callback`
- Secure token storage (electron-store or keytar)
- Token refresh handling
- Graceful logout/re-auth

### Google Drive
```javascript
// Required capabilities
- listRecentFiles(limit = 10)     // Last modified files
- searchFiles(query)               // Full-text search
- getFileMetadata(fileId)          // Name, type, size, modified
- openInBrowser(fileId)            // Open web view
```

### Google Calendar
```javascript
// Required capabilities
- getTodaysEvents()                // Events for today
- getUpcomingEvents(days = 7)      // Next week
- getEventDetails(eventId)         // Full event info
```

### Gmail
```javascript
// Required capabilities
- getUnreadCount()                 // Inbox unread badge
- getRecentEmails(limit = 5)       // Subject, from, date
- openInBrowser(messageId)         // Open in Gmail
```

---

## Proposed Architecture

```
poe-canvas/
├── src/js/
│   ├── google/
│   │   ├── auth.js           # OAuth2 flow, token management
│   │   ├── drive.js          # Drive API client
│   │   ├── calendar.js       # Calendar API client
│   │   ├── gmail.js          # Gmail API client
│   │   └── index.js          # Unified export
│   └── main.js               # Import and init google module
├── electron/
│   ├── main.js               # Add auth callback server
│   └── preload.js            # Expose google IPC channels
└── config/
    └── google.example.json   # Template for credentials
```

---

## Reference Code

From `docs/ENHANCEMENT_ROADMAP.md`:

```javascript
const { google } = require('googleapis');

class GoogleIntegration {
  constructor() {
    this.auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
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
}
```

---

## UI Integration Points

The dashboard already has widget areas. Google data should populate:

1. **Google Widget** (new) - Add to dashboard
   - Drive: 3-5 recent files with icons
   - Calendar: Today's events timeline
   - Gmail: Unread badge + last 3 subjects

2. **Settings Panel** - Add Google section
   - "Connect Google Account" button
   - Connection status indicator
   - "Disconnect" option

3. **Command Palette** - Add commands
   - "Google: Search Drive"
   - "Google: Today's Calendar"
   - "Google: Open Gmail"

---

## Dependencies to Add

```json
{
  "dependencies": {
    "googleapis": "^118.0.0",
    "electron-store": "^8.1.0"
  }
}
```

Or for more secure token storage:
```json
{
  "dependencies": {
    "keytar": "^7.9.0"
  }
}
```

---

## Environment Notes

### Windows (LuxRig)
- PowerShell uses `;` not `&&`
- Always set `$env:NODE_ENV = "development"` before `npm install`
- Electron exe at: `dist/Nexus Workspace-0.1.0-x64.exe`

### Testing
```powershell
cd "C:\Repos GIT\Fresh-Start\poe-canvas"
$env:NODE_ENV = "development"
npm install
npm run electron
```

---

## Success Criteria

- [ ] OAuth2 flow works (opens browser, handles callback)
- [ ] Tokens stored securely, persist across app restarts
- [ ] Drive recent files display in UI
- [ ] Calendar events display for today
- [ ] Gmail unread count shows
- [ ] Graceful handling when not authenticated
- [ ] No credentials in code (use config file)

---

## Completion Handoff Required

When done, provide per AI_PROTOCOL.md:

```markdown
## COMPLETION: Google Integration

**Branch Created:** [branch name]
**Based On:** main
**Merge Required:** [Yes/No]

**What Was Done:**
- [list changes]

**Files Changed:**
- [list files]

**Testing Performed:**
- [ ] OAuth flow - [Linux/Windows]
- [ ] Drive API - [Linux/Windows]
- [ ] Calendar API - [Linux/Windows]
- [ ] Gmail API - [Linux/Windows]

**Windows Notes:**
- [any Windows-specific findings]

**Known Issues:**
- [any bugs or incomplete items]

**Next Steps:**
- [what should follow]
```

---

## Questions to Resolve

1. **Token storage:** `electron-store` (simple) vs `keytar` (system keychain)?
2. **Scopes:** Read-only for all, or include write for calendar?
3. **Offline access:** Request refresh tokens for persistent auth?

Make decisions and document rationale.

---

*Ready for implementation. Google's your turf - have at it.* 🚀
