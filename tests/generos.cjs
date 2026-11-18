const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { abrirBiblioteca } = require('../storage');
fs.mkdirSync(path.join(__dirname, '../.tmp-ui'), { recursive: true });
const raiz = fs.mkdtempSync(path.join(__dirname, '../.tmp-ui/generos-'));
const db = new DatabaseSync(path.join(raiz, 'pistas.sqlite'));
db.exec(`CREATE TABLE pistas (_id TEXT PRIMARY KEY, titulo TEXT, artista TEXT, genero TEXT, fase TEXT, calificacion INTEGER, comentario TEXT, archivoAudio TEXT);
    INSERT INTO pistas VALUES ('anterior', 'Sesión anterior', 'Artista', '  Rock  ', 'Mezcla', 4, '', '/uploads/anterior.wav');`);
db.close();
let biblioteca;
try {
    biblioteca = abrirBiblioteca(raiz);
    assert.deepEqual(biblioteca.listarGeneros(), ['Rock']);
    assert.equal(biblioteca.obtener('anterior').genero, '  Rock  ');
    assert.equal(biblioteca.obtener('anterior').archivoAudio, '/uploads/anterior.wav');
    const datos = { titulo: 'Nueva pista', artista: 'Artista', genero: 'rOcK', calificacion: 3 };
    const pista = biblioteca.crear(datos);
    assert.equal(pista.genero, 'Rock');
    biblioteca.actualizar(pista._id, { genero: '  Lo-Fi   House  ' });
    assert.deepEqual(biblioteca.listarGeneros(), ['Lo-Fi House', 'Rock']);
    assert.throws(() => biblioteca.crear({ ...datos, genero: 'No guardar', titulo: ' ' }));
    assert.deepEqual(biblioteca.listarGeneros(), ['Lo-Fi House', 'Rock']);
    const unicode = biblioteca.crear({ ...datos, genero: 'Electro\u0301nica' });
    assert.equal(unicode.genero, 'Electrónica');
    assert.equal(biblioteca.crear({ ...datos, genero: 'ELECTRÓNICA' }).genero, 'Electrónica');
    biblioteca.eliminar(pista._id);
    biblioteca.cerrar();
    biblioteca = abrirBiblioteca(raiz);
    assert.deepEqual(biblioteca.listarGeneros(), ['Electrónica', 'Lo-Fi House', 'Rock']);
    const otra = abrirBiblioteca(path.join(raiz, 'otra-biblioteca'));
    try { assert.deepEqual(otra.listarGeneros(), []); } finally { otra.cerrar(); }
    console.log('OK géneros: importación sin alterar pistas, normalización, validación, edición, persistencia e independencia entre bibliotecas');
} finally { biblioteca?.cerrar(); }
