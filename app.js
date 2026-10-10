// Navegación del contenido dinámico del App Shell.
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.section;

    navButtons.forEach((item) => {
      item.classList.remove('active');
      item.removeAttribute('aria-current');
    });

    sections.forEach((section) => {
      section.classList.remove('active');
      section.hidden = true;
    });

    button.classList.add('active');
    button.setAttribute('aria-current', 'page');

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.hidden = false;
      targetSection.classList.add('active');
    }
  });
});
