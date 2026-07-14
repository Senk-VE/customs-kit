import { initToggle } from '../core/toggle.js';
export async function loadNavbar() {
  const navbarContainer = document.getElementById('navbar');

  if (!navbarContainer) return;

  try {
    const response = await fetch('./components/navbar.html');

    if (!response.ok) {
      throw new Error('Navbar loading error');
    }

    const html = await response.text();

    navbarContainer.innerHTML = html;

    initToggle();
    initNavbar();
  } catch (error) {
    console.error('Navbar error:', error);
  }
}

function initNavbar() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');

    menu.classList.toggle('active');
  });

  const links = menu.querySelectorAll('a');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.classList.remove('active');
    });
  });
}
