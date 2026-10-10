function inyectarCSS() {
    if (document.getElementById('css-ciencias')) return;

    const link = document.createElement('link');
    link.id = 'css-ciencias';
    link.rel = 'stylesheet';
    link.href = './secciones/ciencias/ciencias.css';
    document.head.appendChild(link);
    console.log('🎨 CSS de Ciencias cargado correctamente.');
}


export async function cargarCiencia() {
    try {
        
        inyectarCSS();

       
        const response = await fetch('./secciones/ciencias/ciencias.html');
        if (!response.ok) throw new Error('Error al cargar ciencias.html');
        const html = await response.text();
        return html;
    } catch (error) {
        console.error('Error cargando la sección de Ciencias:', error);
        return '<p>Error al cargar la sección de Ciencias.</p>';
    }
}


export function inicializarCiencia() {
    console.log('✅ Sección de Ciencias inicializada correctamente.');

    
    const tarjetas = document.querySelectorAll('.noticia-card');
    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
            const titulo = tarjeta.querySelector('h3')?.textContent || '';
            console.log('Noticia seleccionada:', titulo);
        });
    });
}


export function notificarNuevaNoticia(titulo) {
    if (Notification.permission === 'granted') {
        new Notification('🔬 Nueva noticia de Ciencia', {
            body: titulo,
            icon: './icons/icon-192x192.png'
        });
    }
}