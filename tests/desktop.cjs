// Ejecuta la aplicación empaquetada con SQLite y diálogos reales, sin red externa.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('in-process-gpu');
const pruebas = path.join(__dirname, '../.tmp-ui');
fs.mkdirSync(pruebas, { recursive: true });
const dataDir = fs.mkdtempSync(path.join(pruebas, 'desktop-'));
app.setPath('userData', path.join(dataDir, 'profile'));
app.setPath('sessionData', path.join(dataDir, 'session'));
let server;
let win;
app.whenReady().then(async () => {
    try {
        const config = require('../package.json');
        const archivo = path.join(__dirname, '..', process.env.ESTUDIO_HIRO_BUILD_DIR || config.build.directories.output, 'win-unpacked/resources/app.asar');
        const { iniciarServidor } = require(path.join(archivo, 'server.js'));
        const abrir = async () => {
            server = iniciarServidor({ dataDir: path.join(dataDir, 'biblioteca') });
            await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
            return `http://127.0.0.1:${server.address().port}`;
        };
        let base = await abrir();
        win = new BrowserWindow({ show: false, width: 1200, height: 800, webPreferences: { offscreen: true, backgroundThrottling: false, nodeIntegration: false, contextIsolation: true } });
        const externos = [];
        win.webContents.session.webRequest.onBeforeRequest({urls: ['*://*/*']}, (details, callback) => {
            const externo = !details.url.startsWith(base + '/');
            if (externo) externos.push(details.url);
            callback({cancel: externo});
        });
        const ejecutar = codigo => win.webContents.executeJavaScript(codigo);
        const esperar = async condicion => {
            const limite = Date.now() + 8000;
            while (!await ejecutar(condicion)) {
                if (Date.now() > limite) throw new Error('Tiempo agotado: ' + condicion);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        };
        await win.loadURL(base);
        await esperar("document.getElementById('estadoPistas').textContent === '0 de 0 pistas'");
        await ejecutar(`nuevaPista();
            for (const [id, valor] of Object.entries({titulo: '', artista: 'Artista de prueba', genero: 'Rock', fase: 'Mezcla', calificacion: '4', comentario: 'Grabada sin internet'})) document.getElementById(id).value = valor;
            document.getElementById('btnGuardar').click();`);
        await esperar("document.querySelectorAll('[data-pista]').length === 1 && !document.getElementById('modalFormulario').open");
        await new Promise(resolve => setTimeout(resolve, 200));
        fs.writeFileSync(path.join(pruebas, 'desktop-local.png'), (await win.webContents.capturePage()).toPNG());
        const guardadas = await (await fetch(base + '/api/pistas')).json();
        assert.equal(guardadas[0].titulo, 'Sin título');
        assert.deepEqual(await (await fetch(base + '/api/generos')).json(), ['Rock']);
        await ejecutar("document.querySelector('[data-pista] button:nth-child(2)').click()");
        await esperar("document.getElementById('modalFormulario').open");
        assert.equal(await ejecutar("document.activeElement.id"), 'titulo');
        win.setSize(390, 700);
        await new Promise(resolve => setTimeout(resolve, 100));
        assert.equal(await ejecutar('document.documentElement.scrollWidth <= window.innerWidth'), true);
        fs.writeFileSync(path.join(pruebas, 'formulario-local.png'), (await win.webContents.capturePage()).toPNG());
        win.webContents.sendInputEvent({type: 'keyDown', keyCode: 'Escape'});
        win.webContents.sendInputEvent({type: 'keyUp', keyCode: 'Escape'});
        await esperar("!document.getElementById('modalFormulario').open");
        await new Promise(resolve => server.close(resolve));
        base = await abrir();
        const restauradas = await (await fetch(base + '/api/pistas')).json();
        assert.equal(restauradas[0]._id, guardadas[0]._id);
        assert.equal(restauradas[0].comentario, 'Grabada sin internet');
        assert.deepEqual(await (await fetch(base + '/api/generos')).json(), ['Rock']);
        assert.deepEqual(externos, []);
        console.log('OK aplicación empaquetada: SQLite en Electron, creación real, persistencia, diálogos, vista móvil y ninguna petición externa');
        win.destroy();
        await new Promise(resolve => server.close(resolve));
        app.exit(0);
    } catch (error) {
        console.error(error);
        win?.destroy();
        server?.close();
        app.exit(1);
    }
});
