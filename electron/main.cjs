```javascript
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
// Electron Main Process

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, app.isPackaged ? '../dist/icon.png' : '../public/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hiddenInset', // Native-like look on macOS
    });

    // Load the index.html of the app.
    // We check for a flag or just the URL availability usually, but here we rely on the npm script
    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        const indexPath = path.join(__dirname, '../dist/index.html');
        console.log('Loading production file:', indexPath);
        mainWindow.loadFile(indexPath).then(() => {
            console.log('File loaded successfully');
            mainWindow.show();
        }).catch(e => {
            console.error('Failed to load file:', e);
        });
        // Open DevTools in production for debugging
        mainWindow.webContents.openDevTools();
    }

    // Open external links in the default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
    if (process.platform === 'darwin') {
        app.dock.setIcon(path.join(__dirname, app.isPackaged ? '../dist/icon.png' : '../public/icon.png'));
    }
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
