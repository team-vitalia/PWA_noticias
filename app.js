
/**
 * NewsApp PWA - Cliente Principal (app.js)
 * API de noticias: GNews
 * 1. Registro del Service Worker
 * 2. Consumo de GNews API
 * 3. Inyección dinámica de noticias
 * 4. Gestión de notificaciones web nativas
 * 5. Caché local para reducir solicitudes
 */

// ==========================================================
// 1. CONFIGURACIÓN Y CONSTANTES
// ==========================================================

const API_KEY = '9fcb66c58020dc46277065d1e63a6038';
const API_BASE_URL = 'https://gnews.io/api/v4/top-headlines';

const CACHE_TIME = 15 * 60 * 1000; // 15 minutos
const REQUEST_COOLDOWN = 5000; // 5 segundos entre solicitudes

const isSubfolder = window.location.pathname.includes('/secciones/');
const basePath = isSubfolder ? '../' : './';

let currentCategory = 'general';
let swRegistration = null;
let activeRequest = null;
let lastRequestTime = 0;

const newsContainer = document.getElementById('news-container');
const newsCount = document.getElementById('news-count');
const sectionTitle = document.getElementById('section-title');
const btnNotify = document.getElementById('btn-notify');
const btnRefresh = document.getElementById('btn-refresh');
const navPills = document.querySelectorAll('.nav-pill');
const offlineBanner = document.getElementById('offline-banner');
const swStatus = document.getElementById('sw-status');

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220' viewBox='0 0 400 220'%3E%3Crect fill='%231e293b' width='400' height='220'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENewsApp PWA%3C/text%3E%3C/svg%3E";

// ==========================================================
// 2. SERVICE WORKER
// ==========================================================

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    if (swStatus) {
      swStatus.textContent = 'Service Worker: No soportado';
    }
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      `${basePath}sw.js`,
      { scope: basePath }
    );

    swRegistration = registration;

    console.log(
      '[App] Service Worker registrado:',
      registration.scope
    );
  } catch (error) {
    console.error(
      '[App] Error al registrar Service Worker:',
      error
    );
  }
}

// ==========================================================
// 3. NOTIFICACIONES NATIVAS
// ==========================================================

