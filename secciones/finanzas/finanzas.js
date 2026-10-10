// =====================================================
// SECCIÓN FINANZAS - LÓGICA
// =====================================================

console.log('🏦 Sección Finanzas cargada correctamente');

/* Animación de entrada */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, i * 80);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.news-card, .analisis-item, .indicador-card').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

/* Buscador */
const buscador = document.getElementById('buscador');
const newsCards = document.querySelectorAll('.news-card');
const noResults = document.getElementById('noResultsFin');

if (buscador) {
    buscador.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let visibles = 0;
        newsCards.forEach(card => {
            const titulo = card.getAttribute('data-titulo') || '';
            const coincide = titulo.includes(query) || card.textContent.toLowerCase().includes(query);
            if (query === '' || coincide) {
                card.style.display = '';
                visibles++;
            } else {
                card.style.display = 'none';
            }
        });
        if (noResults) noResults.style.display = visibles === 0 ? 'block' : 'none';
    });
}

/* Gráficas sparkline */
function crearSparkline(containerId, data, color = '#7b1e26') {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    const width = 200, height = 60, padding = 4;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((val, i) => {
        const x = padding + (i * (width - padding * 2)) / (data.length - 1);
        const y = height - padding - ((val - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');
    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;
    cont.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="grad-${containerId}" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <polygon points="${areaPoints}" fill="url(#grad-${containerId})"/>
            <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="${width - padding}" cy="${height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}" r="3" fill="${color}"/>
        </svg>`;
}

crearSparkline('chart-cetes',   [11.0, 10.75, 10.5, 10.25, 10.0, 10.0, 10.0], '#7b1e26');
crearSparkline('chart-ipc',     [49800, 50100, 50500, 51200, 51800, 52100, 52340], '#7b1e26');
crearSparkline('chart-tarjeta', [42, 41, 40, 39.5, 39, 38.5, 38], '#7b1e26');
crearSparkline('chart-fintech', [18, 19, 20, 21, 22, 23.5, 25], '#7b1e26');