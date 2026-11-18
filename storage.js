const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { validarPista } = require('./models/Pista');

function directorioDatos() {
    if (process.env.ESTUDIO_HIRO_DATA_DIR) return path.resolve(process.env.ESTUDIO_HIRO_DATA_DIR);
    if (process.platform === 'win32') return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'EstudioHiro');
    return path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'), 'EstudioHiro');
}
function abrirBiblioteca(dataDir = directorioDatos()) {
    fs.mkdirSync(path.join(dataDir, 'uploads'), { recursive: true });
    const db = new DatabaseSync(path.join(dataDir, 'pistas.sqlite'));
    let cerrada = false;
    db.exec(`PRAGMA busy_timeout = 5000;
        PRAGMA journal_mode = DELETE;
        PRAGMA synchronous = FULL;
        CREATE TABLE IF NOT EXISTS pistas (
            _id TEXT PRIMARY KEY, titulo TEXT NOT NULL, artista TEXT NOT NULL,
            genero TEXT NOT NULL,
            fase TEXT NOT NULL CHECK (fase IN ('Composición', 'Grabación', 'Mezcla', 'Masterización', 'Finalizado')),
            calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
            comentario TEXT NOT NULL DEFAULT '', archivoAudio TEXT
        );`);
    const porId = db.prepare('SELECT * FROM pistas WHERE _id = ?');
    const insertar = db.prepare('INSERT INTO pistas (_id, titulo, artista, genero, fase, calificacion, comentario, archivoAudio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const actualizar = db.prepare('UPDATE pistas SET titulo = ?, artista = ?, genero = ?, fase = ?, calificacion = ?, comentario = ?, archivoAudio = ? WHERE _id = ?');
    return {
        dataDir,
        uploadsDir: path.join(dataDir, 'uploads'),
        listar(fase) {
            return fase ? db.prepare('SELECT * FROM pistas WHERE fase = ? ORDER BY rowid DESC').all(fase)
                : db.prepare('SELECT * FROM pistas ORDER BY rowid DESC').all();
        },
        obtener(id) { return porId.get(id); },
        crear(datos, archivoAudio = null) {
            const pista = validarPista(datos);
            pista._id = randomUUID();
            pista.archivoAudio = archivoAudio;
            insertar.run(pista._id, pista.titulo, pista.artista, pista.genero, pista.fase, pista.calificacion, pista.comentario, pista.archivoAudio);
            return porId.get(pista._id);
        },
        actualizar(id, datos, archivoAudio) {
            const anterior = porId.get(id);
            if (!anterior) return null;
            const pista = validarPista(datos, anterior);
            if (archivoAudio !== undefined) pista.archivoAudio = archivoAudio;
            actualizar.run(pista.titulo, pista.artista, pista.genero, pista.fase, pista.calificacion, pista.comentario, pista.archivoAudio, id);
            return porId.get(id);
        },
        eliminar(id) {
            const pista = porId.get(id);
            if (!pista) return null;
            db.prepare('DELETE FROM pistas WHERE _id = ?').run(id);
            return pista;
        },
        cerrar() { if (!cerrada) { db.close(); cerrada = true; } }
    };
}
module.exports = { abrirBiblioteca, directorioDatos };
