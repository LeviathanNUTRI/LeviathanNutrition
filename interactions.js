/* ==============================================================
   LEVIATHAN NUTRITION — interactions.js (v2)
   1) Navbar dinámico al hacer scroll
   2) Título dividido en letras con animación escalonada de entrada
   3) Parallax de la imagen de fondo del hero (scroll + mouse combinados)
   4) Spotlight que sigue el cursor sobre el hero
   5) Chispas ambientales flotantes
   6) Efecto ripple real al hacer click en los botones
   7) Animaciones activadas al hacer scroll (IntersectionObserver)
   8) Link activo del navbar según la sección visible
================================================================= */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1) NAVBAR: cambia transparencia al hacer scroll
  ---------------------------------------------------------- */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     2) TÍTULO: separa cada línea en letras <span> para animarlas
        una por una (efecto de aparición cinematográfico).
  ---------------------------------------------------------- */
  function splitIntoLetters(el, baseDelay) {
    const text = el.getAttribute('data-text') || el.textContent;
    el.innerHTML = '';
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${baseDelay + i * 0.045}s`;
      el.appendChild(span);
    });
  }
  const titleLine1 = document.getElementById('title-line-1');
  const titleLine2 = document.getElementById('title-line-2');
  if (titleLine1) splitIntoLetters(titleLine1, 0.5);
  if (titleLine2) splitIntoLetters(titleLine2, 0.85);

  /* ---------------------------------------------------------
     3) PARALLAX de la imagen de fondo: combina el desplazamiento
        de scroll con un desplazamiento sutil del mouse, usando
        requestAnimationFrame + interpolación (lerp) para que el
        movimiento sea fluido y no brusco.
  ---------------------------------------------------------- */
  const heroSection = document.getElementById('inicio');
  const bgLayer = document.getElementById('hero-bg-layer');
  const spotlight = document.getElementById('hero-spotlight');

  if (heroSection && bgLayer && !prefersReducedMotion) {
    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;
    const MAX_MOUSE_OFFSET = 14; // px, sutil

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = relX * MAX_MOUSE_OFFSET * 2;
      targetMouseY = relY * MAX_MOUSE_OFFSET;

      if (spotlight) {
        spotlight.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        spotlight.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      targetMouseX = 0;
      targetMouseY = 0;
    });

    function lerp(a, b, t) { return a + (b - a) * t; }

    function renderParallax() {
      currentMouseX = lerp(currentMouseX, targetMouseX, 0.06);
      currentMouseY = lerp(currentMouseY, targetMouseY, 0.06);

      const scrollOffset = Math.min(window.scrollY * 0.18, 120);

      bgLayer.style.transform =
        `translate3d(${currentMouseX}px, ${currentMouseY + scrollOffset}px, 0) scale(1.08)`;

      requestAnimationFrame(renderParallax);
    }
    requestAnimationFrame(renderParallax);
  }

  /* ---------------------------------------------------------
     4) CHISPAS ambientales sobre el hero
  ---------------------------------------------------------- */
  const sparksContainer = document.getElementById('hero-sparks');
  if (sparksContainer && !prefersReducedMotion) {
    const SPARK_COUNT = 22;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < SPARK_COUNT; i++) {
      const spark = document.createElement('span');
      const size = Math.random() * 3 + 1.5;
      const left = Math.random() * 100;
      const duration = Math.random() * 8 + 8;
      const delay = Math.random() * 10;
      const isGreen = Math.random() < 0.2;
      const color = isGreen ? '#39FF8A' : '#5FD4FF';

      spark.style.position = 'absolute';
      spark.style.bottom = '0%';
      spark.style.left = left + '%';
      spark.style.width = size + 'px';
      spark.style.height = size + 'px';
      spark.style.borderRadius = '999px';
      spark.style.background = color;
      spark.style.boxShadow = `0 0 ${size * 3}px ${color}`;
      spark.style.opacity = '0';
      spark.style.animation = `spark-rise ${duration}s ease-in ${delay}s infinite`;

      frag.appendChild(spark);
    }
    sparksContainer.appendChild(frag);

    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes spark-rise {
        0%   { transform: translateY(0) scale(1); opacity: 0; }
        8%   { opacity: 0.9; }
        80%  { opacity: 0.35; }
        100% { transform: translateY(-70vh) scale(0.3); opacity: 0; }
      }
    `;
    document.head.appendChild(styleTag);
  }

  /* ---------------------------------------------------------
     5) RIPPLE real en botones (click)
  ---------------------------------------------------------- */
  document.querySelectorAll('[data-ripple]').forEach((btn) => {
    btn.style.position = btn.style.position || 'relative';
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------------------------------------------------------
     6) SCROLL REVEAL: anima secciones bajo el pliegue (trust bar,
        marcas) solo cuando entran en el viewport.
  ---------------------------------------------------------- */
  const scrollRevealEls = document.querySelectorAll('.reveal-on-scroll');
  if (scrollRevealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    scrollRevealEls.forEach((el) => revealObserver.observe(el));
  } else {
    scrollRevealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     7) NAV LINK activo según la sección visible
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------------------------------------------------------
     8) TOASTS: notificaciones flotantes reutilizables
  ---------------------------------------------------------- */
  const toastContainer = document.getElementById('toast-container');
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  /* ---------------------------------------------------------
     9) FILTROS DE PRODUCTOS
  ---------------------------------------------------------- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');

  function applyFilter(filter) {
    filterTabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.filter === filter));
    productCards.forEach((card) => {
      const matches = filter === 'todos' || card.dataset.category === filter;
      card.classList.toggle('is-filtered-out', !matches);
      if (matches) {
        card.classList.remove('is-visible');
        // fuerza reflow para poder re-disparar la animación de entrada
        void card.offsetWidth;
        card.classList.add('is-visible');
      }
    });
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
  });

  // Los tiles de categorías también filtran el catálogo al hacer click
  document.querySelectorAll('[data-category-filter]').forEach((tile) => {
    tile.addEventListener('click', (e) => {
      const filter = tile.dataset.categoryFilter;
      const matchingTab = document.querySelector(`.filter-tab[data-filter="${filter}"]`);
      if (matchingTab) {
        e.preventDefault();
        applyFilter(filter);
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Animación inicial de entrada de las tarjetas visibles
  productCards.forEach((card, i) => {
    setTimeout(() => card.classList.add('is-visible'), 100 + i * 60);
  });

  /* ---------------------------------------------------------
     10) CARRITO DE COMPRAS (estado en memoria + drawer + badge)
  ---------------------------------------------------------- */
  const cart = []; // { name, price, img, qty }

  const cartCountEl = document.getElementById('cart-count');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartTriggerBtn = document.querySelector('[aria-label="Carrito"]');
  const cartCloseBtn = document.getElementById('cart-close-btn');

  function parsePrice(str) {
    return parseFloat(String(str).replace(/[^\d.]/g, '')) || 0;
  }

  function openCart() {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
  }
  if (cartTriggerBtn) cartTriggerBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function addToCart({ name, price, img }) {
    const existing = cart.find((item) => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price: parsePrice(price), img, qty: 1 });
    }
    renderCart();
    updateCartBadge();
    showToast(`Añadido al carrito: ${name}`);
  }

  function updateCartBadge() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) {
      cartCountEl.textContent = totalQty;
      cartCountEl.style.animation = 'none';
      void cartCountEl.offsetWidth;
      cartCountEl.style.animation = 'badge-pulse 2.4s ease-in-out infinite, badge-pop 0.4s ease-out';
    }
  }

  function renderCart() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>Tu carrito está vacío.<br>Explora nuestros productos y desata tu poder.</p>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = 'S/ 0';
      return;
    }

    let subtotal = 0;
    cart.forEach((item, index) => {
      subtotal += item.price * item.qty;
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" onerror="this.style.opacity='0.15'">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">S/ ${item.price.toFixed(0)}</p>
          <div class="cart-item-qty-row">
            <button class="qty-btn" data-action="decrease" data-index="${index}">−</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
            <button class="cart-item-remove" data-action="remove" data-index="${index}" aria-label="Quitar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12z"/></svg>
            </button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(el);
    });

    if (cartSubtotalEl) cartSubtotalEl.textContent = `S/ ${subtotal.toFixed(0)}`;
  }

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const index = parseInt(btn.dataset.index, 10);
      const action = btn.dataset.action;
      if (action === 'increase') cart[index].qty += 1;
      if (action === 'decrease') cart[index].qty = Math.max(1, cart[index].qty - 1);
      if (action === 'remove') cart.splice(index, 1);
      renderCart();
      updateCartBadge();
    });
  }

  // Conecta cada botón "Añadir al carrito" de las tarjetas de producto
  document.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (!card) return;
      addToCart({
        name: card.dataset.name,
        price: card.dataset.price,
        img: card.dataset.img,
      });
      btn.classList.add('is-added');
      setTimeout(() => btn.classList.remove('is-added'), 900);
    });
  });

  // Botón de checkout: simula el envío del pedido (sin backend)
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Tu carrito está vacío');
        return;
      }
      const label = checkoutBtn.querySelector('span');
      const originalText = label.textContent;
      label.textContent = 'Procesando...';
      checkoutBtn.classList.add('is-loading');
      setTimeout(() => {
        checkoutBtn.classList.remove('is-loading');
        checkoutBtn.classList.add('is-success');
        label.textContent = '¡Pedido Confirmado!';
        showToast('Pedido recibido. Te contactaremos para coordinar el pago y envío.');
        setTimeout(() => {
          cart.length = 0;
          renderCart();
          updateCartBadge();
          closeCart();
          checkoutBtn.classList.remove('is-success');
          label.textContent = originalText;
        }, 2200);
      }, 1400);
    });
  }

  renderCart();

  // Inyecta el keyframe del "pop" del badge del carrito
  const badgeStyleTag = document.createElement('style');
  badgeStyleTag.textContent = `
    @keyframes badge-pop {
      0% { transform: scale(1); }
      40% { transform: scale(1.6); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(badgeStyleTag);

  /* ---------------------------------------------------------
     11) MODAL DE VISTA RÁPIDA
  ---------------------------------------------------------- */
  const quickviewOverlay = document.getElementById('quickview-overlay');
  const quickviewModal = document.getElementById('quickview-modal');
  const quickviewCloseBtn = document.getElementById('quickview-close-btn');
  let quickviewCurrentProduct = null;

  function openQuickview(card) {
    const name = card.dataset.name;
    const price = card.dataset.price;
    const img = card.dataset.img;
    const catLabel = card.dataset.catLabel;
    const ratingHTML = card.querySelector('.product-rating')?.innerHTML || '';

    document.getElementById('quickview-name').textContent = name;
    document.getElementById('quickview-price').textContent = price;
    document.getElementById('quickview-cat').textContent = catLabel;
    document.getElementById('quickview-rating').innerHTML = ratingHTML;

    const imgEl = document.getElementById('quickview-img');
    imgEl.src = img;
    imgEl.alt = name;

    quickviewCurrentProduct = { name, price, img };

    quickviewModal.classList.add('is-open');
    quickviewOverlay.classList.add('is-open');
    quickviewModal.setAttribute('aria-hidden', 'false');
  }
  function closeQuickview() {
    quickviewModal.classList.remove('is-open');
    quickviewOverlay.classList.remove('is-open');
    quickviewModal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.quick-view-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (card) openQuickview(card);
    });
  });
  if (quickviewCloseBtn) quickviewCloseBtn.addEventListener('click', closeQuickview);
  if (quickviewOverlay) quickviewOverlay.addEventListener('click', closeQuickview);

  const quickviewAddBtn = document.getElementById('quickview-add-btn');
  if (quickviewAddBtn) {
    quickviewAddBtn.addEventListener('click', () => {
      if (quickviewCurrentProduct) {
        addToCart(quickviewCurrentProduct);
        closeQuickview();
      }
    });
  }

  // Cierra los overlays con la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeQuickview();
    }
  });

  /* ---------------------------------------------------------
     12) CONTADORES ANIMADOS (sección Nosotros)
  ---------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.countTo, 10) || 0;
          const suffix = el.dataset.suffix || '';
          const duration = 1800;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString('es-PE') + suffix;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString('es-PE') + suffix;
          }
          requestAnimationFrame(tick);
          statObserver.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    statNumbers.forEach((el) => statObserver.observe(el));
  }

  /* ---------------------------------------------------------
     13) FORMULARIO DE CONTACTO (validación + envío simulado)
  ---------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      contactForm.querySelectorAll('input, textarea').forEach((field) => {
        const wrapper = field.closest('.form-field');
        if (field.hasAttribute('required') && !field.value.trim()) {
          wrapper.classList.add('field-error');
          valid = false;
        } else {
          wrapper.classList.remove('field-error');
        }
      });
      if (!valid) {
        showToast('Completa los campos requeridos');
        return;
      }

      const btn = document.getElementById('contact-submit-btn');
      const label = document.getElementById('contact-submit-label');
      btn.classList.add('is-loading');
      label.textContent = 'Enviando...';

      setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.classList.add('is-success');
        label.textContent = '¡Mensaje Enviado!';
        showToast('Gracias por escribirnos. Te responderemos pronto.');
        contactForm.reset();
        setTimeout(() => {
          btn.classList.remove('is-success');
          label.textContent = 'Enviar Mensaje';
        }, 2400);
      }, 1200);
    });
  }

  /* ---------------------------------------------------------
     14) NEWSLETTER (footer)
  ---------------------------------------------------------- */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      newsletterForm.classList.add('is-subscribed');
      showToast('¡Suscripción exitosa! Bienvenido a la manada.');
      newsletterForm.reset();
    });
  }
})();
