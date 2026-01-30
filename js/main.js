/**
 * Canyon Crown Tree - Main JavaScript
 * Architecture: Individual init functions called from DOMContentLoaded
 * Clean, modular vanilla JS — no dependencies
 */

document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initStickyHeader();
  initBackToTop();
  initDropdowns();
  initFaqAccordion();
  initSmoothScroll();
  initCurrentYear();
  initAnimations();
  initLazyLoad();
});

/* ============================================================
   UTILITY: Debounce
   ============================================================ */
function debounce(fn, delay) {
  var timer;
  return function() {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}

/* ============================================================
   UTILITY: Throttle
   ============================================================ */
function throttle(fn, limit) {
  var inThrottle = false;
  return function() {
    var context = this;
    var args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      inThrottle = true;
      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
  };
}

/* ============================================================
   1. Mobile Menu
   ============================================================ */
function initMobileMenu() {
  var menuBtn = document.querySelector('.mobile-menu-btn');
  var navMenu = document.querySelector('.nav-menu');
  var hamburger = document.querySelector('.hamburger');

  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = navMenu.classList.contains('active');

    if (isOpen) {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      navMenu.classList.add('active');
      menuBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  // Close menu when clicking a nav link
  var navLinks = navMenu.querySelectorAll('a');
  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener('click', function() {
      if (window.innerWidth < 768) {
        navMenu.classList.remove('active');
        menuBtn.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Close menu on outside click
  document.addEventListener('click', function(e) {
    if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Mobile dropdown toggles
  var dropdownLinks = navMenu.querySelectorAll('.has-dropdown > a');
  for (var j = 0; j < dropdownLinks.length; j++) {
    dropdownLinks[j].addEventListener('click', function(e) {
      if (window.innerWidth >= 768) return;
      e.preventDefault();
      var parent = this.parentElement;
      var isOpen = parent.classList.contains('active');

      // Close all other dropdowns
      var allDropdowns = navMenu.querySelectorAll('.has-dropdown');
      for (var k = 0; k < allDropdowns.length; k++) {
        allDropdowns[k].classList.remove('active');
      }

      // Toggle the clicked one
      if (!isOpen) {
        parent.classList.add('active');
      }
    });
  }

  // Close mobile nav on resize past breakpoint
  window.addEventListener('resize', debounce(function() {
    if (window.innerWidth >= 768) {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  }, 200));
}

/* ============================================================
   2. Sticky Header
   ============================================================ */
function initStickyHeader() {
  var header = document.querySelector('.header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', throttle(onScroll, 100), { passive: true });
  onScroll();
}

/* ============================================================
   3. Back to Top
   ============================================================ */
function initBackToTop() {
  var btn = document.querySelector('.back-to-top');
  if (!btn) return;

  function toggleVisibility() {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', throttle(toggleVisibility, 150), { passive: true });
  toggleVisibility();

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   4. Dropdowns (Desktop hover with delay)
   ============================================================ */
function initDropdowns() {
  var dropdownParents = document.querySelectorAll('.has-dropdown');

  for (var i = 0; i < dropdownParents.length; i++) {
    (function(parent) {
      var dropdown = parent.querySelector('.dropdown');
      if (!dropdown) return;

      var closeTimer = null;

      parent.addEventListener('mouseenter', function() {
        if (window.innerWidth < 768) return;
        clearTimeout(closeTimer);
        dropdown.classList.add('active');
        parent.classList.add('active');
      });

      parent.addEventListener('mouseleave', function() {
        if (window.innerWidth < 768) return;
        closeTimer = setTimeout(function() {
          dropdown.classList.remove('active');
          parent.classList.remove('active');
        }, 150);
      });
    })(dropdownParents[i]);
  }
}

/* ============================================================
   5. FAQ Accordion (single-open pattern)
   ============================================================ */
function initFaqAccordion() {
  var faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  for (var i = 0; i < faqItems.length; i++) {
    (function(item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      question.addEventListener('click', function() {
        var isOpen = item.classList.contains('active');

        // Close all FAQ items
        for (var j = 0; j < faqItems.length; j++) {
          faqItems[j].classList.remove('active');
          var otherAnswer = faqItems[j].querySelector('.faq-answer');
          if (otherAnswer) {
            otherAnswer.style.maxHeight = null;
          }
        }

        // Toggle the clicked item
        if (!isOpen) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    })(faqItems[i]);
  }
}

/* ============================================================
   6. Smooth Scroll (anchor links, accounts for header height)
   ============================================================ */
function initSmoothScroll() {
  var anchors = document.querySelectorAll('a[href^="#"]');

  for (var i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#' || href === '') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var header = document.querySelector('.header');
      var headerHeight = header ? header.offsetHeight : 0;
      var targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    });
  }
}

/* ============================================================
   7. Current Year
   ============================================================ */
function initCurrentYear() {
  var yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ============================================================
   8. Scroll Animations (IntersectionObserver fade-in-up)
   ============================================================ */
function initAnimations() {
  var selectors = '.service-category, .testimonial-card, .feature, .gallery-item';
  var elements = document.querySelectorAll(selectors);

  if (!elements.length) return;

  // Check for IntersectionObserver support
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.add('animated');
    }
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        entries[j].target.classList.add('animated');
        observer.unobserve(entries[j].target);
      }
    }
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  for (var k = 0; k < elements.length; k++) {
    observer.observe(elements[k]);
  }
}

/* ============================================================
   9. Form Validation
   ============================================================ */
function validateForm(form) {
  var fields = form.querySelectorAll('input, textarea, select');
  var isValid = true;

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var value = field.value.trim();
    var error = '';
    var name = field.getAttribute('name') || field.id || '';

    // Required check
    if (field.hasAttribute('required') && value === '') {
      error = 'This field is required.';
    }

    // Email validation
    if (!error && field.type === 'email' && value !== '') {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Please enter a valid email address.';
      }
    }

    // Phone validation
    if (!error && (field.type === 'tel' || name === 'phone') && value !== '') {
      var phoneRegex = /^[\d\s\-\(\)\+]{7,20}$/;
      if (!phoneRegex.test(value)) {
        error = 'Please enter a valid phone number.';
      }
    }

    // Show or clear error
    var wrapper = field.closest('.form-group') || field.parentElement;
    var errorEl = wrapper.querySelector('.field-error');

    if (error) {
      isValid = false;
      field.classList.add('error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        wrapper.appendChild(errorEl);
      }
      errorEl.textContent = error;
    } else {
      field.classList.remove('error');
      if (errorEl) errorEl.remove();
    }
  }

  // Focus the first field with an error
  if (!isValid) {
    var firstError = form.querySelector('.error');
    if (firstError) firstError.focus();
  }

  return isValid;
}

/* ============================================================
   10. Lazy Load Images
   ============================================================ */
function initLazyLoad() {
  var images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  // Fallback if IntersectionObserver not supported
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < images.length; i++) {
      images[i].src = images[i].dataset.src;
      if (images[i].dataset.srcset) {
        images[i].srcset = images[i].dataset.srcset;
      }
      images[i].classList.add('loaded');
    }
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        var img = entries[j].target;
        img.src = img.dataset.src;
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        img.classList.add('loaded');
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    }
  }, {
    rootMargin: '200px 0px'
  });

  for (var k = 0; k < images.length; k++) {
    observer.observe(images[k]);
  }
}
