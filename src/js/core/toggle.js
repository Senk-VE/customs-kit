export function initToggle() {
  const navToggle = document.getElementById('nav-toggle');

  const navContainer = document.querySelector('.nav-container');

  const navMenu = document.getElementById('nav-menu');

  if (!navToggle || !navContainer || !navMenu) {
    return;
  }

  navToggle.addEventListener('click', () => {
    navContainer.classList.toggle('active');

    navMenu.classList.toggle('active');
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    } else {
      navContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    }
  });
}
