const FASES = ['Composición', 'Grabación', 'Mezcla', 'Masterización', 'Finalizado'];
class ErrorValidacion extends Error {
    constructor(message) { super(message); this.status = 400; }
}
function validarPista(datos = {}, anterior = {}, nombreAudio) {
    const pista = {};
    pista.nombreAudio = nombreAudio ?? anterior.nombreAudio ?? null;
    const titulo = datos.titulo ?? anterior.titulo ?? '';
    if (typeof titulo !== 'string') throw new ErrorValidacion('El título debe ser texto.');
    pista.titulo = titulo.trim() || pista.nombreAudio || anterior.titulo || 'Sin título';
    for (const [campo, etiqueta] of [['artista', 'artista'], ['genero', 'género']]) {
        const valor = datos[campo] ?? anterior[campo];
        if (typeof valor !== 'string' || !valor.trim()) throw new ErrorValidacion(`El ${etiqueta} es obligatorio.`);
        pista[campo] = valor.trim();
    }
    pista.fase = datos.fase ?? anterior.fase ?? 'Composición';
    if (!FASES.includes(pista.fase)) throw new ErrorValidacion('Selecciona una fase válida.');
    const calificacion = datos.calificacion ?? anterior.calificacion;
    if (!['string', 'number'].includes(typeof calificacion) || !String(calificacion).trim()) throw new ErrorValidacion('La calificación es obligatoria.');
    pista.calificacion = Number(calificacion);
    if (!Number.isInteger(pista.calificacion) || pista.calificacion < 1 || pista.calificacion > 5) throw new ErrorValidacion('La calificación debe ser un número entero entre 1 y 5.');
    const comentario = datos.comentario ?? anterior.comentario ?? '';
    if (typeof comentario !== 'string') throw new ErrorValidacion('El comentario debe ser texto.');
    pista.comentario = comentario.trim();
    pista.archivoAudio = anterior.archivoAudio ?? null;
    return pista;
}
module.exports = { validarPista, ErrorValidacion };
