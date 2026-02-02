/* ============================================
   CANYON CROWN TREE CO — MAIN JAVASCRIPT
   Adapted from Surgeon Template V2
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initStickyHeader();
  initScrollAnimations();
  initCounters();
  initTestimonialCarousel();
  initBeforeAfterSliders();
  initEstimateModal();
  initGalleryFilter();
  initLightbox();
  initFaqAccordion();
  initBackToTop();
  initSmoothScroll();
  initCurrentYear();
  initFormValidation();
  initParallaxScroll();
  initStaggeredChildren();
  initImageReveal();
});

/* Mobile Menu */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const menu = document.querySelector('.nav-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('active');
    btn.classList.toggle('active');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('active');
      btn.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  menu.querySelectorAll('.has-dropdown > a').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        a.parentElement.classList.toggle('active');
      }
    });
  });
}

/* Sticky Header */
function initStickyHeader() {
  const header = document.querySelector('.header');
  const topBar = document.querySelector('.top-bar');
  if (!header) return;
  const onScroll = () => {
    const scrolled = window.scrollY > 100;
    header.classList.toggle('scrolled', scrolled);
    if (topBar) topBar.classList.toggle('hidden', scrolled);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Scroll Animations */
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('animated', 'animate-' + (entry.target.dataset.animate || 'fade-in-up'));
        }, delay * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* Animated Counters */
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;
  const ease = t => 1 - Math.pow(1 - t, 4);
  const animate = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = target % 1 !== 0 ? 1 : 0;
    const duration = 2000;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const value = ease(progress) * target;
      el.textContent = prefix + value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(animate);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const bar = document.querySelector('.stats-bar');
  if (bar) obs.observe(bar);
}

