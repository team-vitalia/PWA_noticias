
/* =====================================
   NOTICIAS LOCALES - ALFEÑIQUE DE TOLUCA
   Funciones y datos exclusivos de locales
===================================== */

const localesNoticias = [
  {
    id: 1,
    titulo: "El alfeñique: una tradición que da identidad a Toluca",
    descripcion:
      "Las figuras de azúcar, calaveritas y dulces tradicionales forman parte de una costumbre que reúne a familias y artesanos durante la temporada de Día de Muertos.",
    categoria: "Tradiciones",
    ubicacion: "Toluca, Estado de México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?auto=format&fit=crop&w=900&q=80",
    destacado: true,
    fuente: "Ayuntamiento de Toluca",
    urlFuente: "https://www2.toluca.gob.mx/"
  },
  {
    id: 2,
    titulo: "Artesanos preparan coloridas calaveritas de azúcar",
    descripcion:
      "La elaboración artesanal de calaveritas y figuras de alfeñique mantiene viva una tradición que combina creatividad, paciencia y conocimientos transmitidos entre generaciones.",
    categoria: "Artesanías",
    ubicacion: "Toluca, Estado de México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=900&q=80",
    destacado: true,
    fuente: "Ayuntamiento de Toluca",
    urlFuente: "https://www2.toluca.gob.mx/"
  },
  {
    id: 3,
    titulo: "Dulces tradicionales llenan de sabor la temporada",
    descripcion:
      "Calaveritas, figuras decorativas y dulces mexicanos forman parte de la oferta tradicional que acompaña las celebraciones del Día de Muertos.",
    categoria: "Gastronomía",
    ubicacion: "Toluca, Estado de México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=900&q=80",
    destacado: false,
    fuente: "Secretaría de Cultura y Turismo del Estado de México",
    urlFuente: "https://cultura.edomex.gob.mx/"
  },
  {
    id: 4,
    titulo: "El Día de Muertos inspira actividades culturales familiares",
    descripcion:
      "Las celebraciones de esta temporada son una oportunidad para acercarse a las expresiones artísticas, las leyendas y las costumbres que forman parte de la cultura mexicana.",
    categoria: "Cultura",
    ubicacion: "Toluca, Estado de México",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1509674859255-1d0f4b5f9f56?auto=format&fit=crop&w=900&q=80",
    destacado: false,
    fuente: "Secretaría de Cultura y Turismo del Estado de México",
    urlFuente: "https://cultura.edomex.gob.mx/"
  },
  {
    id: 5,
    titulo: "La temporada de alfeñique invita a recorrer el centro de Toluca",
    descripcion:
      "Los recorridos por el centro histórico permiten descubrir espacios tradicionales, comercios y expresiones culturales vinculadas con las celebraciones de noviembre.",
    categoria: "Turismo",
    ubicacion: "Centro de Toluca",
    fecha: "2026-10-10",
    imagen:
      "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=900&q=80",
    destacado: false,
    fuente: "Ayuntamiento de Toluca",
    urlFuente: "https://www2.toluca.gob.mx/"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("locales-lista");
  const buscador = document.getElementById("locales-buscador");
  const filtro = document.getElementById("locales-filtro");
  const contador = document.getElementById("locales-contador");
  const botonDestacadas = document.getElementById("locales-destacadas");

  // Evitar errores si el archivo se carga en otra página
  if (
    !lista ||
    !buscador ||
    !filtro ||
    !contador ||
    !botonDestacadas
  ) {
    return;
  }

  let mostrarSoloDestacadas = false;

  // Crear las opciones de categoría automáticamente
  function localesCargarCategorias() {
    const categorias = [
      ...new Set(localesNoticias.map((noticia) => noticia.categoria))
    ];

    categorias.forEach((categoria) => {
      const opcion = document.createElement("option");
      opcion.value = categoria;
      opcion.textContent = categoria;
      filtro.appendChild(opcion);
    });
  }

  // Crear una tarjeta de noticia sin insertar HTML inseguro
  function localesCrearTarjeta(noticia) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "locales-tarjeta";

    if (noticia.destacado) {
      tarjeta.classList.add("locales-tarjeta-destacada");
    }

    const imagen = document.createElement("img");
    imagen.className = "locales-imagen";
    imagen.src = noticia.imagen;
    imagen.alt = `Imagen ilustrativa: ${noticia.titulo}`;
    imagen.loading = "lazy";
    imagen.referrerPolicy = "no-referrer";

    imagen.addEventListener("error", () => {
      imagen.hidden = true;
    });

    const contenido = document.createElement("div");
    contenido.className = "locales-tarjeta-contenido";

    const categoria = document.createElement("span");
    categoria.className = "locales-categoria";
    categoria.textContent = noticia.categoria;

    const titulo = document.createElement("h3");
    titulo.textContent = noticia.titulo;

    const descripcion = document.createElement("p");
    descripcion.className = "locales-descripcion";
    descripcion.textContent = noticia.descripcion;

    const metadatos = document.createElement("p");
    metadatos.className = "locales-metadatos";
    metadatos.textContent = `📍 ${noticia.ubicacion} · ${localesFormatearFecha(noticia.fecha)}`;

    const fuente = document.createElement("a");
    fuente.className = "locales-fuente";
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

  // Mostrar fecha de forma legible
  function localesFormatearFecha(fecha) {
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

  // Aplicar búsqueda y filtros
  function localesObtenerFiltradas() {
    const texto = buscador.value.trim().toLocaleLowerCase("es-MX");
    const categoriaSeleccionada = filtro.value;

    return localesNoticias.filter((noticia) => {
      const coincideTexto = [
        noticia.titulo,
        noticia.descripcion,
        noticia.categoria,
        noticia.ubicacion
      ].some((campo) =>
        campo.toLocaleLowerCase("es-MX").includes(texto)
      );

      const coincideCategoria =
        categoriaSeleccionada === "Todas" ||
        noticia.categoria === categoriaSeleccionada;

      const coincideDestacada =
        !mostrarSoloDestacadas || noticia.destacado;

      return (
        coincideTexto &&
        coincideCategoria &&
        coincideDestacada
      );
    });
  }

  // Dibujar las noticias en pantalla
  function localesRenderizarNoticias() {
    const noticiasFiltradas = localesObtenerFiltradas();
    lista.replaceChildren();

    if (noticiasFiltradas.length === 0) {
      const mensaje = document.createElement("p");
      mensaje.className = "locales-sin-resultados";
      mensaje.textContent =
        "No encontramos noticias con esos criterios. Intenta otra búsqueda.";
      lista.appendChild(mensaje);
    } else {
      const fragmento = document.createDocumentFragment();

      noticiasFiltradas.forEach((noticia) => {
        fragmento.appendChild(localesCrearTarjeta(noticia));
      });

      lista.appendChild(fragmento);
    }

    contador.textContent =
      `${noticiasFiltradas.length} ` +
      `${noticiasFiltradas.length === 1 ? "noticia encontrada" : "noticias encontradas"}`;

    botonDestacadas.setAttribute(
      "aria-pressed",
      String(mostrarSoloDestacadas)
    );

    botonDestacadas.textContent = mostrarSoloDestacadas
      ? "Ver todas las noticias"
      : "✨ Ver destacadas";
  }

  // Eventos de interacción
  buscador.addEventListener("input", localesRenderizarNoticias);
  filtro.addEventListener("change", localesRenderizarNoticias);

  botonDestacadas.addEventListener("click", () => {
    mostrarSoloDestacadas = !mostrarSoloDestacadas;
    localesRenderizarNoticias();
  });

  // Iniciar sección
  localesCargarCategorias();
  localesRenderizarNoticias();
});
