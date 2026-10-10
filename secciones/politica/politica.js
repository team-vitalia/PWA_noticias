
/* ========================================
   PANORAMA POLÍTICO
   Datos y funciones exclusivos de politica
======================================== */

const politicaNoticias = [
  {
    id: 1,
    titulo: "Gobierno y administración pública: temas que importan",
    descripcion:
      "Conoce las funciones del gobierno, las políticas públicas y los asuntos que influyen en la vida cotidiana de la ciudadanía.",
    categoria: "Gobierno",
    ubicacion: "México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80",
    destacado: true,
    fuente: "Milenio",
    urlFuente: "https://www.milenio.com/politica"
  },
  {
    id: 2,
    titulo: "El trabajo legislativo y la creación de nuevas leyes",
    descripcion:
      "Las iniciativas, las discusiones parlamentarias y las votaciones forman parte del proceso mediante el cual se elaboran y modifican las leyes.",
    categoria: "Congreso",
    ubicacion: "Ciudad de México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=900&q=80",
    destacado: true,
    fuente: "Cámara de Diputados",
    urlFuente: "https://www.diputados.gob.mx/"
  },
  {
    id: 3,
    titulo: "Participación ciudadana y procesos electorales",
    descripcion:
      "La participación ciudadana permite intervenir en la vida democrática. Infórmate sobre las elecciones y las funciones de las autoridades electorales.",
    categoria: "Elecciones",
    ubicacion: "México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=900&q=80",
    destacado: false,
    fuente: "Instituto Nacional Electoral",
    urlFuente: "https://www.ine.mx/"
  },
  {
    id: 4,
    titulo: "Transparencia y acceso a la información pública",
    descripcion:
      "La transparencia permite conocer información sobre las instituciones públicas, sus decisiones y el uso de los recursos gubernamentales.",
    categoria: "Transparencia",
    ubicacion: "México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    destacado: false,
    fuente: "Plataforma Nacional de Transparencia",
    urlFuente: "https://www.plataformadetransparencia.org.mx/"
  },
  {
    id: 5,
    titulo: "Políticas públicas y sus efectos en la sociedad",
    descripcion:
      "Las decisiones públicas pueden influir en la economía, la movilidad, la seguridad y los servicios. Analizar sus objetivos ayuda a comprender sus posibles efectos.",
    categoria: "Políticas públicas",
    ubicacion: "México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    destacado: false,
    fuente: "Milenio",
    urlFuente: "https://www.milenio.com/politica"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const politicaLista = document.getElementById("politica-lista");
  const politicaBuscador = document.getElementById("politica-buscador");
  const politicaFiltro = document.getElementById("politica-filtro");
  const politicaContador = document.getElementById("politica-contador");
  const politicaBotonDestacadas =
    document.getElementById("politica-destacadas");

  // Permite cargar este archivo sin errores en otras páginas.
  if (
    !politicaLista ||
    !politicaBuscador ||
    !politicaFiltro ||
    !politicaContador ||
    !politicaBotonDestacadas
  ) {
    return;
  }

  let politicaSoloDestacadas = false;

  // Generar las categorías a partir de los datos disponibles.
  function politicaCargarCategorias() {
    const politicaCategorias = [
      ...new Set(
        politicaNoticias.map((noticia) => noticia.categoria)
      )
    ];

    politicaCategorias.forEach((categoria) => {
      const opcion = document.createElement("option");
      opcion.value = categoria;
      opcion.textContent = categoria;
      politicaFiltro.appendChild(opcion);
    });
  }

  // Formatear fechas para mostrarlas en español.
  function politicaFormatearFecha(fecha) {
    const fechaLocal = new Date(`${fecha}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) {
      return fecha;
    }

    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(fechaLocal);
  }

  // Construir tarjetas usando nodos DOM y textContent.
  function politicaCrearTarjeta(noticia) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "politica-tarjeta";

    if (noticia.destacado) {
      tarjeta.classList.add("politica-tarjeta-destacada");
    }

    const imagen = document.createElement("img");
    imagen.className = "politica-imagen";
    imagen.src = noticia.imagen;
    imagen.alt = `Imagen ilustrativa: ${noticia.titulo}`;
    imagen.loading = "lazy";
    imagen.referrerPolicy = "no-referrer";

    imagen.addEventListener("error", () => {
      imagen.hidden = true;
    });

    const contenido = document.createElement("div");
    contenido.className = "politica-tarjeta-contenido";

    const categoria = document.createElement("span");
    categoria.className = "politica-categoria";
    categoria.textContent = noticia.categoria;

    const titulo = document.createElement("h3");
    titulo.textContent = noticia.titulo;

    const descripcion = document.createElement("p");
    descripcion.className = "politica-descripcion";
    descripcion.textContent = noticia.descripcion;

    const metadatos = document.createElement("p");
    metadatos.className = "politica-metadatos";
    metadatos.textContent =
      `${noticia.ubicacion} · ${politicaFormatearFecha(noticia.fecha)}`;

    const fuente = document.createElement("a");
    fuente.className = "politica-fuente-enlace";
    fuente.textContent = `Consultar fuente: ${noticia.fuente}`;
    fuente.href = noticia.urlFuente;
    fuente.target = "_blank";
    fuente.rel = "noopener noreferrer";

    contenido.append(
      categoria,
      titulo,
      descripcion,
      metadatos,
      fuente
    );

    tarjeta.append(imagen, contenido);

    return tarjeta;
  }

  // Filtrar por texto, categoría y estado destacado.
  function politicaObtenerNoticiasFiltradas() {
    const texto = politicaBuscador.value
      .trim()
      .toLocaleLowerCase("es-MX");

    const categoriaSeleccionada = politicaFiltro.value;

    return politicaNoticias.filter((noticia) => {
      const coincideTexto = [
        noticia.titulo,
        noticia.descripcion,
        noticia.categoria,
        noticia.ubicacion,
        noticia.fuente
      ].some((campo) =>
        campo.toLocaleLowerCase("es-MX").includes(texto)
      );

      const coincideCategoria =
        categoriaSeleccionada === "Todas" ||
        noticia.categoria === categoriaSeleccionada;

      const coincideDestacada =
        !politicaSoloDestacadas || noticia.destacado;

      return (
        coincideTexto &&
        coincideCategoria &&
        coincideDestacada
      );
    });
  }

  // Actualizar tarjetas, contador y botón.
  function politicaRenderizarNoticias() {
    const noticiasFiltradas = politicaObtenerNoticiasFiltradas();

    politicaLista.replaceChildren();

    if (noticiasFiltradas.length === 0) {
      const mensaje = document.createElement("p");
      mensaje.className = "politica-sin-resultados";
      mensaje.textContent =
        "No encontramos resultados. Prueba con otra palabra o categoría.";

      politicaLista.appendChild(mensaje);
    } else {
      const fragmento = document.createDocumentFragment();

      noticiasFiltradas.forEach((noticia) => {
        fragmento.appendChild(politicaCrearTarjeta(noticia));
      });

      politicaLista.appendChild(fragmento);
    }

    const total = noticiasFiltradas.length;

    politicaContador.textContent =
      `${total} ${total === 1 ? "resultado encontrado" : "resultados encontrados"}`;

    politicaBotonDestacadas.setAttribute(
      "aria-pressed",
      String(politicaSoloDestacadas)
    );

    politicaBotonDestacadas.textContent = politicaSoloDestacadas
      ? "Ver todas las noticias"
      : "★ Solo destacadas";
  }

  // Eventos de búsqueda y filtrado.
  politicaBuscador.addEventListener(
    "input",
    politicaRenderizarNoticias
  );

  politicaFiltro.addEventListener(
    "change",
    politicaRenderizarNoticias
  );

  politicaBotonDestacadas.addEventListener("click", () => {
    politicaSoloDestacadas = !politicaSoloDestacadas;
    politicaRenderizarNoticias();
  });

  // Inicialización de la sección.
  politicaCargarCategorias();
  politicaRenderizarNoticias();
});
