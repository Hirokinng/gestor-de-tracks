// Controles locales sobre HTMLAudioElement; conserva soporte nativo de formatos y rangos HTTP.
function crearReproductor(pista) {
    const panel = document.createElement('div');
    panel.className = 'reproductor';
    panel.innerHTML = `
        <audio preload="none"></audio>
        <div class="reproductor-principal">
            <button type="button" class="reproductor-play" aria-pressed="false"><span aria-hidden="true">▶</span></button>
            <div class="reproductor-linea">
                <input class="reproductor-progreso" type="range" min="0" max="100" value="0" step="0.1" disabled>
                <div class="reproductor-tiempos"><span class="tiempo-actual">0:00</span><span class="tiempo-total">—:—</span></div>
            </div>
        </div>
        <div class="reproductor-volumen">
            <button type="button" class="reproductor-silencio" aria-pressed="false">Silenciar</button>
            <input class="volumen" type="range" min="0" max="1" value="1" step="0.05">
        </div>
        <p class="reproductor-error" role="status" hidden></p>`;
    const audio = panel.querySelector('audio');
    audio.src = pista.archivoAudio;
    audio.setAttribute('aria-label', `Audio de ${pista.titulo}`);
    const play = panel.querySelector('.reproductor-play');
    const progreso = panel.querySelector('.reproductor-progreso');
    const volumen = panel.querySelector('.volumen');
    const silencio = panel.querySelector('.reproductor-silencio');
    const error = panel.querySelector('.reproductor-error');
    progreso.setAttribute('aria-label', `Posición del audio de ${pista.titulo}`);
    volumen.setAttribute('aria-label', `Volumen de ${pista.titulo}`);
    const tiempo = segundos => Number.isFinite(segundos) ? `${Math.floor(segundos / 60)}:${String(Math.floor(segundos % 60)).padStart(2, '0')}` : '—:—';
    function sincronizar() {
        const reproduciendo = !audio.paused && !audio.ended;
        play.setAttribute('aria-label', `${reproduciendo ? 'Pausar' : 'Reproducir'} ${pista.titulo}`);
        play.title = reproduciendo ? 'Pausar' : 'Reproducir';
        play.setAttribute('aria-pressed', String(reproduciendo));
        play.firstElementChild.textContent = reproduciendo ? 'Ⅱ' : '▶';
        panel.classList.toggle('reproduciendo', reproduciendo);
        progreso.disabled = !(Number.isFinite(audio.duration) && audio.duration > 0);
        progreso.value = progreso.disabled ? 0 : audio.currentTime / audio.duration * 100;
        progreso.setAttribute('aria-valuetext', `${tiempo(audio.currentTime)} de ${tiempo(audio.duration)}`);
        panel.querySelector('.tiempo-actual').textContent = tiempo(audio.currentTime);
        panel.querySelector('.tiempo-total').textContent = tiempo(audio.duration);
        silencio.textContent = audio.muted ? 'Activar sonido' : 'Silenciar';
        silencio.setAttribute('aria-pressed', String(audio.muted));
    }
    function mostrarError() {
        error.hidden = false;
        error.textContent = 'No se pudo reproducir el audio. Comprueba el archivo o reemplázalo al editar la pista.';
        sincronizar();
    }
    play.addEventListener('click', async () => {
        if (!audio.paused) return audio.pause();
        error.hidden = true;
        if (audio.error) audio.load();
        try { await audio.play(); } catch (fallo) { if (fallo.name !== 'AbortError') mostrarError(); }
    });
    audio.addEventListener('play', () => {
        document.querySelectorAll('audio').forEach(otro => { if (otro !== audio) otro.pause(); });
        sincronizar();
    });
    for (const evento of ['pause', 'ended', 'timeupdate', 'loadedmetadata', 'durationchange', 'volumechange']) audio.addEventListener(evento, sincronizar);
    audio.addEventListener('error', mostrarError);
    progreso.addEventListener('input', () => {
        if (Number.isFinite(audio.duration)) audio.currentTime = Number(progreso.value) / 100 * audio.duration;
        sincronizar();
    });
    volumen.addEventListener('input', () => { audio.volume = Number(volumen.value); audio.muted = false; });
    silencio.addEventListener('click', () => { audio.muted = !audio.muted; });
    sincronizar();
    return panel;
}
