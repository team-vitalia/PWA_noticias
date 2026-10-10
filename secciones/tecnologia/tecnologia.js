
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const newsGrid = document.getElementById("newsGrid");
    const newsCards = [...newsGrid.querySelectorAll(".news-card")];
    const filterButtons = document.querySelectorAll(".filter-btn");
    const newsCount = document.getElementById("newsCount");
    const emptyMessage = document.getElementById("emptyMessage");

    const menuToggle = document.getElementById("menuToggle");
    const nav = document.getElementById("nav");
    const themeToggle = document.getElementById("themeToggle");

    const newsletterForm = document.getElementById("newsletterForm");
    const emailInput = document.getElementById("emailInput");
    const formMessage = document.getElementById("formMessage");

    let selectedCategory = "Todas";

    // BUSCADOR Y FILTROS DE NOTICIAS
    function filterNews() {
        const query = searchInput.value
            .trim()
            .toLocaleLowerCase("es");

        let visibleCount = 0;

        newsCards.forEach((card) => {
            const category = card.dataset.category;
            const searchableText = (
                card.dataset.search + " " + card.innerText
            ).toLocaleLowerCase("es");

            const matchesCategory =
                selectedCategory === "Todas" ||
                category === selectedCategory;

            const matchesSearch =
                searchableText.includes(query);

            const visible = matchesCategory && matchesSearch;

            card.hidden = !visible;

            if (visible) {
                visibleCount++;
            }
        });

        newsCount.textContent =
            `${visibleCount} noticia${visibleCount !== 1 ? "s" : ""}`;

        emptyMessage.hidden = visibleCount !== 0;
    }

    searchInput.addEventListener("input", filterNews);

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectedCategory = button.dataset.category;

            filterButtons.forEach((item) => {
                const active = item === button;

                item.classList.toggle("active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            filterNews();
        });

        button.setAttribute(
            "aria-pressed",
            String(button.classList.contains("active"))
        );
    });

    // MENÚ PARA DISPOSITIVOS MÓVILES
    menuToggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Cerrar menú" : "Abrir menú"
        );

        menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");
            menuToggle.textContent = "☰";
        });
    });

    // CAMBIO DE TEMA CLARO / OSCURO
    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark");

        themeToggle.textContent = isDark ? "☀" : "☾";
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
        );
    });

    // VALIDACIÓN DEMOSTRATIVA DEL FORMULARIO
    newsletterForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!emailInput.checkValidity()) {
            emailInput.reportValidity();
            return;
        }

        formMessage.textContent =
            "Formulario validado. Para completar la suscripción, " +
            "es necesario conectar un servicio de boletines.";

        emailInput.value = "";
    });

    // ESTADO INICIAL
    filterNews();
});