/* Testimonial Carousel */
function initTestimonialCarousel() {
  const track = document.querySelector('.testimonials-track');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const progressBar = document.querySelector('.testimonial-progress-bar');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0, total = cards.length, autoplay;
  const getVisible = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  const updateProgress = () => {
    if (!progressBar) return;
    const max = Math.max(1, total - getVisible());
    const pct = ((current + 1) / (max + 1)) * 100;
    progressBar.style.width = pct + '%';
  };
  const goTo = (i) => {
    const max = Math.max(0, total - getVisible());
    current = Math.max(0, Math.min(i, max));
    const card = cards[0];
    if (!card) return;
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    const w = card.offsetWidth + gap;
    track.style.transform = `translateX(-${current * w}px)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    updateProgress();
  };
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
  const startAuto = () => { autoplay = setInterval(() => { goTo(current >= Math.max(0, total - getVisible()) ? 0 : current + 1); }, 5000); };
  const stopAuto = () => clearInterval(autoplay);
  track.closest('.testimonials')?.addEventListener('mouseenter', stopAuto);
  track.closest('.testimonials')?.addEventListener('mouseleave', startAuto);
  startAuto();
  updateProgress();
  let startX = 0, diff = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchmove', (e) => { diff = startX - e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', () => { if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1); diff = 0; startAuto(); });
  window.addEventListener('resize', () => goTo(current));
}

/* Before/After Sliders */
function initBeforeAfterSliders() {
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const afterWrap = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    if (!afterWrap || !handle) return;
    let dragging = false;
    const setPos = (x) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      afterWrap.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    };
    setPos(slider.getBoundingClientRect().left + slider.getBoundingClientRect().width / 2);
    slider.addEventListener('mousedown', (e) => { dragging = true; setPos(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove', (e) => { if (dragging) setPos(e.clientX); });
    window.addEventListener('mouseup', () => { dragging = false; });
    slider.addEventListener('touchstart', (e) => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove', (e) => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchend', () => { dragging = false; });
  });
}

/* Free Estimate / Service Finder Modal */
function initEstimateModal() {
  const modal = document.querySelector('.quiz-modal');
  const openBtns = document.querySelectorAll('[data-open-quiz]');
  const closeBtn = modal?.querySelector('.quiz-close');
  const overlay = modal?.querySelector('.quiz-modal-overlay');
  if (!modal) return;
  const questions = [
    { q: "What type of tree service do you need?", opts: [
      { text: "Tree Removal", icon: "fa-tree", tags: ["removal"] },
      { text: "Pruning & Trimming", icon: "fa-cut", tags: ["pruning"] },
      { text: "Stump Grinding", icon: "fa-circle-notch", tags: ["stump"] },
      { text: "Emergency Service", icon: "fa-bolt", tags: ["emergency"] },
      { text: "Not Sure / Other", icon: "fa-question-circle", tags: ["consult"] }
    ]},
    { q: "How urgent is your situation?", opts: [
      { text: "Emergency — tree down or dangerous", tags: ["urgent"] },
      { text: "Soon — within the next week or two", tags: ["soon"] },
      { text: "Planning ahead — no rush", tags: ["planning"] }
    ]},
    { q: "How many trees need attention?", opts: [
      { text: "Just one tree", tags: ["single"] },
      { text: "2–5 trees", tags: ["multiple"] },
      { text: "Large property / many trees", tags: ["large"] }
    ]}
  ];
  let step = 0, answers = [];
  const progBar = modal.querySelector('.quiz-progress-bar');
  const qText = modal.querySelector('.quiz-question-text');
  const optsDiv = modal.querySelector('.quiz-options');
  const resultDiv = modal.querySelector('.quiz-result');
  const open = () => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; step = 0; answers = []; showStep(); };
  const close = () => { modal.classList.remove('active'); document.body.style.overflow = ''; };
  openBtns.forEach(b => b.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const showStep = () => {
    if (step >= questions.length) return showResult();
    if (resultDiv) resultDiv.style.display = 'none';
    if (optsDiv) optsDiv.style.display = 'flex';
    if (qText) qText.style.display = 'block';
    if (progBar) progBar.style.width = ((step + 1) / questions.length * 100) + '%';
    const q = questions[step];
    if (qText) qText.textContent = q.q;
    if (optsDiv) optsDiv.innerHTML = q.opts.map((o, i) =>
      `<button class="quiz-option" data-idx="${i}">${o.icon ? `<i class="fas ${o.icon}"></i>` : ''} ${o.text}</button>`
    ).join('');
    optsDiv?.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        answers.push(...q.opts[idx].tags);
        step++;
        showStep();
      });
    });
  };
  const showResult = () => {
    if (qText) qText.style.display = 'none';
    if (optsDiv) optsDiv.style.display = 'none';
    if (progBar) progBar.style.width = '100%';
    if (!resultDiv) return;
    resultDiv.style.display = 'block';
    const recs = [];
    if (answers.includes('removal')) recs.push({ name: 'Tree Removal', link: 'services/tree-removal.html' });
    if (answers.includes('pruning')) recs.push({ name: 'Pruning & Trimming', link: 'services/pruning-trimming.html' });
    if (answers.includes('stump')) recs.push({ name: 'Stump Grinding', link: 'services/stump-grinding.html' });
    if (answers.includes('emergency') || answers.includes('urgent')) recs.push({ name: 'Emergency Tree Service', link: 'services/emergency-services.html' });
    if (answers.includes('consult')) recs.push({ name: 'Free Consultation', link: 'contact.html' });
    if (!recs.length) recs.push({ name: 'Get a Free Estimate', link: 'contact.html' });
    resultDiv.innerHTML = `<h3>We Recommend</h3><div class="quiz-result-procedures">${recs.map(r =>
      `<a href="${r.link}" class="quiz-result-item"><i class="fas fa-check-circle"></i> <span>${r.name}</span></a>`
    ).join('')}</div><a href="contact.html" class="btn btn-primary">Get Your Free Estimate</a>`;
  };
}

/* Gallery Filter */
function initGalleryFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item[data-category]');
  if (!btns.length) return;
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    items.forEach(item => {
      const match = cat === 'all' || item.dataset.category === cat;
      item.style.display = match ? '' : 'none';
    });
  }));
}

/* Lightbox */
function initLightbox() {
  const lb = document.querySelector('.lightbox');
  if (!lb) return;
  const img = lb.querySelector('img');
  const closeBtn = lb.querySelector('.lightbox-close');
  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      if (img) img.src = el.dataset.lightbox || el.src;
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeLb = () => { lb.classList.remove('active'); document.body.style.overflow = ''; };
  closeBtn?.addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
}

/* FAQ Accordion */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      item.closest('.faq-accordion')?.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* Back to Top */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Smooth Scroll */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = document.querySelector('.header')?.offsetHeight || 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });
}

/* Current Year */
function initCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* Form Validation */
function initFormValidation() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      f.classList.remove('error');
      if (!f.value.trim()) { valid = false; f.classList.add('error'); }
      if (f.type === 'email' && f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) { valid = false; f.classList.add('error'); }
      if (f.type === 'tel' && f.value && f.value.replace(/\D/g,'').length < 10) { valid = false; f.classList.add('error'); }
    });
    if (valid) {
      const btn = form.querySelector('[type="submit"]');
      if (btn) { btn.textContent = 'Message Sent!'; btn.disabled = true; }
    }
  });
}

/* Parallax Scroll */
function initParallaxScroll() {
  if (window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const parallaxSections = document.querySelectorAll('.section-alt, .section-dark');
  const parallaxEls = document.querySelectorAll('[data-parallax="true"]');
  if (!parallaxSections.length && !parallaxEls.length) return;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      parallaxSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        const offset = (rect.top - vh / 2) * 0.08;
        section.style.backgroundPositionY = offset + 'px';
      });
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * 0.15;
        el.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Staggered Children */
function initStaggeredChildren() {
  const grids = document.querySelectorAll(
    '.procedure-category-cards, .features-grid, .gallery-grid, .signature-grid'
  );
  if (!grids.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, i) => {
          child.style.transitionDelay = (i * 0.12) + 's';
          child.classList.add('animated', 'animate-fade-in-up');
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  grids.forEach(grid => {
    Array.from(grid.children).forEach(child => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(30px)';
    });
    obs.observe(grid);
  });
}

/* Image Reveal */
function initImageReveal() {
  const images = document.querySelectorAll('.section img:not(.logo-img)');
  if (!images.length) return;
  images.forEach(img => img.classList.add('img-reveal'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('img-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  images.forEach(img => obs.observe(img));
}

/* Testimonial Progress Bar */
function initTestimonialProgress() {
  const bar = document.querySelector('.testimonial-progress-bar');
  const dots = document.querySelectorAll('.carousel-dot');
  if (!bar || !dots.length) return;
  const update = () => {
    const activeIdx = Array.from(dots).findIndex(d => d.classList.contains('active'));
    const pct = ((activeIdx + 1) / dots.length) * 100;
    bar.style.width = pct + '%';
  };
  const observer = new MutationObserver(update);
  dots.forEach(dot => observer.observe(dot, { attributes: true, attributeFilter: ['class'] }));
  update();
}
setTimeout(initTestimonialProgress, 100);
