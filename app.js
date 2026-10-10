/**
 * NewsApp PWA - Cliente Principal (app.js)
 * Manejo multi-página (index.html y secciones/api.html)
 * 1. Registro del Service Worker
 * 2. Consumo de la API de Mediastack
 * 3. Inyección dinámica en el App Shell
 * 4. Gestión de Notificaciones Web Nativas
 */

// ==========================================================
// 1. CONFIGURACIÓN Y CONSTANTES
// ==========================================================
const API_KEY = '715ff4974f372006ec47f6a45f4dccb6';
const API_BASE_URL = 'http://api.mediastack.com/v1/news';

// Determinación dinámica de rutas relativas (si está en la raíz o en /secciones/)
const isSubfolder = window.location.pathname.includes('/secciones/');
const basePath = isSubfolder ? '../' : './';

let currentCategory = 'general';
let swRegistration = null;

// Elementos del DOM del App Shell
const newsContainer = document.getElementById('news-container');
const newsCount = document.getElementById('news-count');
const sectionTitle = document.getElementById('section-title');
const btnNotify = document.getElementById('btn-notify');
const btnRefresh = document.getElementById('btn-refresh');
const navPills = document.querySelectorAll('.nav-pill');
const offlineBanner = document.getElementById('offline-banner');
const swStatus = document.getElementById('sw-status');

// Imagen SVG de reserva (Fallback) cuando la noticia no provee imagen
const FALLBACK_IMAGE = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220' viewBox='0 0 400 220'%3E%3Crect fill='%231e293b' width='400' height='220'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='20' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENewsApp PWA%3C/text%3E%3C/svg%3E";

// ==========================================================
// 2. REGISTRO DEL SERVICE WORKER
// ==========================================================
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const swFile = `${basePath}sw.js`;
      const swScope = basePath;

      const registration = await navigator.serviceWorker.register(swFile, { scope: swScope });
      swRegistration = registration;
      
      console.log('[App] Service Worker registrado con éxito en scope:', registration.scope);
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[App] Nueva versión de NewsApp lista.');
          }
        };
      };
    } catch (error) {
      console.error('[App] Error al registrar el Service Worker:', error);
    }
  } else {
    console.warn('[App] Service Workers no soportados en este navegador.');
    if (swStatus) {
      swStatus.textContent = 'Service Worker: No soportado';
    }
  }
}

// ==========================================================
// 3. GESTIÓN DE NOTIFICACIONES NATIVAS
// ==========================================================

function updateNotificationButtonUI() {
  if (!btnNotify) return;

  if (!('Notification' in window)) {
    btnNotify.style.display = 'none';
    return;
  }

  if (Notification.permission === 'granted') {
    btnNotify.classList.add('granted');
    btnNotify.innerHTML = '<span class="icon"><i class="fa-solid fa-bell"></i></span><span class="btn-text">Notificaciones Activas</span>';
  } else if (Notification.permission === 'denied') {
    btnNotify.classList.add('denied');
    btnNotify.innerHTML = '<span class="icon"><i class="fa-solid fa-bell-slash"></i></span><span class="btn-text">Notificaciones Bloqueadas</span>';
    btnNotify.disabled = true;
  } else {
    btnNotify.classList.remove('granted', 'denied');
    btnNotify.innerHTML = '<span class="icon"><i class="fa-solid fa-bell"></i></span><span class="btn-text">Activar Notificaciones</span>';
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('Tu navegador no soporta la API nativa de Notificaciones Web.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    updateNotificationButtonUI();

    if (permission === 'granted') {
      console.log('[App] Permiso de notificaciones otorgado.');
      showNativeNotification(
        '¡Notificaciones Activadas!',
        'Ahora recibirás alertas nativas en NewsApp cada vez que se actualicen las noticias.'
      );
    } else if (permission === 'denied') {
      console.warn('[App] El usuario denegó las notificaciones.');
    }
  } catch (error) {
    console.error('[App] Error al solicitar permiso de notificaciones:', error);
  }
}

/**
 * Emite una notificación web nativa utilizando el icono noticias-192.png
 */
async function showNativeNotification(title, bodyText, count = null) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // URL absoluta y canónica del icono noticias-192.png
  const iconUrl = new URL(`${basePath}icons/noticias-192.png`, window.location.href).href;

  const notificationOptions = {
    body: bodyText,
    icon: iconUrl,
    badge: iconUrl,
    tag: 'newsapp-update',
    renotify: true,
    vibrate: [150, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      category: currentCategory,
      count: count
    }
  };

  try {
    if (swRegistration && 'showNotification' in swRegistration) {
      await swRegistration.showNotification(title, notificationOptions);
    } else {
      new Notification(title, notificationOptions);
    }
    console.log('[App] Notificación nativa disparada:', title);
  } catch (err) {
    console.error('[App] Error al disparar notificación nativa:', err);
  }
}

