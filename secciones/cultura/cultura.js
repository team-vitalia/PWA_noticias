/* ==========================================
   DATOS DE NOTICIAS CULTURALES
   ========================================== */
const newsData = [
    {
        id: 1,
        title: "El Prado abre una exposición inédita dedicada a las mujeres pintoras del Renacimiento",
        category: "arte",
        author: "Beatriz M. Soria",
        date: "10 Oct, 2026",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
        excerpt: "La pinacoteca reúne más de sesenta lienzos olvidados por los libros de historia, rescatando el legado estético y la técnica magistral de las maestras del siglo XVI.",
        content: `
            <p>El Museo del Prado inaugura este mes una de sus exhibiciones más esperadas: una magna muestra consagrada a recuperar la memoria y producción pictórica de las mujeres artistas que operaron durante el Renacimiento y Barroco temprano.</p>
            <p>Obras de Sofonisba Anguissola, Artemisia Gentileschi y Lavinia Fontana dialogan en un recorrido que analiza no solo su maestría técnica con la luz y el óleo, sino las complejas redes de mecenazgo a las que tuvieron que recurrir para desarrollar su arte.</p>
            <p>"No se trata únicamente de una revisión histórica, sino de una restitución estética fundamental para comprender la totalidad del arte europeo", expresó la comisaria durante la presentación oficial.</p>
        `,
        featured: true
    },
    {
        id: 2,
        title: "Hallan manuscritos inéditos de la poetisa vanguardista Clara Dupond en Lyon",
        category: "literatura",
        author: "Julian Vance",
        date: "09 Oct, 2026",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        excerpt: "Un cofre guardado en el ático de una biblioteca pública revela más de cuarenta poemas y cartas cruzadas con la generación surrealista de 1930.",
        content: `
            <p>El descubrimiento de un baúl olvidado en el fondo de los archivos municipales de Lyon ha conmocionado al mundo de la filología hispánica y europea. Se trata de un compendio de manuscritos autógrafos atribuibles a Clara Dupond, figura clave de la poesía de vanguardia.</p>
            <p>Los versos, en un estado de conservación excepcional, muestran una transición fascinante desde el ultraísmo hacia un lirismo oscuro marcado por el estallido bélico europeo.</p>
        `,
        featured: false
    },
    {
        id: 3,
        title: "El auge de las Orquestas Neoclásicas: Cuando el minimalismo y el violín convergen",
        category: "musica",
        author: "Clara Liszt",
        date: "08 Oct, 2026",
        image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80",
        excerpt: "Compositores contemporáneos llenan los teatros mezclando sintetizadores analógicos con arreglos para cuarteto de cuerdas tradicional.",
        content: `
            <p>La música académica atraviesa un periodo de reinvención sin precedentes. A través de la integración de texturas electrónicas orgánicas y la sonoridad visceral de instrumentos de madera, la escena neoclásica atrae a una audiencia joven que busca contemplación e intimidad auditiva.</p>
        `,
        featured: false
    },
    {
        id: 4,
        title: "El cine documental revive la arquitectura utópica del siglo XX",
        category: "cine",
        author: "Marcos Del Rincón",
        date: "07 Oct, 2026",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        excerpt: "Un nuevo largometraje premiado en Berlín repasa los proyectos urbanísticos modernistas que buscaron rediseñar la convivencia en la ciudad moderna.",
        content: `
            <p>El documental 'Formas en el Aire' explora los grandiosos diseños arquitectónicos del brutalismo y el brutalismo poético de mediados del siglo pasado, cuestionando cómo influye el espacio construido sobre nuestra psique comunitaria.</p>
        `,
        featured: false
    },
    {
        id: 5,
        title: "Restauración histórica: La luz original regresa al fresco del Palacio Real",
        category: "patrimonio",
        author: "Beatriz M. Soria",
        date: "05 Oct, 2026",
        image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
        excerpt: "Tras tres años de minucioso trabajo con tecnología láser, restauradores retiran capas de hollín acumulado durante más de dos siglos.",
        content: `
            <p>Los trabajos de conservación en las bóvedas centrales del Palacio han concluido con éxito. El uso de micro-láseres de pulso corto permitió remover barnices oxidados sin deteriorar el pigmento original al fresco ejecutado en 1774.</p>
        `,
        featured: false
    }
];

