// Un único control de sugerencias compartido por los formularios de crear y editar.
const claveGenero = nombre => String(nombre || '').normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('es');
class SugerenciasGenero {
    constructor(input, lista) {
        this.input = input;
        this.lista = lista;
        this.generos = [];
        this.activo = -1;
        input.addEventListener('focus', () => this.abrir(true));
        input.addEventListener('click', () => { if (lista.hidden) this.abrir(true); });
        input.addEventListener('input', event => { if (!event.isComposing) this.abrir(); });
        input.addEventListener('compositionend', () => this.abrir());
        input.addEventListener('keydown', event => this.tecla(event));
        input.addEventListener('blur', () => this.cerrar());
        lista.addEventListener('pointerdown', event => {
            const opcion = event.target.closest('[role="option"]');
            if (!opcion) return;
            event.preventDefault();
            this.elegir(Number(opcion.dataset.indice));
        });
    }
    actualizar(generos) { this.generos = generos; }
    abrir(todos = false) {
        const consulta = todos ? '' : claveGenero(this.input.value);
        this.opciones = this.generos.filter(nombre => claveGenero(nombre).includes(consulta));
        this.activo = -1;
        this.input.removeAttribute('aria-activedescendant');
        this.lista.replaceChildren();
        for (const [indice, nombre] of this.opciones.entries()) {
            const item = document.createElement('li');
            item.id = `genero-opcion-${indice}`;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', 'false');
            item.dataset.indice = indice;
            item.textContent = nombre;
            this.lista.appendChild(item);
        }
        this.lista.hidden = !this.opciones.length;
        this.input.setAttribute('aria-expanded', String(!this.lista.hidden));
        document.getElementById('ayuda-genero').textContent = consulta && !this.generos.some(nombre => claveGenero(nombre) === consulta)
            ? 'Este género se añadirá a tu biblioteca al guardar la pista.'
            : 'Escribe un género nuevo o elige uno de tu biblioteca.';
    }
    cerrar() {
        this.lista.hidden = true;
        this.input.setAttribute('aria-expanded', 'false');
        this.input.removeAttribute('aria-activedescendant');
        this.activo = -1;
    }
    elegir(indice) {
        if (!this.opciones[indice]) return;
        this.input.value = this.opciones[indice];
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
        this.cerrar();
    }
    tecla(event) {
        if (event.isComposing || event.keyCode === 229) return;
        if (event.key === 'Escape' && !this.lista.hidden) {
            event.preventDefault();
            event.stopPropagation();
            this.cerrar();
        } else if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            if (this.lista.hidden) this.abrir(true);
            const cantidad = this.opciones.length;
            if (!cantidad) return;
            this.activo = this.activo < 0
                ? (event.key === 'ArrowDown' ? 0 : cantidad - 1)
                : (this.activo + (event.key === 'ArrowDown' ? 1 : -1) + cantidad) % cantidad;
            for (const [indice, item] of Array.from(this.lista.children).entries()) item.setAttribute('aria-selected', String(indice === this.activo));
            const item = this.lista.children[this.activo];
            this.input.setAttribute('aria-activedescendant', item.id);
            item.scrollIntoView({ block: 'nearest' });
        } else if (event.key === 'Enter' && !this.lista.hidden && this.activo >= 0) {
            event.preventDefault();
            this.elegir(this.activo);
        } else if (event.key === 'Tab') this.cerrar();
    }
}