function updateNotificationButtonUI() {
  if (!btnNotify) return;

  if (!('Notification' in window)) {
    btnNotify.style.display = 'none';
    return;
  }

  if (Notification.permission === 'granted') {
    btnNotify.classList.add('granted');
    btnNotify.classList.remove('denied');
    btnNotify.innerHTML =
      '<span class="icon"><i class="fa-solid fa-bell"></i></span>' +
      '<span class="btn-text">Notificaciones Activas</span>';
  } else if (Notification.permission === 'denied') {
    btnNotify.classList.add('denied');
    btnNotify.classList.remove('granted');
    btnNotify.innerHTML =
      '<span class="icon"><i class="fa-solid fa-bell-slash"></i></span>' +
      '<span class="btn-text">Notificaciones Bloqueadas</span>';
    btnNotify.disabled = true;
  } else {
    btnNotify.classList.remove('granted', 'denied');
    btnNotify.disabled = false;
    btnNotify.innerHTML =
      '<span class="icon"><i class="fa-solid fa-bell"></i></span>' +
      '<span class="btn-text">Notificaciones</span>';
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('Tu navegador no soporta las notificaciones web.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    updateNotificationButtonUI();

    if (permission === 'granted') {
      await showNativeNotification(
        '¡Notificaciones activadas!',
        'NewsApp ya puede mostrarte notificaciones.'
      );
    }
  } catch (error) {
    console.error(
      '[App] Error al solicitar notificaciones:',
      error
    );
  }
}

async function showNativeNotification(title, bodyText, count = null) {
  if (
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) {
    return;
  }

  const iconUrl = new URL(
    `${basePath}icons/noticias-192.png`,
    window.location.href
  ).href;

  const options = {
    body: bodyText,
    icon: iconUrl,
    badge: iconUrl,
    tag: 'newsapp-update',
    data: {
      dateOfArrival: Date.now(),
      category: currentCategory,
      count
    }
  };

  try {
    if (swRegistration) {
      await swRegistration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  } catch (error) {
    console.error('[App] Error en notificación:', error);
  }
}

// ==========================================================
// 4. CACHÉ LOCAL
// ==========================================================

function getCachedNews(category) {
  try {
    const value = localStorage.getItem(`newsapp_gnews_${category}`);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('[App] No se pudo leer la caché:', error);
    return null;
  }
}

function saveCachedNews(category, articles) {
  try {
    localStorage.setItem(
      `newsapp_gnews_${category}`,
      JSON.stringify({
        articles,
        savedAt: Date.now()
      })
    );
  } catch (error) {
    console.warn('[App] No se pudo guardar la caché:', error);
  }
}

// ==========================================================
// 5. CONSUMO DE GNEWS API
// ==========================================================



async function fetchNews(category = 'general', force = false, notifyUpdate = true) {
  if (!newsContainer) return;

  const cached = getCachedNews(category);
  const validCache = cached && Array.isArray(cached.articles);

  if (!force && validCache && Date.now() - cached.savedAt < CACHE_TIME) {
    renderNews(cached.articles);
    return;
  }

  if (activeRequest) {
    if (activeRequest.category === category) {
      return activeRequest.promise;
    }

    // No iniciar otra petición mientras haya una en curso.
    await activeRequest.promise;
  }

  if (!force && Date.now() - lastRequestTime < REQUEST_COOLDOWN) {
    if (validCache) {
      renderNews(cached.articles);
    } else {
      showErrorState('Espera unos segundos antes de volver a consultar.');
    }
    return;
  }

  const promise = (async () => {
    showLoadingState();

    const params = new URLSearchParams({
      apikey: API_KEY,
      category,
      lang: 'es',
      country: 'mx',
      max: '10'
    });

    // Parámetro único para evitar reutilizar una respuesta HTTP almacenada.
    params.set('_refresh', String(Date.now()));

    try {
      lastRequestTime = Date.now();

      console.log('[NewsApp] Solicitando noticias:', category);

      const response = await fetch(
        `${API_BASE_URL}?${params.toString()}`,
        {
          method: 'GET',
          cache: 'no-store'
        }
      );

      const data = await response.json();

      console.log('[NewsApp] Estado HTTP:', response.status);
      console.log('[NewsApp] Respuesta GNews:', data);

      if (!response.ok || data.errors) {
        const detail = Array.isArray(data.errors)
          ? data.errors.join(', ')
          : data.errors
            ? String(data.errors)
            : data.message || `Error HTTP ${response.status}`;

        throw new Error(detail);
      }

      if (!Array.isArray(data.articles)) {
        throw new Error('GNews no devolvió una lista válida de noticias.');
      }

      const articles = data.articles;

      renderNews(articles);
      saveCachedNews(category, articles);

      if (newsCount) {
        newsCount.textContent = `${articles.length} noticias · Actualizadas ahora`;
      }

      if (notifyUpdate && articles.length > 0) {
        await showNativeNotification(
          `Noticias de ${getCategoryName(category)}`,
          `Se consultaron ${articles.length} noticias en GNews.`,
          articles.length
        );
      }
    } catch (error) {
      console.error('[NewsApp] Error al actualizar:', error);

      if (validCache) {
        renderNews(cached.articles);

        if (newsCount) {
          newsCount.textContent =
            `${cached.articles.length} noticias · Mostrando caché`;
        }
      } else {
        showErrorState(
          !navigator.onLine
            ? 'No hay conexión a Internet.'
            : error.message || 'No fue posible consultar GNews.'
        );
      }
    }
  })();

  activeRequest = { category, promise };

  try {
    await promise;
  } finally {
    if (activeRequest?.promise === promise) {
      activeRequest = null;
    }
  }
}

function getCategoryName(category) {
  const names = {
    general: 'General',
    world: 'Internacionales',
    nation: 'Nacionales',
    business: 'Negocios',
    technology: 'Tecnología',
    sports: 'Deportes',
    entertainment: 'Entretenimiento',
    science: 'Ciencia',
    health: 'Salud'
  };

  return names[category] || category;
}

// ==========================================================
// 6. ESTADOS DE CARGA Y ERROR
// ==========================================================

function showLoadingState() {
  if (newsCount) {
    newsCount.textContent = 'Cargando...';
  }

  if (newsContainer) {
    newsContainer.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Consultando noticias de GNews...</p>
      </div>
    `;
  }
}

function showErrorState(message) {
  if (newsCount) {
    newsCount.textContent = 'No disponible';
  }

  if (newsContainer) {
    const card = document.createElement('div');
    card.className = 'error-card';

    const title = document.createElement('h3');
    title.textContent = 'No se pudieron cargar las noticias';

    const detail = document.createElement('p');
    detail.className = 'error-details';
    detail.textContent = message;

    const button = document.createElement('button');
    button.className = 'btn btn-secondary';
    button.innerHTML =
      '<i class="fa-solid fa-arrows-rotate"></i> Reintentar conexión';

    button.addEventListener('click', () => {
      fetchNews(currentCategory, true);
    });

    card.append(title, detail, button);
    newsContainer.replaceChildren(card);
  }
}

// ==========================================================
// 7. MOSTRAR NOTICIAS
// ==========================================================


function renderNews(articles) {
  if (!newsContainer) return;

  newsContainer.replaceChildren();

  if (!Array.isArray(articles) || articles.length === 0) {
    newsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-newspaper"
           style="font-size: 32px; margin-bottom: 12px;"></i>
        <h3>No hay noticias disponibles</h3>
        <p>Intenta seleccionar otra categoría o actualizar las noticias.</p>
      </div>
    `;

    if (newsCount) newsCount.textContent = "0 noticias";
    return;
  }

  const fragment = document.createDocumentFragment();

  articles.forEach((article) => {
    const card = document.createElement("article");
    card.className = "news-card";

    const title = article.title || "Noticia sin título";
    const description =
      article.description || "No hay una descripción disponible para esta noticia.";
    const source =
      typeof article.source === "object"
        ? article.source?.name
        : article.source;

    const publishedAt = article.publishedAt
      ? new Date(article.publishedAt)
      : null;

    const dateText =
      publishedAt && !Number.isNaN(publishedAt.getTime())
        ? publishedAt.toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        : "Fecha no disponible";

    const imageUrl = article.image || "";

    // Imagen de la noticia
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "news-image-wrapper";

    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = title;
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";

      image.addEventListener("error", () => {
        image.remove();
        imageWrapper.classList.add("no-image");
        imageWrapper.innerHTML =
          '<i class="fa-regular fa-newspaper" aria-hidden="true"></i>';
      }, { once: true });

      imageWrapper.appendChild(image);
    } else {
      imageWrapper.classList.add("no-image");
      imageWrapper.innerHTML =
        '<i class="fa-regular fa-newspaper" aria-hidden="true"></i>';
    }

    // Información de la tarjeta
    const content = document.createElement("div");
    content.className = "news-card-content";

    const metadata = document.createElement("div");
    metadata.className = "news-meta";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "news-category";
    categoryBadge.textContent =
      currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);

    const date = document.createElement("time");
    date.className = "news-date";
    date.textContent = dateText;

    if (publishedAt && !Number.isNaN(publishedAt.getTime())) {
      date.dateTime = publishedAt.toISOString();
    }

    metadata.append(categoryBadge, date);

    const heading = document.createElement("h3");
    heading.className = "news-title";
    heading.textContent = title;

    const summary = document.createElement("p");
    summary.className = "news-description";
    summary.textContent = description;

    const footer = document.createElement("div");
    footer.className = "news-card-footer";

    const sourceName = document.createElement("span");
    sourceName.className = "news-source";
    sourceName.innerHTML = '<i class="fa-regular fa-newspaper"></i> ';
    sourceName.appendChild(document.createTextNode(source || "Fuente desconocida"));

    const link = document.createElement("a");
    link.className = "news-read-more";
    link.textContent = "Leer noticia";
    link.appendChild(document.createTextNode(" "));
    link.insertAdjacentHTML(
      "beforeend",
      '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>'
    );

    const safeUrl = safeArticleUrl(article.url);

    if (safeUrl) {
      link.href = safeUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.style.opacity = "0.5";
      link.style.pointerEvents = "none";
    }

    footer.append(sourceName, link);
    content.append(metadata, heading, summary, footer);
    card.append(imageWrapper, content);
    fragment.appendChild(card);
  });

  newsContainer.appendChild(fragment);

  if (newsCount) {
    newsCount.textContent =
      `${articles.length} ${articles.length === 1 ? "noticia" : "noticias"}`;
  }
}

function safeArticleUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.href;
    }
  } catch (error) {
    console.warn('[App] URL de noticia no válida.');
  }

  return 'https://news.google.com/';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================
// 8. EVENTOS E INICIALIZACIÓN
// ==========================================================

window.addEventListener('online', () => {
  if (offlineBanner) {
    offlineBanner.classList.add('hidden');
  }
});

window.addEventListener('offline', () => {
  if (offlineBanner) {
    offlineBanner.classList.remove('hidden');
  }
});


if (btnNotify) {
  btnNotify.addEventListener('click', requestNotificationPermission);
}

if (btnRefresh) {
  btnRefresh.addEventListener('click', async () => {
    btnRefresh.disabled = true;

    try {
      await fetchNews(currentCategory, true, true);
    } finally {
      btnRefresh.disabled = false;
    }
  });
}

navPills.forEach((pill) => {
  pill.addEventListener('click', async () => {
    const category = pill.dataset.category || 'general';

    if (category === currentCategory) return;

    currentCategory = category;

    navPills.forEach((element) => {
      const selected = element === pill;

      element.classList.toggle('active', selected);
      element.setAttribute('aria-pressed', String(selected));
    });

    const categoryName = getCategoryName(category);

    if (sectionTitle) {
      sectionTitle.textContent = `Noticias de ${categoryName}`;
    }

    // Consultar la categoría nueva ignorando la caché local.
    await fetchNews(category, true, false);

    // Avisar del cambio de sección si los permisos están habilitados.
    await showNativeNotification(
      'NewsApp · Cambio de sección',
      `Ahora estás consultando noticias de ${categoryName}.`
    );
  });
});

document.addEventListener('DOMContentLoaded', () => {
  if (!navigator.onLine && offlineBanner) {
    offlineBanner.classList.remove('hidden');
  }

  registerServiceWorker();
  updateNotificationButtonUI();

  if (newsContainer) {
    fetchNews(currentCategory);
  }
});
