const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

require('@electron/remote/main').initialize();

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        backgroundColor: "#90a14a",
        frame: false,
        show: false,
        fullscreen: false,
        maximizable: true,
        fullscreenable: false,
        webPreferences: {
            sandbox: false,
            webviewTag: true,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.maximize();

    mainWindow.loadFile('./core/startup/index.html');
    require("@electron/remote/main").enable(mainWindow.webContents);

    ipcMain.on('createGlobalShortcut', (event, args) => {
        globalShortcut.register(args[0], () => {
            mainWindow.send(args[1]);
        });
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    globalShortcut.registerAll(['Alt+Tab', 'Alt+Shift+Tab', 'Ctrl+Alt+Tab', 'Meta+Tab'], () => {
        mainWindow.send("switch");
    });

    globalShortcut.registerAll(['Alt+F4', 'Meta+F4'/*, 'Ctrl+Q'*/], () => {
        mainWindow.send("close");
    });

    globalShortcut.registerAll(['Alt+Shift+F4', 'Meta+Shift+F4', 'Ctrl+Shift+Q'], () => {
        mainWindow.send("forceQuit");
    });

    globalShortcut.register('Alt+Space', () => {
        mainWindow.send("menu");
    });

    globalShortcut.registerAll(['Super+D', 'Meta+D', 'Alt+D'], () => {
        mainWindow.send("desktop");
    });

    globalShortcut.registerAll(['Ctrl+Alt+Delete', 'Meta+Alt+Delete'], () => {
        mainWindow.send("emergency");
    });

    globalShortcut.registerAll(['VolumeUp', 'Meta+Shift+Up', 'Alt+Shift+Up'], () => {
        mainWindow.send("mediakey", "VolumeUp");
    });

    globalShortcut.registerAll(['VolumeDown', 'Meta+Shift+Down', 'Alt+Shift+Down'], () => {
        mainWindow.send("mediakey", "VolumeDown");
    });

    globalShortcut.registerAll(['BrightnessUp', 'Meta+Ctrl+Up', 'Ctrl+Alt+Up'], () => {
        mainWindow.send("mediakey", "BrightnessUp");
    });

    globalShortcut.registerAll(['BrightnessDown', 'Meta+Ctrl+Down', 'Ctrl+Alt+Down'], () => {
        mainWindow.send("mediakey", "BrightnessDown");
    });

    globalShortcut.registerAll(['VolumeMute', 'Meta+Shift+Space', 'Alt+Shift+Space'], () => {
        mainWindow.send("mediakey", "VolumeMute");
    });

    globalShortcut.register('MediaNextTrack', () => {
        mainWindow.send("mediakey", "MediaNextTrack");
    });

    globalShortcut.register('MediaPreviousTrack', () => {
        mainWindow.send("mediakey", "MediaPreviousTrack");
    });

    globalShortcut.register('MediaStop', () => {
        mainWindow.send("mediakey", "MediaStop");
    });

    globalShortcut.register('MediaPlayPause', () => {
        mainWindow.send("mediakey", "MediaPlayPause");
    });

    globalShortcut.registerAll(['PrintScreen', 'Meta+Shift+S', 'Alt+Shift+S'], () => {
        mainWindow.send("mediakey", "PrintScreen");
    });
}
app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});