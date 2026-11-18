const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { iniciarServidor } = require('../server');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('in-process-gpu');
const raiz = fs.mkdtempSync(path.join(__dirname, '../.tmp-ui/generos-ui-'));
app.setPath('userData', path.join(raiz, 'profile'));
let server, win;
app.whenReady().then(async () => {
    try {
        server = iniciarServidor({ dataDir: path.join(raiz, 'biblioteca') });
        await new Promise(resolve => server.once('listening', resolve));
        const base = `http://127.0.0.1:${server.address().port}`;
        // WAV PCM de tres segundos, generado para la prueba sin audios personales.
        const wav = Buffer.alloc(44 + 8000 * 3 * 2);
        wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
        wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
        wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
        wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
        async function crear(titulo, genero, audio = false) {
            const form = new FormData();
            for (const [key, value] of Object.entries({ titulo, artista: 'Artista de prueba', genero, fase: 'Mezcla', calificacion: 4 })) form.append(key, value);
            if (audio) form.append('archivoAudio', new Blob([wav], { type: 'audio/wav' }), 'prueba.wav');
            const respuesta = await fetch(base + '/api/pistas', { method: 'POST', body: form });
            assert.equal(respuesta.status, 201);
            return respuesta.json();
        }
        await crear('Sesión de guitarra', 'Rock', true);
        await crear('Sesión de sintetizador', 'Electrónica', true);
        win = new BrowserWindow({ show: false, width: 1200, height: 850, webPreferences: { offscreen: true, nodeIntegration: false, contextIsolation: true } });
        const ejecutar = codigo => win.webContents.executeJavaScript(codigo);
        const esperar = async condicion => {
            const limite = Date.now() + 10000;
            while (!await ejecutar(condicion)) {
                if (Date.now() > limite) throw new Error('Tiempo agotado: ' + condicion);
                await new Promise(resolve => setTimeout(resolve, 60));
            }
        };
        const captura = async nombre => {
            await new Promise(resolve => setTimeout(resolve, 250));
            fs.writeFileSync(path.join(__dirname, '../.tmp-ui/' + nombre + '.png'), (await win.webContents.capturePage()).toPNG());
        };
        await win.loadURL(base);
        win.webContents.focus();
        await esperar("document.getElementById('estadoPistas').textContent === '2 de 2 pistas' && document.querySelectorAll('.filtro-genero').length === 2");
        await captura('generos-escritorio');
        await ejecutar("document.querySelector('#listaGeneros input[value=rock]').click()");
        assert.equal(await ejecutar("document.querySelectorAll('[data-pista]').length"), 1);
        await ejecutar("inputBusqueda.value='sintetizador'; filtrarPistas()");
        assert.equal(await ejecutar("document.querySelectorAll('[data-pista]').length"), 0);
        await ejecutar("limpiarBusqueda(); document.querySelectorAll('#listaGeneros input')[0].click()");
        assert.equal(await ejecutar("document.querySelectorAll('[data-pista]').length"), 2);
        // La ventana offscreen no recibe foco del sistema operativo: emite el evento de foco del campo.
        await ejecutar("document.getElementById('btnLimpiarGeneros').click(); nuevaPista(); document.getElementById('genero').focus(); document.getElementById('genero').dispatchEvent(new FocusEvent('focus'))");
        await esperar("document.getElementById('genero').getAttribute('aria-expanded') === 'true'");
        await captura('generos-sugerencias');
        await ejecutar("document.getElementById('genero').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}))");
        assert.equal(await ejecutar("document.querySelector('#sugerenciasGenero [aria-selected=true]').textContent"), 'Rock');
        await ejecutar("document.getElementById('genero').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true,cancelable:true}))");
        assert.equal(await ejecutar("document.getElementById('genero').value"), '');
        await ejecutar("sugerenciasGenero.cerrar(); document.getElementById('genero').click()");
        await ejecutar("document.getElementById('genero').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true})); document.getElementById('genero').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))");
        assert.equal(await ejecutar("document.getElementById('genero').value"), 'Electrónica');
        assert.equal(await ejecutar("document.getElementById('modalFormulario').open"), true);
        await ejecutar("document.getElementById('genero').click()");
        await ejecutar("document.getElementById('genero').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
        assert.equal(await ejecutar("document.getElementById('modalFormulario').open"), true);
        assert.equal(await ejecutar("document.getElementById('genero').getAttribute('aria-expanded')"), 'false');
        assert.equal(await ejecutar("document.getElementById('titulo').required"), false);
        await ejecutar(`for (const [id, valor] of Object.entries({titulo:'', artista:'Artista', genero:'Ambient', calificacion:'5'})) document.getElementById(id).value=valor;
            const bytes = Uint8Array.from(atob('${wav.toString('base64')}'), letra => letra.charCodeAt(0));
            const archivos = new DataTransfer();
            archivos.items.add(new File([bytes], 'Sesión automática.wav', {type:'audio/wav'}));
            document.getElementById('archivoAudio').files = archivos.files;
            document.getElementById('genero').dispatchEvent(new Event('input'));
            document.getElementById('btnGuardar').click();`);
        await esperar("document.getElementById('estadoPistas').textContent === '3 de 3 pistas' && document.querySelectorAll('.filtro-genero').length === 3");
        assert.deepEqual(await (await fetch(base + '/api/generos')).json(), ['Ambient', 'Electrónica', 'Rock']);
        assert.equal(await ejecutar("document.querySelector('[data-pista] .card-title').textContent"), 'Sesión automática.wav');
        await ejecutar("document.querySelector('.reproductor-play').click()");
        await esperar("!document.querySelector('audio').paused && document.querySelector('audio').duration === 3");
        assert.equal(await ejecutar("document.querySelector('.reproductor-progreso').disabled"), false);
        await ejecutar("document.querySelectorAll('.reproductor-play')[1].click()");
        await esperar("!document.querySelectorAll('audio')[1].paused && document.querySelector('audio').paused");
        await ejecutar("document.querySelector('.reproductor-play').click()");
        await esperar("!document.querySelector('audio').paused && document.querySelectorAll('audio')[1].paused");
        await ejecutar("document.querySelector('.reproductor-play').click()");
        assert.equal(await ejecutar("document.querySelector('audio').paused"), true);
        await ejecutar("const progreso=document.querySelector('.reproductor-progreso'); progreso.value=50; progreso.dispatchEvent(new Event('input'))");
        assert.equal(await ejecutar("document.querySelector('audio').currentTime"), 1.5);
        await ejecutar("document.querySelector('.reproductor-silencio').click()");
        assert.equal(await ejecutar("document.querySelector('audio').muted"), true);
        await ejecutar("const volumen=document.querySelector('.volumen'); volumen.value=.4; volumen.dispatchEvent(new Event('input'))");
        assert.equal(await ejecutar("document.querySelector('audio').volume"), .4);
        assert.equal(await ejecutar("document.querySelector('audio').muted"), false);
        await ejecutar("document.querySelector('audio').src='/uploads/inexistente.wav'; document.querySelector('.reproductor-play').click()");
        await esperar("!document.querySelector('.reproductor-error').hidden");
        win.setSize(390, 844);
        await new Promise(resolve => setTimeout(resolve, 150));
        assert.equal(await ejecutar('document.documentElement.scrollWidth <= innerWidth'), true);
        await captura('generos-movil');
        await ejecutar("nuevaPista(); document.getElementById('genero').focus(); document.getElementById('genero').dispatchEvent(new FocusEvent('focus'))");
        await captura('generos-sugerencias-movil');
        assert.equal(await ejecutar("document.getElementById('sugerenciasGenero').getBoundingClientRect().width === document.getElementById('genero').getBoundingClientRect().width"), true);
        console.log('OK UI real: filtros múltiples + búsqueda, creación libre, sugerencias con teclado, Escape, audio WAV, pausa, avance, volumen, fallo de audio y ancho móvil');
        win.destroy();
        await new Promise(resolve => server.close(resolve));
        app.exit(0);
    } catch (error) {
        console.error(error);
        win?.destroy(); server?.close(); app.exit(1);
    }
});
