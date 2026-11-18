const campos = ['titulo', 'artista', 'genero', 'fase', 'calificacion'];
let pistasGlobales = [];
let idEdicion = null;
let idEliminar = null;
let guardando = false;
let eliminando = false;
let cargaActual = 0;
const form = document.getElementById('formularioPista');
const contenedorPistas = document.getElementById('contenedorPistas');
const inputBusqueda = document.getElementById('inputBusqueda');
const estado = document.getElementById('estadoPistas');
const modalFormulario = new StudioModal(document.getElementById('modalFormulario'));
const modalEliminar = new StudioModal(document.getElementById('modalEliminar'));
const modalDetalle = new StudioModal(document.getElementById('modalDetalle'));

function mensaje(id, texto = '') {
    const elemento = document.getElementById(id);
    elemento.textContent = texto;
    elemento.classList.toggle('d-none', !texto);
}

async function solicitar(url, opciones) {
    const respuesta = await fetch(url, opciones);
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) throw new Error(datos?.error || 'El servidor no pudo completar la operación. Inténtalo de nuevo.');
    return datos;
}

async function obtenerPistas() {
    const carga = ++cargaActual;
    estado.textContent = 'Cargando pistas…';
    contenedorPistas.setAttribute('aria-busy', 'true');
    document.getElementById('btnReintentar').hidden = true;
    try {
        const pistas = await solicitar('/api/pistas');
        if (carga !== cargaActual) return;
        if (!Array.isArray(pistas)) throw new Error('La respuesta del servidor no contiene una lista de pistas.');
        pistasGlobales = pistas;
        filtrarPistas();
    } catch (error) {
        if (carga !== cargaActual) return;
        estado.textContent = 'No se pudieron cargar las pistas. Revisa la conexión y pulsa Reintentar.';
        document.getElementById('btnReintentar').hidden = false;
        document.getElementById('mensajeVacio')?.remove();
    } finally {
        if (carga === cargaActual) contenedorPistas.setAttribute('aria-busy', 'false');
    }
}

function estrellas(valor) {
    return '⭐'.repeat(Math.max(0, Math.min(5, Math.floor(Number(valor) || 0))));
}

function renderizarPistas(pistas) {
    document.getElementById('totalPistas').textContent = pistasGlobales.length;
    contenedorPistas.replaceChildren();
    if (!pistas.length) {
        const vacio = document.createElement('p');
        vacio.className = 'col-12 text-center text-muted mt-5';
        vacio.textContent = inputBusqueda.value.trim()
            ? 'No hay pistas que coincidan con la búsqueda.'
            : 'El rack está vacío. Inicia una nueva sesión para comenzar.';
        contenedorPistas.appendChild(vacio);
        return;
    }
    for (const pista of pistas) {
        const columna = document.createElement('div');
        columna.className = 'col-md-6 col-lg-4 mb-4';
        columna.dataset.pista = pista._id;
        // Solo se inserta estructura fija; el contenido de las pistas se asigna como texto.
        columna.innerHTML = `
            <article class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h5 class="card-title text-white mb-0 text-break"></h5>
                        <span class="badge badge-fase"></span>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted text-break"></h6>
                    <p class="mb-2 small text-info">Género: <span class="genero text-white"></span></p>
                    <div class="audio"></div>
                    <p class="calificacion card-text mb-1 mt-3"></p>
                    <p class="comentario text-muted small text-truncate mt-2"></p>
                </div>
                <div class="card-footer bg-transparent border-top border-secondary d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-sm btn-outline-light" onclick="verDetalle(this.closest('[data-pista]').dataset.pista)">Ver detalles</button>
                    <button type="button" class="btn btn-sm btn-outline-light" onclick="abrirModalEdicion(this.closest('[data-pista]').dataset.pista)">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger ms-auto" onclick="prepararEliminar(this.closest('[data-pista]').dataset.pista)">Eliminar</button>
                </div>
            </article>`;
        for (const [selector, texto] of [
            ['.card-title', pista.titulo], ['.badge', pista.fase], ['.card-subtitle', pista.artista],
            ['.genero', pista.genero || 'Sin género'], ['.calificacion', `Calificación: ${estrellas(pista.calificacion)}`],
            ['.comentario', pista.comentario || '']
        ]) columna.querySelector(selector).textContent = texto;
        if (typeof pista.archivoAudio === 'string' && pista.archivoAudio.startsWith('/uploads/')) {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.preload = 'none';
            audio.className = 'w-100 mt-2 mb-2';
            audio.src = pista.archivoAudio;
            audio.setAttribute('aria-label', `Audio de ${pista.titulo}`);
            columna.querySelector('.audio').appendChild(audio);
        }
        contenedorPistas.appendChild(columna);
    }
}

