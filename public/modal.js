// Diálogo compartido de AppStudio. El elemento nativo aporta el foco modal y el fondo inerte.
class StudioModal {
    static instancias = new WeakMap();
    constructor(elemento) {
        this.elemento = elemento;
        StudioModal.instancias.set(elemento, this);
        elemento.addEventListener('cancel', evento => {
            evento.preventDefault();
            this.hide();
        });
        elemento.addEventListener('close', () => {
            elemento.classList.remove('show');
            elemento.dispatchEvent(new Event('hidden.studio.modal'));
        });
        elemento.addEventListener('click', evento => {
            if (evento.target !== elemento) return;
            const rect = elemento.getBoundingClientRect();
            if (evento.clientX < rect.left || evento.clientX > rect.right || evento.clientY < rect.top || evento.clientY > rect.bottom) this.hide();
        });
    }
    static getInstance(elemento) { return StudioModal.instancias.get(elemento); }
    show() {
        if (this.elemento.open) return;
        this.elemento.showModal();
        this.elemento.classList.add('show');
        this.elemento.dispatchEvent(new Event('shown.studio.modal'));
    }
    hide() {
        if (!this.elemento.open) return;
        const evento = new Event('hide.studio.modal', { cancelable: true });
        if (this.elemento.dispatchEvent(evento)) this.elemento.close();
    }
}
