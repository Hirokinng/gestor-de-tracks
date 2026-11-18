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
            comentario TEXT NOT NULL DEFAULT '', archivoAudio TEXT, nombreAudio TEXT
        );
        CREATE TABLE IF NOT EXISTS generos (clave TEXT PRIMARY KEY, nombre TEXT NOT NULL);`);
    if (!db.prepare('PRAGMA table_info(pistas)').all().some(columna => columna.name === 'nombreAudio')) {
        db.exec('ALTER TABLE pistas ADD COLUMN nombreAudio TEXT');
    }
    const normalizarGenero = nombre => nombre.normalize('NFC').trim().replace(/\s+/gu, ' ');
    const guardarGenero = db.prepare('INSERT OR IGNORE INTO generos (clave, nombre) VALUES (?, ?)');
    const buscarGenero = db.prepare('SELECT nombre FROM generos WHERE clave = ?');
    function registrarGenero(nombre) {
        nombre = normalizarGenero(nombre);
        const clave = nombre.toLocaleLowerCase('es');
        guardarGenero.run(clave, nombre);
        return buscarGenero.get(clave).nombre;
    }
    // Importa los géneros de bibliotecas previas sin cambiar las pistas ni sus audios.
    db.exec('BEGIN');
    try {
        for (const { genero } of db.prepare('SELECT DISTINCT genero FROM pistas ORDER BY rowid').all()) registrarGenero(genero);
        db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
    function escribirPista(pista, escribir) {
        db.exec('BEGIN');
        try {
            pista.genero = registrarGenero(pista.genero);
            escribir();
            db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
    }
    const porId = db.prepare('SELECT * FROM pistas WHERE _id = ?');
    const insertar = db.prepare('INSERT INTO pistas (_id, titulo, artista, genero, fase, calificacion, comentario, archivoAudio, nombreAudio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const actualizar = db.prepare('UPDATE pistas SET titulo = ?, artista = ?, genero = ?, fase = ?, calificacion = ?, comentario = ?, archivoAudio = ?, nombreAudio = ? WHERE _id = ?');
    return {
        dataDir,
        uploadsDir: path.join(dataDir, 'uploads'),
        listarGeneros() {
            return db.prepare('SELECT nombre FROM generos').all().map(item => item.nombre).sort((a, b) => a.localeCompare(b, 'es'));
        },
        listar(fase) {
            return fase ? db.prepare('SELECT * FROM pistas WHERE fase = ? ORDER BY rowid DESC').all(fase)
                : db.prepare('SELECT * FROM pistas ORDER BY rowid DESC').all();
        },
        obtener(id) { return porId.get(id); },
        crear(datos, archivoAudio = null, nombreAudio) {
            const pista = validarPista(datos, {}, nombreAudio);
            pista._id = randomUUID();
            pista.archivoAudio = archivoAudio;
            escribirPista(pista, () => insertar.run(pista._id, pista.titulo, pista.artista, pista.genero, pista.fase, pista.calificacion, pista.comentario, pista.archivoAudio, pista.nombreAudio));
            return porId.get(pista._id);
        },
        actualizar(id, datos, archivoAudio, nombreAudio) {
            const anterior = porId.get(id);
            if (!anterior) return null;
            const pista = validarPista(datos, anterior, nombreAudio);
            if (archivoAudio !== undefined) pista.archivoAudio = archivoAudio;
            escribirPista(pista, () => actualizar.run(pista.titulo, pista.artista, pista.genero, pista.fase, pista.calificacion, pista.comentario, pista.archivoAudio, pista.nombreAudio, id));
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
