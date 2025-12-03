// Nexus Workspace - Local Bridge Server
// Provides filesystem access to the browser app
// Run: node bridge.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3456;

// CORS headers for browser access
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Get common paths
const PATHS = {
  home: os.homedir(),
  desktop: path.join(os.homedir(), 'Desktop'),
  documents: path.join(os.homedir(), 'Documents'),
  downloads: path.join(os.homedir(), 'Downloads')
};

// Read directory and return file info
function readDir(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries.map(entry => {
      const fullPath = path.join(dirPath, entry.name);
      let stats = null;
      try {
        stats = fs.statSync(fullPath);
      } catch (e) {}
      
      return {
        name: entry.name,
        path: fullPath,
        isDirectory: entry.isDirectory(),
        size: stats?.size || 0,
        modified: stats?.mtime?.toISOString() || null,
        type: getFileType(entry.name, entry.isDirectory())
      };
    }).sort((a, b) => {
      // Folders first, then alphabetical
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  } catch (err) {
    throw new Error(`Cannot read directory: ${err.message}`);
  }
}

function getFileType(filename, isDir) {
  if (isDir) return 'folder';
  const ext = path.extname(filename).toLowerCase().slice(1);
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'];
  const codeExts = ['js', 'ts', 'py', 'html', 'css', 'json', 'jsx', 'tsx', 'rs', 'go'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'];
  
  if (imageExts.includes(ext)) return 'image';
  if (codeExts.includes(ext)) return 'code';
  if (docExts.includes(ext)) return 'document';
  return 'other';
}

// HTTP Server
const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // Routes
  if (url.pathname === '/paths') {
    res.writeHead(200, CORS);
    res.end(JSON.stringify(PATHS));
    return;
  }
  
  if (url.pathname === '/list') {
    const dir = url.searchParams.get('path') || PATHS.desktop;
    try {
      const files = readDir(dir);
      res.writeHead(200, CORS);
      res.end(JSON.stringify({ path: dir, files }));
    } catch (err) {
      res.writeHead(500, CORS);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }
  
  if (url.pathname === '/open') {
    const filePath = url.searchParams.get('path');
    if (filePath) {
      const { exec } = require('child_process');
      // Windows: start, Mac: open, Linux: xdg-open
      const cmd = process.platform === 'win32' ? 'start ""' : 
                  process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${cmd} "${filePath}"`, (err) => {
        if (err) {
          res.writeHead(500, CORS);
          res.end(JSON.stringify({ error: err.message }));
        } else {
          res.writeHead(200, CORS);
          res.end(JSON.stringify({ success: true }));
        }
      });
      return;
    }
  }
  
  if (url.pathname === '/status') {
    res.writeHead(200, CORS);
    res.end(JSON.stringify({ 
      status: 'ok', 
      version: '1.0.0',
      paths: PATHS 
    }));
    return;
  }
  
  // 404
  res.writeHead(404, CORS);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Nexus Workspace Bridge Server            ║
║   Running on http://localhost:${PORT}         ║
╠════════════════════════════════════════════╣
║   Endpoints:                               ║
║   GET /status  - Server status             ║
║   GET /paths   - System paths              ║
║   GET /list?path=...  - List directory     ║
║   GET /open?path=...  - Open file          ║
╚════════════════════════════════════════════╝

Desktop:   ${PATHS.desktop}
Documents: ${PATHS.documents}
Downloads: ${PATHS.downloads}

Press Ctrl+C to stop.
`);
});
