// =====================================================
// SECCIÓN ECONOMÍA - LÓGICA
// =====================================================

console.log('💰 Sección Economía cargada correctamente');

/* -----------------------------------------------------
   1. ANIMACIÓN DE ENTRADA
----------------------------------------------------- */
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

document.querySelectorAll('.news-card, .analisis-item, .indicador-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

/* -----------------------------------------------------
   2. BUSCADOR DE NOTICIAS
----------------------------------------------------- */
const buscador = document.getElementById('buscador');
const newsCards = document.querySelectorAll('.news-card');
const noResults = document.getElementById('noResultsEco');

if (buscador) {
    buscador.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let visibles = 0;

        newsCards.forEach(card => {
            const titulo = card.getAttribute('data-titulo') || '';
            const textoCompleto = card.textContent.toLowerCase();
            const coincide = titulo.includes(query) || textoCompleto.includes(query);

            if (query === '' || coincide) {
                card.style.display = '';
                visibles++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noResults) {
            noResults.style.display = visibles === 0 ? 'block' : 'none';
        }
    });
}

/* -----------------------------------------------------
   3. GRÁFICAS SVG (mini-sparklines)
----------------------------------------------------- */
function crearSparkline(containerId, data, color = '#7b1e26') {
    const cont = document.getElementById(containerId);
    if (!cont) return;

    const width = 200;
    const height = 60;
    const padding = 4;

    const max = Math.max(...data);
    const min = Math.min(...data);
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
        </svg>
    `;
}

crearSparkline('chart-pib',       [1.0, 1.2, 1.5, 1.4, 1.6, 1.7, 1.8], '#7b1e26');
crearSparkline('chart-inflacion', [6.5, 5.8, 5.2, 4.9, 4.7, 4.6, 4.5], '#7b1e26');
crearSparkline('chart-dolar',     [19.2, 18.9, 18.5, 18.2, 18.0, 17.9, 17.85], '#7b1e26');
crearSparkline('chart-tasa',      [11.25, 11.0, 10.75, 10.5, 10.25, 10.25, 10.25], '#7b1e26');

/* -----------------------------------------------------
   4. NAVEGACIÓN SUAVE
----------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});