function filtrarPistas() {
    const texto = inputBusqueda.value.trim().toLocaleLowerCase('es');
    const pistas = pistasGlobales.filter(pista =>
        [pista.titulo, pista.artista].some(valor => String(valor || '').toLocaleLowerCase('es').includes(texto)));
    document.getElementById('btnLimpiarBusqueda').hidden = !inputBusqueda.value;
    renderizarPistas(pistas);
    estado.textContent = `${pistas.length} de ${pistasGlobales.length} pistas`;
}
function limpiarBusqueda() {
    inputBusqueda.value = '';
    filtrarPistas();
    inputBusqueda.focus();
}
inputBusqueda.addEventListener('input', filtrarPistas);

function limpiarErrores() {
    mensaje('errorFormulario');
    for (const id of [...campos, 'archivoAudio']) {
        const campo = document.getElementById(id);
        campo.classList.remove('is-invalid');
        campo.removeAttribute('aria-invalid');
        document.getElementById(`error-${id}`).textContent = '';
    }
}
function validarFormulario() {
    limpiarErrores();
    let primero;
    for (const id of campos) {
        const campo = document.getElementById(id);
        let error = '';
        if (!campo.value.trim()) error = 'Completa este campo.';
        else if (id === 'fase' && !Array.from(campo.options).some(opcion => opcion.value === campo.value)) error = 'Selecciona una fase válida.';
        else if (id === 'calificacion' && (!Number.isInteger(Number(campo.value)) || Number(campo.value) < 1 || Number(campo.value) > 5)) error = 'Introduce un número entero entre 1 y 5.';
        if (error) {
            campo.classList.add('is-invalid');
            campo.setAttribute('aria-invalid', 'true');
            document.getElementById(`error-${id}`).textContent = error;
            primero ||= campo;
        }
    }
    primero?.focus();
    return !primero;
}
for (const id of campos) document.getElementById(id).addEventListener('input', () => {
    const campo = document.getElementById(id);
    campo.classList.remove('is-invalid');
    campo.removeAttribute('aria-invalid');
    document.getElementById(`error-${id}`).textContent = '';
});
document.getElementById('comentario').addEventListener('input', (event) => {
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.max(110, event.target.scrollHeight)}px`;
});

let origenModal;
function abrirModal(modal) {
    origenModal = document.activeElement;
    modal.show();
}
function cerrarModal(boton) {
    StudioModal.getInstance(boton.closest('.modal')).hide();
}
for (const id of ['modalFormulario', 'modalEliminar', 'modalDetalle']) {
    const elemento = document.getElementById(id);
    elemento.addEventListener('hide.studio.modal', (event) => {
        if ((id === 'modalFormulario' && guardando) || (id === 'modalEliminar' && eliminando)) event.preventDefault();
    });
    elemento.addEventListener('hidden.studio.modal', () => {
        if (origenModal?.isConnected) origenModal.focus();
        else document.getElementById('btnNuevaPista').focus();
    });
    elemento.addEventListener('shown.studio.modal', () => {
        if (id === 'modalFormulario') document.getElementById('titulo').focus();
        if (id === 'modalEliminar') elemento.querySelector('.btn-secondary').focus();
    });
}
function nuevaPista() {
    idEdicion = null;
    form.reset();
    limpiarErrores();
    document.getElementById('comentario').style.height = '';
    document.getElementById('modalTitulo').textContent = 'Nueva Pista';
    abrirModal(modalFormulario);
}
function abrirModalEdicion(id) {
    const pista = pistasGlobales.find(p => p._id === id);
    if (!pista) return;
    idEdicion = id;
    form.reset(); // También limpia el archivo de una sesión anterior.
    limpiarErrores();
    for (const campo of [...campos, 'comentario']) document.getElementById(campo).value = pista[campo] ?? '';
    document.getElementById('comentario').style.height = '';
    document.getElementById('modalTitulo').textContent = 'Editar Pista';
    abrirModal(modalFormulario);
}
function bloquearFormulario(ocupado) {
    guardando = ocupado;
    form.setAttribute('aria-busy', String(ocupado));
    document.querySelectorAll('#modalFormulario input, #modalFormulario select, #modalFormulario textarea, #modalFormulario button').forEach(control => { control.disabled = ocupado; });
    document.getElementById('btnGuardar').textContent = ocupado ? 'Guardando…' : 'Guardar';
}
form.addEventListener('submit', async event => {
    event.preventDefault();
    if (guardando || !validarFormulario()) return;
    const datos = new FormData();
    for (const campo of [...campos, 'comentario']) datos.append(campo, document.getElementById(campo).value.trim());
    const archivo = document.getElementById('archivoAudio').files[0];
    if (archivo) datos.append('archivoAudio', archivo);
    bloquearFormulario(true);
    let guardado = false;
    try {
        await solicitar(idEdicion ? `/api/pistas/${encodeURIComponent(idEdicion)}` : '/api/pistas', { method: idEdicion ? 'PUT' : 'POST', body: datos });
        guardado = true;
    } catch (error) {
        mensaje('errorFormulario', `No se pudo guardar. ${error.message === 'Failed to fetch' ? 'Revisa la conexión e inténtalo de nuevo.' : error.message}`);
        document.getElementById('errorFormulario').focus();
    } finally {
        bloquearFormulario(false);
    }
    if (guardado) {
        modalFormulario.hide();
        await obtenerPistas();
    }
});
function prepararEliminar(id) {
    const pista = pistasGlobales.find(p => p._id === id);
    if (!pista) return;
    idEliminar = id;
    mensaje('errorEliminar');
    document.getElementById('nombreEliminar').textContent = pista.titulo;
    abrirModal(modalEliminar);
}
async function confirmarEliminar() {
    if (!idEliminar || eliminando) return;
    eliminando = true;
    const botones = document.querySelectorAll('#modalEliminar button');
    botones.forEach(boton => { boton.disabled = true; });
    const boton = document.getElementById('btnConfirmarEliminar');
    boton.textContent = 'Eliminando…';
    mensaje('errorEliminar');
    let eliminado = false;
    try {
        await solicitar(`/api/pistas/${encodeURIComponent(idEliminar)}`, { method: 'DELETE' });
        eliminado = true;
    } catch (error) {
        mensaje('errorEliminar', 'No se pudo eliminar la pista. Revisa la conexión e inténtalo de nuevo.');
    } finally {
        eliminando = false;
        botones.forEach(control => { control.disabled = false; });
        boton.textContent = 'Sí, eliminar';
    }
    if (eliminado) {
        modalEliminar.hide();
        idEliminar = null;
        await obtenerPistas();
    }
}
function verDetalle(id) {
    const pista = pistasGlobales.find(p => p._id === id);
    if (!pista) return;
    for (const [campo, valor] of Object.entries({
        detalleTitulo: pista.titulo, detalleArtista: pista.artista, detalleGenero: pista.genero || 'Sin género',
        detalleFase: pista.fase, detalleCalificacion: estrellas(pista.calificacion), detalleComentario: pista.comentario || 'Sin comentario.'
    })) document.getElementById(campo).textContent = valor;
    abrirModal(modalDetalle);
}
document.addEventListener('DOMContentLoaded', obtenerPistas);
