// ===== Navigation Toggle =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav__link');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    navToggle.classList.toggle('active');
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (link.classList.contains('nav__dropdown-btn')) return;
    if (navMenu) navMenu.classList.remove('open');
    if (navToggle) navToggle.classList.remove('active');
  });
});

// ===== Reports dropdown =====
document.querySelectorAll('.nav__item--dropdown').forEach(item => {
  const btn = item.querySelector('.nav__dropdown-btn');
  if (!btn) return;

  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const willOpen = !item.classList.contains('open');
    document.querySelectorAll('.nav__item--dropdown').forEach(other => {
      other.classList.remove('open');
      const otherBtn = other.querySelector('.nav__dropdown-btn');
      if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', e => {
  if (e.target.closest('.nav__item--dropdown')) return;
  document.querySelectorAll('.nav__item--dropdown').forEach(item => {
    item.classList.remove('open');
    const btn = item.querySelector('.nav__dropdown-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
});

// ===== Header Scroll =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== Active Nav Link =====
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  const scrollY = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        link.classList.toggle('active', href === `#${id}`);
      });
    }
  });
}

window.addEventListener('scroll', updateActiveLink);

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll(
  '.glass-card, .stat-card, .timeline__item, .visual-block, .media-gallery__item'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

revealElements.forEach(el => revealObserver.observe(el));

// ===== Progress Bars Animation =====
const progressBars = document.querySelectorAll('.progress-bar__fill');

const progressObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.dataset.width;
        entry.target.style.width = `${width}%`;
        progressObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

progressBars.forEach(bar => progressObserver.observe(bar));

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
