/* ═══════════════════════════════════════════════════════════
   ESTUDIO SCROLLINI — Main JS
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Inicializar Lucide Icons ──────────────────────────────
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── Referencias DOM ────────────────────────────────────────
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = navMenu.querySelectorAll('a');
  const fadeEls   = document.querySelectorAll('.fade-in');

  // ── Reviews Carousel ──────────────────────────────────────
  const reviewsCarousel = document.getElementById('reviewsCarousel');
  const reviewsWindow   = reviewsCarousel.querySelector('.reviews-carousel__window');
  const reviewsTrack    = document.getElementById('reviewsTrack');
  const reviewsPrev     = document.getElementById('reviewsPrev');
  const reviewsNext     = document.getElementById('reviewsNext');
  const reviewCards     = reviewsTrack.querySelectorAll('.review-card');
  const totalReviews    = reviewCards.length;

  let reviewIndex     = 0;
  let reviewCardStep  = 0;  // card width + gap in px
  let reviewsPerView  = 3;
  let reviewAutoplay  = null;
  let reviewResizeTimer = null;

  // ──────────────────────────────────────────────────────────
  // 1. NAVBAR — sticky + scroll effect
  // ──────────────────────────────────────────────────────────
  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ──────────────────────────────────────────────────────────
  // 2. MOBILE MENU — hamburger toggle
  // ──────────────────────────────────────────────────────────
  function openMenu() {
    hamburger.classList.add('open');
    navMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // ──────────────────────────────────────────────────────────
  // 3. SMOOTH SCROLL (fallback)
  // ──────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ──────────────────────────────────────────────────────────
  // 4. REVIEWS CAROUSEL — multi-card, responsive, autoplay
  // ──────────────────────────────────────────────────────────

  function getReviewsPerView() {
    const w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function initReviewsCarousel() {
    reviewsPerView = getReviewsPerView();
    const gap = 20; // 1.25rem in px
    const containerWidth = reviewsWindow.offsetWidth;
    const cardWidth = Math.floor((containerWidth - gap * (reviewsPerView - 1)) / reviewsPerView);

    reviewCardStep = cardWidth + gap;

    reviewCards.forEach(card => {
      card.style.width = cardWidth + 'px';
    });

    // Clamp index so we never show empty space at the end
    const maxIdx = Math.max(0, totalReviews - reviewsPerView);
    if (reviewIndex > maxIdx) reviewIndex = maxIdx;

    // Apply transform without transition on resize
    reviewsTrack.style.transition = 'none';
    reviewsTrack.style.transform = `translateX(-${reviewIndex * reviewCardStep}px)`;

    // Re-enable transition after layout settles
    requestAnimationFrame(() => {
      reviewsTrack.style.transition = '';
    });

    updateReviewButtons();
    updateReviewCounter();

    // Set window height on mobile (1-per-view) so container fits current card
    if (reviewsPerView === 1) {
      requestAnimationFrame(() => {
        const h = reviewCards[reviewIndex].offsetHeight;
        if (h > 0) reviewsWindow.style.height = h + 'px';
      });
    } else {
      reviewsWindow.style.height = '';
    }
  }

  function updateReviewButtons() {
    const maxIdx = Math.max(0, totalReviews - reviewsPerView);
    reviewsPrev.style.opacity = reviewIndex <= 0 ? '0.35' : '1';
    reviewsPrev.style.pointerEvents = reviewIndex <= 0 ? 'none' : 'auto';
    reviewsNext.style.opacity = reviewIndex >= maxIdx ? '0.35' : '1';
    reviewsNext.style.pointerEvents = reviewIndex >= maxIdx ? 'none' : 'auto';
  }

  function updateReviewCounter() {
    const counter = document.getElementById('reviewsCounter');
    if (counter) {
      counter.textContent = `${reviewIndex + 1} / ${totalReviews}`;
    }
  }

  function updateReviewWindowHeight() {
    if (reviewsPerView !== 1) {
      reviewsWindow.style.height = '';
      return;
    }
    requestAnimationFrame(() => {
      const h = reviewCards[reviewIndex].offsetHeight;
      if (h > 0) reviewsWindow.style.height = h + 'px';
    });
  }

  function goToReview(index) {
    const maxIdx = Math.max(0, totalReviews - reviewsPerView);
    reviewIndex = Math.max(0, Math.min(index, maxIdx));
    reviewsTrack.style.transform = `translateX(-${reviewIndex * reviewCardStep}px)`;
    updateReviewButtons();
    updateReviewCounter();
    updateReviewWindowHeight();
  }

  function nextReview() { goToReview(reviewIndex + 1); }
  function prevReview() { goToReview(reviewIndex - 1); }

  reviewsNext.addEventListener('click', () => {
    nextReview();
    resetReviewAutoplay();
  });

  reviewsPrev.addEventListener('click', () => {
    prevReview();
    resetReviewAutoplay();
  });

  function startReviewAutoplay() {
    stopReviewAutoplay();
    reviewAutoplay = setInterval(() => {
      const maxIdx = Math.max(0, totalReviews - reviewsPerView);
      if (reviewIndex >= maxIdx) {
        goToReview(0);
      } else {
        nextReview();
      }
    }, 4500);
  }

  function stopReviewAutoplay() {
    clearInterval(reviewAutoplay);
  }

  function resetReviewAutoplay() {
    startReviewAutoplay();
  }

  // Touch swipe support
  let touchStartX = 0;

  reviewsTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  reviewsTrack.addEventListener('touchend', (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? nextReview() : prevReview();
      resetReviewAutoplay();
    }
  }, { passive: true });

  // Pause autoplay on hover
  reviewsCarousel.addEventListener('mouseenter', stopReviewAutoplay);
  reviewsCarousel.addEventListener('mouseleave', startReviewAutoplay);

  // Responsive: reinit on window resize
  window.addEventListener('resize', () => {
    clearTimeout(reviewResizeTimer);
    reviewResizeTimer = setTimeout(initReviewsCarousel, 150);
  });

  // Init
  initReviewsCarousel();
  startReviewAutoplay();

  // ──────────────────────────────────────────────────────────
  // 5. FADE-IN on scroll — Intersection Observer
  // ──────────────────────────────────────────────────────────
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.045}s`;
    observer.observe(el);
  });

  // ──────────────────────────────────────────────────────────
  // 6. GALLERY CAROUSEL — single image, dots, autoplay, swipe
  // ──────────────────────────────────────────────────────────
  const galleryCarouselEl  = document.getElementById('galleryCarousel');
  const galleryTrack       = document.getElementById('galleryTrack');
  const gallerySlides      = galleryTrack.querySelectorAll('.gallery-slide');
  const totalGallery       = gallerySlides.length;
  const galleryDots        = document.querySelectorAll('.gallery-carousel__dot');
  let galleryIndex         = 0;
  let galleryAutoplay      = null;

  function goToGallery(index) {
    galleryIndex = ((index % totalGallery) + totalGallery) % totalGallery;
    galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;
    galleryDots.forEach((dot, i) => dot.classList.toggle('active', i === galleryIndex));
  }

  document.getElementById('galleryPrev').addEventListener('click', () => {
    goToGallery(galleryIndex - 1);
    resetGalleryAutoplay();
  });

  document.getElementById('galleryNext').addEventListener('click', () => {
    goToGallery(galleryIndex + 1);
    resetGalleryAutoplay();
  });

  galleryDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToGallery(i);
      resetGalleryAutoplay();
    });
  });

  // Touch swipe
  let galleryTouchStartX = 0;

  galleryTrack.addEventListener('touchstart', (e) => {
    galleryTouchStartX = e.touches[0].clientX;
  }, { passive: true });

  galleryTrack.addEventListener('touchend', (e) => {
    const delta = galleryTouchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? goToGallery(galleryIndex + 1) : goToGallery(galleryIndex - 1);
      resetGalleryAutoplay();
    }
  }, { passive: true });

  function startGalleryAutoplay() {
    stopGalleryAutoplay();
    galleryAutoplay = setInterval(() => goToGallery(galleryIndex + 1), 5000);
  }

  function stopGalleryAutoplay()  { clearInterval(galleryAutoplay); }
  function resetGalleryAutoplay() { startGalleryAutoplay(); }

  galleryCarouselEl.addEventListener('mouseenter', stopGalleryAutoplay);
  galleryCarouselEl.addEventListener('mouseleave', startGalleryAutoplay);

  goToGallery(0);
  startGalleryAutoplay();

});