// Obras para el Widget de Galería
const galleryData = [
    {
        img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
        caption: '"Geometría Lumínica" - Sofía L.'
    },
    {
        img: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=600&q=80",
        caption: '"Ecos Urbanos" - Galería Norte'
    },
    {
        img: "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=600&q=80",
        caption: '"Retrato en Pardo" - Colección Privada'
    }
];

/* ==========================================
   ESTADO DE LA APLICACIÓN
   ========================================== */
let currentCategory = 'todas';
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('cultural_favs')) || [];
let showingOnlyFavs = false;
let currentGalleryIdx = 0;
let commentsStore = {}; 
let currentSpeech = null;

/* ==========================================
   DOM ELEMENTS
   ========================================== */
const newsGrid = document.getElementById('news-grid');
const heroCard = document.getElementById('hero-card');
const categoryTabs = document.getElementById('category-tabs');
const searchInput = document.getElementById('search-input');
const favBadge = document.getElementById('fav-badge');
const favCounterBtn = document.getElementById('fav-counter-btn');
const favFilterBtn = document.getElementById('favorites-filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const currentDateEl = document.getElementById('current-date');
const emptyState = document.getElementById('empty-state');
const newsModal = document.getElementById('news-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

// Galería elementos
const galleryImg = document.getElementById('gallery-img');
const galleryCaption = document.getElementById('gallery-caption');
const prevGalBtn = document.getElementById('prev-gal');
const nextGalBtn = document.getElementById('next-gal');
const galIndicator = document.getElementById('gal-indicator');

/* ==========================================
   INICIALIZACIÓN
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    renderHero();
    renderNews();
    updateFavBadge();
    setupEventListeners();
});

function initDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    currentDateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

/* ==========================================
   RENDERIZADO DE NOTICIAS
   ========================================== */
function filterArticles() {
    return newsData.filter(item => {
        const matchesCategory = (currentCategory === 'todas' || item.category === currentCategory);
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFav = showingOnlyFavs ? favorites.includes(item.id) : true;

        return matchesCategory && matchesSearch && matchesFav;
    });
}

function renderHero() {
    const heroArticle = newsData.find(item => item.featured) || newsData[0];
    if (!heroArticle) return;

    heroCard.innerHTML = `
        <img src="${heroArticle.image}" alt="${heroArticle.title}" class="hero-img">
        <div class="hero-content">
            <span class="category-tag">${heroArticle.category}</span>
            <h2 class="hero-title" onclick="openModal(${heroArticle.id})">${heroArticle.title}</h2>
            <p class="hero-excerpt">${heroArticle.excerpt}</p>
            <div class="meta-info">
                <span><i class="fa-regular fa-user"></i> ${heroArticle.author}</span>
                <span><i class="fa-regular fa-clock"></i> ${heroArticle.date}</span>
            </div>
        </div>
    `;
}

function renderNews() {
    const filtered = filterArticles();
    newsGrid.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filtered.forEach(article => {
        if (article.featured && currentCategory === 'todas' && !searchQuery && !showingOnlyFavs) {
            return;
        }

        const isFav = favorites.includes(article.id);
        const card = document.createElement('article');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-card-img-wrap">
                <img src="${article.image}" alt="${article.title}" class="news-card-img">
                <button class="bookmark-btn ${isFav ? 'active' : ''}" onclick="toggleBookmark(${article.id}, event)">
                    <i class="fa-${isFav ? 'solid' : 'regular'} fa-bookmark"></i>
                </button>
            </div>
            <div class="news-card-body">
                <span class="category-tag">${article.category}</span>
                <h3 class="news-card-title" onclick="openModal(${article.id})">${article.title}</h3>
                <p class="news-card-excerpt">${article.excerpt}</p>
                <div class="meta-info">
                    <span>${article.author}</span>
                    <span>•</span>
                    <span>${article.date}</span>
                </div>
            </div>
        `;
        newsGrid.appendChild(card);
    });
}

/* ==========================================
   FAVORITOS (GUARDADOS)
   ========================================== */
function toggleBookmark(id, event) {
    if (event) event.stopPropagation();
    
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    
    localStorage.setItem('cultural_favs', JSON.stringify(favorites));
    updateFavBadge();
    renderNews();
}

function updateFavBadge() {
    favBadge.textContent = favorites.length;
}

/* ==========================================
   MODAL DE NOTICIA COMPLETA & LECTOR TTS
   ========================================== */
function openModal(id) {
    const article = newsData.find(item => item.id === id);
    if (!article) return;

    modalBody.innerHTML = `
        <div class="modal-article-header">
            <span class="category-tag">${article.category}</span>
            <h1 class="modal-article-title">${article.title}</h1>
            <div class="meta-info">
                <span>Por <strong>${article.author}</strong></span> | 
                <span>Publicado el ${article.date}</span>
            </div>
        </div>

        <div class="tts-bar">
            <button class="btn-tts" onclick="speakText('${encodeURIComponent(article.title + ". " + article.content.replace(/<[^>]*>?/gm, ''))}')">
                <i class="fa-solid fa-volume-high"></i> Escuchar Noticia
            </button>
            <button class="btn-tts" style="background:#8c877d;" onclick="stopSpeech()">
                <i class="fa-solid fa-stop"></i> Detener
            </button>
            <span style="font-size:0.8rem; color:var(--text-muted)">Lectura por Voz IA</span>
        </div>

        <img src="${article.image}" class="modal-article-img" alt="${article.title}">
        
        <div class="modal-article-text">
            ${article.content}
        </div>
    `;

    renderComments(id);
    document.getElementById('submit-comment').onclick = () => addComment(id);

    newsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    newsModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    stopSpeech();
}

/* Text To Speech (TTS) */
function speakText(encodedText) {
    stopSpeech();
    const text = decodeURIComponent(encodedText);
    if ('speechSynthesis' in window) {
        currentSpeech = new SpeechSynthesisUtterance(text);
        currentSpeech.lang = 'es-ES';
        currentSpeech.rate = 0.95;
        window.speechSynthesis.speak(currentSpeech);
    } else {
        alert("Tu navegador no soporta sintetizador de voz.");
    }
}

function stopSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

/* ==========================================
   SISTEMA DE COMENTARIOS
   ========================================== */
function addComment(articleId) {
    const authorInput = document.getElementById('comment-author');
    const textInput = document.getElementById('comment-text');

    const author = authorInput.value.trim() || 'Lector Anónimo';
    const text = textInput.value.trim();

    if (!text) return;

    if (!commentsStore[articleId]) {
        commentsStore[articleId] = [];
    }

    commentsStore[articleId].push({
        author: author,
        text: text,
        date: 'Ahora mismo'
    });

    authorInput.value = '';
    textInput.value = '';

    renderComments(articleId);
}

function renderComments(articleId) {
    const commentsList = document.getElementById('comments-list');
    const comments = commentsStore[articleId] || [];

    if (comments.length === 0) {
        commentsList.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">Aún no hay reflexiones para este artículo. Sé el primero en opinar.</p>`;
        return;
    }

    commentsList.innerHTML = comments.map(c => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${c.author}</span>
                <span>${c.date}</span>
            </div>
            <p class="comment-text">${c.text}</p>
        </div>
    `).join('');
}

/* ==========================================
   GALERÍA WIDGET
   ========================================== */
function updateGallery() {
    const item = galleryData[currentGalleryIdx];
    galleryImg.src = item.img;
    galleryCaption.textContent = item.caption;
    galIndicator.textContent = `${currentGalleryIdx + 1} / ${galleryData.length}`;
}

/* ==========================================
   EVENT LISTENERS Y CONFIGURACIÓN
   ========================================== */
function setupEventListeners() {
    categoryTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab')) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            showingOnlyFavs = false;
            favFilterBtn.classList.add('hidden');
            renderNews();
        }
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderNews();
    });

    favCounterBtn.addEventListener('click', () => {
        showingOnlyFavs = !showingOnlyFavs;
        if (showingOnlyFavs) {
            favFilterBtn.classList.remove('hidden');
        } else {
            favFilterBtn.classList.add('hidden');
        }
        renderNews();
    });

    favFilterBtn.addEventListener('click', () => {
        showingOnlyFavs = false;
        favFilterBtn.classList.add('hidden');
        renderNews();
    });

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    newsModal.addEventListener('click', (e) => {
        if (e.target === newsModal) closeModal();
    });

    prevGalBtn.addEventListener('click', () => {
        currentGalleryIdx = (currentGalleryIdx - 1 + galleryData.length) % galleryData.length;
        updateGallery();
    });

    nextGalBtn.addEventListener('click', () => {
        currentGalleryIdx = (currentGalleryIdx + 1) % galleryData.length;
        updateGallery();
    });
}