/* ══════════════════════════════════════════════════════════
   MAXIMILIANO RAMOS — Portfolio JS
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ──────────────────────────────────────────────────────────
  // 1. NAVBAR — scroll effect + mobile menu
  // ──────────────────────────────────────────────────────────
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navMenu     = document.getElementById('navMenu');
  const navOverlay  = document.getElementById('navOverlay');
  const navLinks    = navMenu ? navMenu.querySelectorAll('a') : [];

  function onNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }

  window.addEventListener('scroll', onNavbarScroll, { passive: true });
  onNavbarScroll();

  function openMenu() {
    if (!hamburger || !navMenu || !navOverlay) return;
    hamburger.classList.add('open');
    navMenu.classList.add('open');
    navOverlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!hamburger || !navMenu || !navOverlay) return;
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    navOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.contains('open') ? closeMenu() : openMenu();
    });
  }

  const navClose = document.getElementById('navClose');

  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);
  if (navClose) navClose.addEventListener('click', closeMenu);

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });


  // ──────────────────────────────────────────────────────────
  // 2. HERO — Split name into chars for parallax
  // ──────────────────────────────────────────────────────────
  const heroSection  = document.querySelector('.hero');
  const heroPhotoWrap = document.getElementById('heroPhoto');
  const heroLine1    = document.getElementById('heroLine1');
  const heroLine2    = document.getElementById('heroLine2');

  function splitIntoChars(lineEl) {
    if (!lineEl) return;
    const text = lineEl.textContent;
    lineEl.innerHTML = '';
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.classList.add('char');
      span.textContent = char === ' ' ? '\u00A0' : char;
      lineEl.appendChild(span);
    });
  }

  splitIntoChars(heroLine1);
  splitIntoChars(heroLine2);

  // Parallax cursor effect (only on pointer/hover devices)
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasHover && heroSection) {
    let targetMX = 0, targetMY = 0;  // target values (-1 to 1)
    let currentMX = 0, currentMY = 0; // lerped values
    let rafId = null;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      targetMX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      targetMY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    });

    heroSection.addEventListener('mouseleave', () => {
      targetMX = 0;
      targetMY = 0;
    });

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function tickHero() {
      rafId = requestAnimationFrame(tickHero);

      currentMX = lerp(currentMX, targetMX, 0.07);
      currentMY = lerp(currentMY, targetMY, 0.07);

      // Skip update if movement is negligible
      if (
        Math.abs(currentMX - targetMX) < 0.0001 &&
        Math.abs(currentMY - targetMY) < 0.0001 &&
        Math.abs(currentMX) < 0.0001 &&
        Math.abs(currentMY) < 0.0001
      ) return;

      // Photo 3D tilt
      if (heroPhotoWrap) {
        const tiltX = currentMY * -14;
        const tiltY = currentMX *  14;
        heroPhotoWrap.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
      }

      // Each character shifts at a different depth
      const allChars = document.querySelectorAll('.hero__name-line .char');
      allChars.forEach((char, i) => {
        const depth = ((i % 5) + 1) * 4.5;
        const tx = currentMX * depth;
        const ty = currentMY * depth * 0.45;
        char.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    }

    tickHero();
  }


  // ──────────────────────────────────────────────────────────
  // 3. ROLES TYPEWRITER
  // ──────────────────────────────────────────────────────────
  const roles = ['Frontend Developer', 'QA Manual', 'Product Owner'];
  const roleTextEl = document.getElementById('roleText');

  if (roleTextEl) {
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer = null;

    function typeRole() {
      const current = roles[roleIndex];

      if (isDeleting) {
        charIndex--;
        roleTextEl.textContent = current.slice(0, charIndex);
      } else {
        charIndex++;
        roleTextEl.textContent = current.slice(0, charIndex);
      }

      let delay = isDeleting ? 55 : 100;

      if (!isDeleting && charIndex === current.length) {
        delay = 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 400;
      }

      typingTimer = setTimeout(typeRole, delay);
    }

    setTimeout(typeRole, 900);
  }


  // ──────────────────────────────────────────────────────────
  // 4. SCROLL REVEAL — Intersection Observer
  // ──────────────────────────────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback for old browsers
    fadeEls.forEach((el) => el.classList.add('visible'));
  }


  // ──────────────────────────────────────────────────────────
  // 5. DARK / LIGHT THEME TOGGLE
  // ──────────────────────────────────────────────────────────
  const htmlEl      = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');
  const themeLabel  = document.getElementById('themeLabel');

  const STORAGE_KEY = 'mr-theme';

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    if (themeIcon && themeLabel) {
      if (theme === 'light') {
        themeIcon.className  = 'fa-solid fa-moon';
        themeLabel.textContent = 'Dark Mode';
      } else {
        themeIcon.className  = 'fa-solid fa-sun';
        themeLabel.textContent = 'Light Mode';
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) { /* storage unavailable */ }
  }

  // Load saved preference
  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem(STORAGE_KEY) || 'dark';
  } catch (_) { /* ignore */ }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }


  // ──────────────────────────────────────────────────────────
  // 6. SMOOTH SCROLL for anchor links (fallback)
  // ──────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