// ==========================================================
// 4. CONSUMO DE LA API DE MEDIASTACK (SECCIÓN API)
// ==========================================================

async function fetchNews(category = 'general') {
  if (!newsContainer) return;

  showLoadingState();

  const params = new URLSearchParams({
    access_key: API_KEY,
    languages: 'es',
    categories: category,
    limit: '12'
  });

  const requestUrl = `${API_BASE_URL}?${params.toString()}`;

  try {
    console.log(`[App] Consultando Mediastack para categoría [${category}]...`);
    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error(`Error en el servidor: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Mediastack: ${data.error.message || data.error.code}`);
    }

    const articles = data.data || [];
    renderNews(articles);

    // ==========================================================
    // REQUISITO: Notificación nativa funcional al cargar noticias
    // ==========================================================
    if (articles.length > 0) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      showNativeNotification(
        '¡Noticias Actualizadas!',
        `Se han cargado ${articles.length} noticias en la categoría "${categoryName}".`,
        articles.length
      );
    }

  } catch (error) {
    console.error('[App] Error al obtener noticias:', error);
    showErrorState(error.message);
  }
}

// ==========================================================
// 5. INYECCIÓN DINÁMICA DE CONTENIDO EN EL APP SHELL
// ==========================================================

function showLoadingState() {
  if (newsCount) newsCount.textContent = 'Cargando...';
  if (newsContainer) {
    newsContainer.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Consultando la API de Mediastack en vivo...</p>
      </div>
    `;
  }
}

function showErrorState(errorMessage) {
  if (newsCount) newsCount.textContent = '0 noticias';
  if (newsContainer) {
    newsContainer.innerHTML = `
      <div class="error-card">
        <span class="error-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
        <h3>No se pudieron cargar las noticias</h3>
        <p class="error-details">${errorMessage}</p>
        <button class="btn btn-secondary" onclick="fetchNews('${currentCategory}')">
          <i class="fa-solid fa-arrows-rotate"></i> Reintentar conexión
        </button>
      </div>
    `;
  }
}

function renderNews(articles) {
  if (!newsContainer) return;

  if (!articles || articles.length === 0) {
    if (newsCount) newsCount.textContent = '0 noticias';
    newsContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon"><i class="fa-solid fa-folder-open"></i></span>
        <h3>No se encontraron noticias en esta categoría</h3>
        <p>Prueba seleccionando otra sección en el menú de categorías.</p>
      </div>
    `;
    return;
  }

  if (newsCount) newsCount.textContent = `${articles.length} noticias disponibles`;
  newsContainer.innerHTML = '';

  articles.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'news-card';

    const dateFormatted = item.published_at 
      ? new Date(item.published_at).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Fecha reciente';

    const imageUrl = item.image ? item.image : FALLBACK_IMAGE;

    card.innerHTML = `
      <div class="card-image-wrap">
        <img 
          src="${imageUrl}" 
          alt="${escapeHtml(item.title || 'Noticia')}" 
          class="card-image"
          loading="lazy"
          onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
        >
        <span class="card-badge">${escapeHtml(item.category || currentCategory)}</span>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span class="card-source">${escapeHtml(item.source || 'Fuente general')}</span>
          <span class="card-date">${dateFormatted}</span>
        </div>
        <h3 class="card-title">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(item.title || 'Sin título disponible')}
          </a>
        </h3>
        <p class="card-description">
          ${escapeHtml(item.description || 'Haga clic en el enlace para leer la noticia completa en la fuente.')}
        </p>
        <div class="card-footer">
          <span class="card-author">${item.author ? `Por: ${escapeHtml(item.author)}` : 'Redacción'}</span>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="card-link">
            Leer noticia <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;

    newsContainer.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================
// 6. EVENT LISTENERS E INICIALIZACIÓN
// ==========================================================

window.addEventListener('online', () => {
  if (offlineBanner) offlineBanner.classList.add('hidden');
});

window.addEventListener('offline', () => {
  if (offlineBanner) offlineBanner.classList.remove('hidden');
});

if (btnNotify) {
  btnNotify.addEventListener('click', () => {
    requestNotificationPermission();
  });
}

if (btnRefresh) {
  btnRefresh.addEventListener('click', () => {
    fetchNews(currentCategory);
  });
}

if (navPills.length > 0) {
  navPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      navPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      currentCategory = pill.dataset.category;
      if (sectionTitle) sectionTitle.textContent = `Noticias de ${pill.textContent}`;
      fetchNews(currentCategory);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!navigator.onLine && offlineBanner) {
    offlineBanner.classList.remove('hidden');
  }

  registerServiceWorker();
  updateNotificationButtonUI();

  // Si estamos en la página que contiene el contenedor de noticias (secciones/api.html), cargamos las noticias
  if (newsContainer) {
    fetchNews(currentCategory);
  }
});
