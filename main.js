const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { directorioDatos } = require('./storage');
const { iniciarServidor } = require('./server');

app.setName('Gestor de Tracks');
app.setAppUserModelId('com.hirostudio.app');
const dataDir = directorioDatos();
fs.mkdirSync(path.join(dataDir, 'profile'), { recursive: true });
app.setPath('userData', path.join(dataDir, 'profile'));
const log = mensaje => {
    try { fs.appendFileSync(path.join(dataDir, 'app.log'), `${new Date().toISOString()} ${mensaje}\n`); }
    catch { /* Un fallo del registro no debe cerrar la aplicación. */ }
};
let server;
let win;
let baseURL;

async function crearVentana() {
    win = new BrowserWindow({
        width: 1200, height: 800,
        title: 'Gestor de Tracks',
        icon: path.join(__dirname, 'public', 'icon.ico'),
        webPreferences: { nodeIntegration: false, contextIsolation: true }
    });
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith(baseURL + '/')) event.preventDefault();
    });
    await win.loadURL(baseURL);
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (!win) return;
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
    });
    app.whenReady().then(async () => {
        try {
            server = iniciarServidor({ dataDir });
            await new Promise((resolve, reject) => {
                server.once('listening', resolve);
                server.once('error', reject);
            });
            baseURL = `http://127.0.0.1:${server.address().port}`;
            log('Biblioteca local iniciada.');
            await crearVentana();
        } catch (error) {
            log(error.stack || error.message);
            dialog.showErrorBox('No se pudo abrir AppStudio', `Revisa el espacio y los permisos de esta carpeta:\n${dataDir}\n\n${error.message}`);
            app.quit();
        }
    });
    app.on('activate', () => {
        if (baseURL && BrowserWindow.getAllWindows().length === 0) crearVentana().catch(error => log(error.message));
    });
    app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
    app.on('will-quit', () => { server?.close(); });
}
