// =====================================================
// SECCIÓN COMERCIO - LÓGICA
// =====================================================

console.log('🌎 Sección Comercio cargada correctamente');

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
const noResults = document.getElementById('noResultsCom');

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

crearSparkline('chart-export', [45, 47, 49, 51, 53, 54, 55], '#7b1e26');
crearSparkline('chart-import', [43, 45, 47, 48, 50, 51, 52], '#7b1e26');
crearSparkline('chart-tlc',    [12, 12, 13, 13, 14, 14, 14], '#7b1e26');
crearSparkline('chart-socio',  [78, 78, 79, 79, 80, 80, 80], '#7b1e26');