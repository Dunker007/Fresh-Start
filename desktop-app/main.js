const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Configuration
const WEBSITE_PORT = 3000;
const BRIDGE_PORT = 3456;
const IS_DEV = process.env.NODE_ENV === 'development';

let mainWindow;
let websiteProcess;
let bridgeProcess;

// Path to resources (handle dev vs prod)
// In production, resources are likely in process.resourcesPath/app/...
const ROOT_DIR = IS_DEV ? path.join(__dirname, '..') : path.join(process.resourcesPath, 'app');
const WEBSITE_DIR = path.join(ROOT_DIR, 'website-v2', '.next', 'standalone');
const BRIDGE_DIR = path.join(ROOT_DIR, 'luxrig-bridge');

function log(msg) {
    console.log(`[DLX Main] ${msg}`);
}

function startBridge() {
    return new Promise((resolve, reject) => {
        log('Starting LuxRig Bridge...');
        const scriptPath = path.join(BRIDGE_DIR, 'server.js');

        // In prod, simple node start. In dev, we might look for different path
        // We assume node executable involves in the packaged app or system node?
        // For a TRULY standalone exe, we might bundle node. 
        // OR we assume the user has Node installed (Start-Studio.ps1 approach).
        // Since we are using electron-builder, bundling node for the child processes is tricky 
        // unless we use pkg or similar for them too.

        // Strategy: Require the user to have Node, OR bundle a small node runtime.
        // For this step, let's assume system 'node' command works, or allow for packaged node.

        bridgeProcess = spawn('node', [scriptPath], {
            cwd: BRIDGE_DIR,
            env: { ...process.env, PORT: BRIDGE_PORT }
        });

        bridgeProcess.stdout.on('data', (data) => log(`[Bridge] ${data}`));
        bridgeProcess.stderr.on('data', (data) => console.error(`[Bridge Err] ${data}`));

        // Give it a second to spin up
        setTimeout(resolve, 2000);
    });
}

function startWebsite() {
    return new Promise((resolve, reject) => {
        log('Starting Website (Next.js Standalone)...');
        const scriptPath = path.join(WEBSITE_DIR, 'server.js');

        websiteProcess = spawn('node', [scriptPath], {
            cwd: WEBSITE_DIR,
            env: { ...process.env, PORT: WEBSITE_PORT }
        });

        websiteProcess.stdout.on('data', (data) => log(`[Website] ${data}`));
        websiteProcess.stderr.on('data', (data) => console.error(`[Website Err] ${data}`));

        setTimeout(resolve, 3000);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'icon.png')
    });

    log(`Loading http://localhost:${WEBSITE_PORT}`);
    mainWindow.loadURL(`http://localhost:${WEBSITE_PORT}`);

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(async () => {
    try {
        await startBridge();
        await startWebsite();
        createWindow();
    } catch (e) {
        console.error('Failed to start services:', e);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    log('Killing child processes...');
    if (bridgeProcess) bridgeProcess.kill();
    if (websiteProcess) websiteProcess.kill();
});
