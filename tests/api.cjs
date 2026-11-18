const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { iniciarServidor } = require('../server');
fs.mkdirSync(path.join(__dirname, '../.tmp-ui'), { recursive: true });
const raiz = fs.mkdtempSync(path.join(__dirname, '../.tmp-ui/api-'));
const dispositivoA = path.join(raiz, 'equipo-a');
const dispositivoB = path.join(raiz, 'equipo-b');
const servidores = new Set();
async function abrir(dataDir) {
    const server = iniciarServidor({ dataDir });
    servidores.add(server);
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    return { server, base: `http://127.0.0.1:${server.address().port}` };
}
async function cerrar(server) {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    servidores.delete(server);
}
const datos = { titulo: 'Prueba local', artista: 'Artista', genero: 'Rock', fase: 'Mezcla', calificacion: 4, comentario: 'Original' };
function formulario(campos, audio, nombre = 'sesion.wav') {
    const form = new FormData();
    for (const [key, value] of Object.entries(campos)) form.append(key, value);
    if (audio) form.append('archivoAudio', new Blob([audio], { type: 'audio/wav' }), nombre);
    return form;
}
async function json(base, ruta, method, body) {
    return fetch(base + ruta, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
(async () => {
    try {
        let a = await abrir(dispositivoA);
        let b = await abrir(dispositivoB);
        assert.equal(a.server.address().address, '127.0.0.1');
        assert.deepEqual(await (await fetch(a.base + '/api/pistas')).json(), []);
        const original = path.join(raiz, 'original.wav');
        const audio = Buffer.from('RIFF-audio-local-de-prueba');
        fs.writeFileSync(original, audio);
        let respuesta = await fetch(a.base + '/api/pistas', { method: 'POST', body: formulario({ ...datos, artista: ' ' }, audio) });
        assert.equal(respuesta.status, 400);
        assert.equal(fs.readdirSync(path.join(dispositivoA, 'uploads')).length, 0);
        respuesta = await fetch(a.base + '/api/pistas', { method: 'POST', body: formulario(datos, fs.readFileSync(original)) });
        assert.equal(respuesta.status, 201);
        let pista = await respuesta.json();
        assert.equal(pista.calificacion, 4);
        assert.ok(pista.archivoAudio.endsWith('.wav'));
        assert.deepEqual(Buffer.from(await (await fetch(a.base + pista.archivoAudio)).arrayBuffer()), audio);
        const rango = await fetch(a.base + pista.archivoAudio, { headers: { Range: 'bytes=0-3' } });
        assert.equal(rango.status, 206);
        assert.equal(await rango.text(), 'RIFF');
        assert.deepEqual(await (await fetch(b.base + '/api/pistas')).json(), []);
        assert.equal((await fetch(b.base + pista.archivoAudio)).status, 404);
        console.log('OK biblioteca y audios separados por dispositivo, carga y reproducción por rangos');
        respuesta = await json(a.base, '/api/pistas/' + pista._id, 'PUT', { genero: 'Jazz', comentario: 'Editado', archivoAudio: '/uploads/falso.wav' });
        assert.equal(respuesta.status, 200);
        let editada = await respuesta.json();
        assert.equal(editada.genero, 'Jazz');
        assert.equal(editada.comentario, 'Editado');
        assert.equal(editada.archivoAudio, pista.archivoAudio);
        assert.equal((await json(a.base, '/api/pistas/' + pista._id, 'PUT', { calificacion: 2.5 })).status, 400);
        assert.equal((await json(a.base, '/api/pistas/' + pista._id, 'PUT', { fase: 'No existe' })).status, 400);
        const simultaneas = await Promise.all(Array.from({length: 6}, (_, i) => json(a.base, '/api/pistas', 'POST', {...datos, titulo: `Pista ${i}`, fase: 'Finalizado'})));
        assert.ok(simultaneas.every(response => response.status === 201));
        assert.equal((await (await fetch(a.base + '/api/pistas?fase=Finalizado')).json()).length, 6);
        assert.deepEqual(await (await fetch(a.base + '/api/pistas?fase=' + encodeURIComponent("' OR 1=1 --"))).json(), []);
        await cerrar(a.server);
        a = await abrir(dispositivoA);
        const guardadas = await (await fetch(a.base + '/api/pistas')).json();
        assert.equal(guardadas.length, 7);
        assert.equal(guardadas.find(item => item._id === pista._id).comentario, 'Editado');
        assert.equal((await fetch(a.base + pista.archivoAudio)).status, 200);
        console.log('OK validación, edición, escrituras concurrentes y persistencia después de reiniciar');
        respuesta = await fetch(a.base + '/api/pistas/' + pista._id, { method: 'PUT', body: formulario({ calificacion: 8 }, Buffer.from('nuevo')) });
        assert.equal(respuesta.status, 400);
        assert.equal(fs.readdirSync(path.join(dispositivoA, 'uploads')).length, 1);
        assert.equal((await fetch(a.base + pista.archivoAudio)).status, 200);
        respuesta = await fetch(a.base + '/api/pistas/' + pista._id, { method: 'PUT', body: formulario({}, Buffer.from('nuevo')) });
        assert.equal(respuesta.status, 200);
        editada = await respuesta.json();
        assert.notEqual(editada.archivoAudio, pista.archivoAudio);
        assert.equal((await fetch(a.base + pista.archivoAudio)).status, 404);
        assert.equal(await (await fetch(a.base + editada.archivoAudio)).text(), 'nuevo');
        respuesta = await fetch(a.base + '/api/pistas/' + pista._id, { method: 'DELETE' });
        assert.equal(respuesta.status, 200);
        assert.equal(fs.readdirSync(path.join(dispositivoA, 'uploads')).length, 0);
        assert.ok(fs.existsSync(original), 'El audio original del usuario permanece intacto');
        for (const method of ['PUT', 'DELETE']) {
            respuesta = await json(a.base, '/api/pistas/inexistente', method, {});
            assert.equal(respuesta.status, 404);
        }
        respuesta = await fetch(a.base + '/api/pistas/inexistente', { method: 'PUT', body: formulario({}, audio) });
        assert.equal(respuesta.status, 404);
        assert.equal(fs.readdirSync(path.join(dispositivoA, 'uploads')).length, 0);
        assert.deepEqual(await (await fetch(b.base + '/api/pistas')).json(), []);
        console.log('OK reemplazo y limpieza de audios, fallos sin archivos huérfanos y originales conservados');
        respuesta = await json(b.base, '/api/pistas', 'POST', { ...datos, titulo: undefined, nombreAudio: 'Nombre no confiable.wav' });
        assert.equal(respuesta.status, 201);
        let automatica = await respuesta.json();
        assert.equal(automatica.titulo, 'Sin título');
        assert.equal(automatica.nombreAudio, null);
        await fetch(b.base + '/api/pistas/' + automatica._id, { method: 'DELETE' });
        for (const [titulo, nombre] of [['   ', 'Sesión de prueba.wav'], [undefined, 'Mezcla final.wav']]) {
            const campos = { ...datos };
            if (titulo === undefined) delete campos.titulo;
            else campos.titulo = titulo;
            respuesta = await fetch(b.base + '/api/pistas', { method: 'POST', body: formulario(campos, audio, nombre) });
            assert.equal(respuesta.status, 201);
            automatica = await respuesta.json();
            assert.equal(automatica.titulo, nombre);
            assert.equal(automatica.nombreAudio, nombre);
            respuesta = await json(b.base, '/api/pistas/' + automatica._id, 'PUT', { titulo: ' ' });
            assert.equal((await respuesta.json()).titulo, nombre);
            respuesta = await json(b.base, '/api/pistas/' + automatica._id, 'PUT', { titulo: 'Nombre personalizado' });
            assert.equal((await respuesta.json()).titulo, 'Nombre personalizado');
            respuesta = await fetch(b.base + '/api/pistas/' + automatica._id, { method: 'PUT', body: formulario({}, audio, 'Reemplazo.wav') });
            assert.equal((await respuesta.json()).titulo, 'Nombre personalizado');
            respuesta = await fetch(b.base + '/api/pistas/' + automatica._id, { method: 'PUT', body: formulario({ titulo: '' }, audio, 'Otra versión.wav') });
            const reemplazada = await respuesta.json();
            assert.equal(reemplazada.titulo, 'Otra versión.wav');
            assert.equal(reemplazada.nombreAudio, 'Otra versión.wav');
            assert.equal(await (await fetch(b.base + reemplazada.archivoAudio)).text(), audio.toString());
            await cerrar(b.server);
            b = await abrir(dispositivoB);
            const persistida = (await (await fetch(b.base + '/api/pistas')).json()).find(item => item._id === automatica._id);
            assert.equal(persistida.titulo, 'Otra versión.wav');
            assert.equal(persistida.nombreAudio, 'Otra versión.wav');
            await fetch(b.base + '/api/pistas/' + automatica._id, { method: 'DELETE' });
        }
        assert.equal(fs.readdirSync(path.join(dispositivoB, 'uploads')).length, 0);
        console.log('OK título opcional: nombre original con espacios y acentos, sin audio, edición, reemplazo y título personalizado');
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        await Promise.all([...servidores].map(cerrar));
    }
})();
