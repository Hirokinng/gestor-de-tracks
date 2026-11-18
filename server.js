const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const express = require('express');
const multer = require('multer');
const { abrirBiblioteca, directorioDatos } = require('./storage');

function crearApp({ dataDir = directorioDatos() } = {}) {
    const biblioteca = abrirBiblioteca(dataDir);
    const app = express();
    app.locals.biblioteca = biblioteca;
    const upload = multer({ storage: multer.diskStorage({
        destination: biblioteca.uploadsDir,
        filename: (_req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, randomUUID() + (/^\.[a-z0-9]{1,10}$/.test(extension) ? extension : ''));
        }
    }) });
    function quitarArchivo(ruta) {
        if (!ruta || !ruta.startsWith('/uploads/')) return;
        const nombre = ruta.slice('/uploads/'.length);
        if (!nombre || path.basename(nombre) !== nombre) return;
        try { fs.unlinkSync(path.join(biblioteca.uploadsDir, nombre)); }
        catch (error) { if (error.code !== 'ENOENT') console.error('No se pudo limpiar un audio de la biblioteca:', error.message); }
    }
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    // Nunca se sirven los audios del proyecto ni los de otro dispositivo.
    app.use('/uploads', express.static(biblioteca.uploadsDir, { fallthrough: false }));
    app.get('/estudio.html', (_req, res) => res.redirect(302, '/'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('/api/pistas', (req, res, next) => {
        try { res.json(biblioteca.listar(typeof req.query.fase === 'string' ? req.query.fase : undefined)); }
        catch (error) { next(error); }
    });
    app.post('/api/pistas', upload.single('archivoAudio'), (req, res, next) => {
        const ruta = req.file ? '/uploads/' + req.file.filename : null;
        try { res.status(201).json(biblioteca.crear(req.body, ruta)); }
        catch (error) { quitarArchivo(ruta); next(error); }
    });
    app.put('/api/pistas/:id', upload.single('archivoAudio'), (req, res, next) => {
        const ruta = req.file ? '/uploads/' + req.file.filename : undefined;
        try {
            const anterior = biblioteca.obtener(req.params.id);
            const pista = biblioteca.actualizar(req.params.id, req.body, ruta);
            if (!pista) {
                quitarArchivo(ruta);
                return res.status(404).json({ error: 'La pista ya no existe. Actualiza el catálogo.' });
            }
            if (ruta && anterior.archivoAudio !== ruta) quitarArchivo(anterior.archivoAudio);
            res.json(pista);
        } catch (error) { quitarArchivo(ruta); next(error); }
    });
    app.delete('/api/pistas/:id', (req, res, next) => {
        try {
            const pista = biblioteca.eliminar(req.params.id);
            if (!pista) return res.status(404).json({ error: 'La pista ya no existe. Actualiza el catálogo.' });
            quitarArchivo(pista.archivoAudio);
            res.json({ mensaje: 'Pista eliminada del sistema' });
        } catch (error) { next(error); }
    });
    app.use((error, _req, res, _next) => {
        const status = error instanceof multer.MulterError ? 400 : error.status || 500;
        if (status >= 500) console.error('Error en la biblioteca local:', error.message);
        res.status(status).json({ error: status >= 500 ? 'No se pudo guardar o leer la biblioteca local. Revisa el espacio y los permisos de la carpeta de datos.' : error.message });
    });
    return app;
}
function iniciarServidor({ port = 0, ...opciones } = {}) {
    const app = crearApp(opciones);
    const server = app.listen(port, '127.0.0.1');
    server.once('close', () => app.locals.biblioteca.cerrar());
    server.once('error', () => app.locals.biblioteca.cerrar());
    return server;
}
if (require.main === module) {
    const server = iniciarServidor({ port: Number(process.env.PORT || 3000) });
    server.once('listening', () => console.log(`AppStudio local: http://127.0.0.1:${server.address().port}`));
    server.once('error', error => { console.error('No se pudo iniciar AppStudio:', error.message); process.exitCode = 1; });
}
module.exports = { crearApp, iniciarServidor };
