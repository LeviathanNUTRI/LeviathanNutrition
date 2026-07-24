/* ==============================================================
   LEVIATHAN NUTRITION — interactions.js (v7)
   - Imagen dinámica según combinación de sabor + peso + regalo
   - Fallback automático: si la imagen con regalo no existe, usa la sin regalo
   - Fallback para "vainilla" → "vaivinilla" (por error tipográfico)
   - Descuento progresivo del 5% en unidades adicionales
   - Precio total y unitario efectivo en el modal
   - Carrito con cantidades y precios con descuento
   - Toda la funcionalidad existente (navbar, scroll, búsqueda, etc.)
================================================================= */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1) NAVBAR
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
     2) TÍTULO PRINCIPAL (DESATA TU PODER)
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
     3) ANIMACIÓN TÍTULO CATEGORÍAS
  ---------------------------------------------------------- */
  function animateCategoryTitle() {
    const titleEl = document.querySelector('.category-title-animate');
    if (!titleEl || prefersReducedMotion) return;
    const textContent = titleEl.textContent.trim();
    titleEl.innerHTML = '';
    const words = textContent.split(' ');
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'category-word';
      [...word].forEach((char, charIndex) => {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'category-letter';
        letterSpan.textContent = char;
        const globalIndex = wordIndex * 6 + charIndex;
        letterSpan.style.animationDelay = `${0.2 + globalIndex * 0.06}s`;
        wordSpan.appendChild(letterSpan);
      });
      titleEl.appendChild(wordSpan);
      if (wordIndex < words.length - 1) {
        const space = document.createTextNode(' ');
        titleEl.appendChild(space);
      }
    });
    if (!document.getElementById('category-letter-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'category-letter-styles';
      styleTag.textContent = `
        .category-letter {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px) scale(0.8) rotateX(20deg);
          animation: categoryLetterIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: 'Anton', sans-serif;
          background: linear-gradient(120deg, #ffffff 30%, var(--lv-cyan) 80%, var(--lv-blue) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 20px rgba(30,155,255,0.3);
        }
        @keyframes categoryLetterIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.8) rotateX(20deg); }
          60% { opacity: 1; transform: translateY(-4px) scale(1.05) rotateX(0deg); text-shadow: 0 0 30px rgba(30,155,255,0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); text-shadow: 0 0 20px rgba(30,155,255,0.3); }
        }
        .category-word {
          display: inline-block;
          white-space: nowrap;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateCategoryTitle);
  } else {
    animateCategoryTitle();
  }

  /* ---------------------------------------------------------
     4) PARALLAX DEL HERO
  ---------------------------------------------------------- */
  const heroSection = document.getElementById('inicio');
  const bgLayer = document.getElementById('hero-bg-layer');
  const spotlight = document.getElementById('hero-spotlight');
  if (heroSection && bgLayer && !prefersReducedMotion) {
    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;
    const MAX_MOUSE_OFFSET = 14;
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
     5) CHISPAS AMBIENTALES
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
     6) RIPPLE EN BOTONES
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
     7) SCROLL REVEAL
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
      }, { threshold: 0.15 }
    );
    scrollRevealEls.forEach((el) => revealObserver.observe(el));
  } else {
    scrollRevealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     8) NAV LINK ACTIVO
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
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------------------------------------------------------
     9) TOASTS
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
     10) ORDENAMIENTO DE PRODUCTOS
  ---------------------------------------------------------- */
  function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    const productGrid = document.getElementById('product-grid');
    if (!sortSelect || !productGrid) return;
    let productCards = [];
    function refreshProductCache() {
      productCards = Array.from(document.querySelectorAll('.product-card'))
        .filter(card => card.style.display !== 'none');
    }
    function sortProducts(criteria) {
      refreshProductCache();
      if (productCards.length === 0) return;
      const parent = productCards[0].parentNode;
      productCards.sort((a, b) => {
        if (criteria === 'price-desc') {
          const priceA = parseFloat(a.dataset.price.replace(/[^\d.]/g, '')) || 0;
          const priceB = parseFloat(b.dataset.price.replace(/[^\d.]/g, '')) || 0;
          return priceB - priceA;
        }
        return 0;
      });
      productCards.forEach((card, index) => {
        card.classList.remove('is-visible');
        if (index === 0) {
          parent.insertBefore(card, parent.firstChild);
        } else {
          parent.insertBefore(card, productCards[index - 1].nextSibling);
        }
        requestAnimationFrame(() => {
          card.classList.add('is-visible');
        });
      });
    }
    let sortTimeout;
    sortSelect.addEventListener('change', (e) => {
      clearTimeout(sortTimeout);
      sortTimeout = setTimeout(() => sortProducts(e.target.value), 100);
    });
    document.querySelectorAll('.product-card:not([style*="display: none"])').forEach((card, i) => {
      setTimeout(() => card.classList.add('is-visible'), 100 + i * 60);
    });
  }
  initSorting();

  /* ---------------------------------------------------------
     11) CARRITO DE COMPRAS (con cantidades y descuento)
  ---------------------------------------------------------- */
  const cart = [];
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
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (cartTriggerBtn) cartTriggerBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeQuickview();
    }
  });

  function addToCart({ name, price, img, qty = 1 }) {
    const existing = cart.find((item) => item.name === name);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ name, price: parsePrice(price), img, qty });
    }
    renderCart();
    updateCartBadge();
    showToast(`Añadido al carrito: ${name} x${qty}`);
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
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" onerror="this.style.opacity='0.15'">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">S/ ${item.price.toFixed(0)} c/u</p>
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

  document.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (!card) return;
      addToCart({
        name: card.dataset.name,
        price: card.dataset.price,
        img: card.dataset.img,
        qty: 1,
      });
      btn.classList.add('is-added');
      setTimeout(() => btn.classList.remove('is-added'), 900);
    });
  });

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

  /* ---------------------------------------------------------
     12) MODAL DE VISTA RÁPIDA (QUICKVIEW) — ACTUALIZADO CON REGALOS Y FALLBACKS
  ---------------------------------------------------------- */
  const WHATSAPP_NUMBER = '51987654321';

  // BASE DE DATOS DE PRODUCTOS (con imageResolver mejorado)
  const PRODUCT_DB = {
    'whey-pro-creatine': {
      name: 'WHEY PRO + CREATINE 1.1 KG + REGALOS',
      rating: 4.9,
      reviews: 312,
      description: 'Despierta a la bestia que llevas dentro. Lleva tu rendimiento al extremo y domina el gimnasio con nuestro pack de fuerza y construcción muscular.',
      basePrice: 89.90,
      oldPrice: 110,
      defaultImage: 'assets/img/COMBO WEY PRO_CREATINE_chocolate_1.1kg.png',
      attributes: [
        {
          key: 'sabor',
          label: 'Sabores',
          options: [
            { id: 'chocolate', label: 'Chocolate' },
            { id: 'vainilla', label: 'Vainilla' },
            { id: 'cookies', label: 'Cookies & Cream' },
          ],
        },
        {
          key: 'peso',
          label: 'Whey Pro P.Neto',
          options: [
            { id: '1.1kg', label: '1.1 kg', priceDelta: 0 },
            { id: '2.5kg', label: '2.5 kg', priceDelta: 45 },
            { id: '3kg', label: '3 kg', priceDelta: 90 },
          ],
        },
        {
          key: 'regalo',
          label: 'Regalo',
          options: [
            { id: 'bebidas energeticas', label: '2 bebidas energeticas' },
            { id: 'diabolus', label: '2 diabolus' },
            { id: 'sin-regalo', label: 'Sin regalo' },
          ],
        },
      ],
      // imageResolver ahora devuelve un ARRAY de rutas (orden de prioridad)
      imageResolver: function(selections) {
        // Mapa de sabores: normalizar "vainilla" → también probar "vaivinilla"
        const saborVariants = {
          'chocolate': ['chocolate'],
          'vainilla': ['vainilla', 'vaivinilla'], // fallback por error tipográfico
          'cookies': ['Cookies & Cream']
        };
        const saborList = saborVariants[selections.sabor] || [selections.sabor];
        const peso = selections.peso || '1.1kg';
        const regalo = selections.regalo || 'sin-regalo';
        const baseName = 'COMBO WEY PRO_CREATINE';

        const rutas = [];

        // 1. Primero, rutas CON regalo (si el regalo no es "sin-regalo")
        if (regalo !== 'sin-regalo') {
          for (const sabor of saborList) {
            rutas.push(`assets/img/${baseName}_${sabor}_${peso}_${regalo}.png`);
          }
        }

        // 2. Luego, rutas SIN regalo (fallback)
        for (const sabor of saborList) {
          rutas.push(`assets/img/${baseName}_${sabor}_${peso}.png`);
        }

        // 3. Finalmente, la imagen por defecto (por si todo falla)
        rutas.push(`assets/img/${baseName}_chocolate_1.1kg.png`);

        return rutas;
      }
    },
  };

  function slugify(str) {
    return String(str || 'producto')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function buildGenericProduct(card) {
    const name = card.dataset.name || 'Producto';
    const img = card.dataset.img || '';
    const catLabel = card.dataset.catLabel || '';
    const ratingEl = card.querySelector('.product-rating');
    let rating = 4.8, reviews = 0;
    if (ratingEl) {
      const text = ratingEl.textContent || '';
      const m = text.match(/(\d+(?:\.\d+)?)\D*(?:\((\d+)\))?/);
      if (m) {
        rating = parseFloat(m[1]) || rating;
        reviews = parseInt(m[2], 10) || 0;
      }
    }
    return {
      name,
      rating,
      reviews,
      description: `Fórmula premium de ${catLabel || 'Leviathan Nutrition'} diseñada para potenciar tu rendimiento.`,
      basePrice: parsePrice(card.dataset.price),
      oldPrice: null,
      defaultImage: img,
      attributes: [
        { key: 'sabor', label: 'Sabores', options: [{ id: 'original', label: 'Original' }] },
        { key: 'peso', label: 'Presentación', options: [{ id: 'unico', label: 'Único', priceDelta: 0 }] },
        { key: 'regalo', label: 'Regalo', options: [{ id: 'sin-regalo', label: 'Sin regalo' }] },
      ],
      // Para productos genéricos, imageResolver devuelve un array con la imagen por defecto
      imageResolver: function(selections) {
        return [this.defaultImage];
      }
    };
  }

  function getProductForCard(card) {
    const id = card.dataset.id || slugify(card.dataset.name);
    const richData = PRODUCT_DB[id];
    return richData ? Object.assign({ id }, richData) : Object.assign({ id }, buildGenericProduct(card));
  }

  // -------- Elementos del modal --------
  const quickviewOverlay = document.getElementById('quickview-overlay');
  const quickviewModal = document.getElementById('quickview-modal');
  const quickviewCloseBtn = document.getElementById('quickview-close-btn');
  const pcardInner = document.getElementById('pcard-capture');
  const pcardImgEl = document.getElementById('quickview-img');
  const pcardNameEl = document.getElementById('quickview-name');
  const pcardRatingEl = document.getElementById('quickview-rating');
  const pcardDescEl = document.getElementById('quickview-desc');
  const pcardOptionsEl = document.getElementById('pcard-options');
  const pcardPriceEl = document.getElementById('quickview-price');
  const pcardPriceOldEl = document.getElementById('quickview-price-old');
  const pcardAddBtn = document.getElementById('quickview-add-btn');
  const pcardWhatsappBtn = document.getElementById('quickview-whatsapp-btn');
  const pcardCameraBtn = document.getElementById('pcard-camera-btn');
  const pcardMenuBtn = document.getElementById('pcard-menu-btn');
  const pcardContextMenu = document.getElementById('pcard-context-menu');
  const pcardShareMenu = document.getElementById('pcard-share-menu');

  let currentProduct = null;
  let currentSelection = {};
  let currentQty = 1;

  function starsHTML(rating) {
    const full = Math.round(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }

  function findAttrOption(attr, optionId) {
    return attr.options.find((o) => o.id === optionId) || attr.options[0];
  }

  function computeBasePrice() {
    let price = currentProduct.basePrice || 0;
    currentProduct.attributes.forEach((attr) => {
      const selId = currentSelection[attr.key];
      const opt = findAttrOption(attr, selId);
      if (opt && opt.priceDelta) price += opt.priceDelta;
    });
    return price;
  }

  function computeTotalPrice() {
    const unitPrice = computeBasePrice();
    const qty = Math.max(1, currentQty);
    if (qty === 1) return unitPrice;
    const discount = unitPrice * 0.05;
    return (unitPrice * qty) - (discount * (qty - 1));
  }

  function computeEffectiveUnitPrice() {
    const qty = Math.max(1, currentQty);
    return computeTotalPrice() / qty;
  }

  // Obtiene la lista de rutas de imagen (array)
  function currentVariantImagePaths() {
    if (currentProduct && typeof currentProduct.imageResolver === 'function') {
      return currentProduct.imageResolver(currentSelection);
    }
    // Fallback: buscar en atributos con 'image'
    for (const attr of currentProduct.attributes) {
      const opt = findAttrOption(attr, currentSelection[attr.key]);
      if (opt && opt.image) return [opt.image];
    }
    return [currentProduct.defaultImage];
  }

  // Intenta cargar una imagen probando varias rutas (fallback automático)
  function updateImage() {
    const rutas = currentVariantImagePaths();
    if (!pcardImgEl || rutas.length === 0) return;

    let index = 0;

    function tryNext() {
      if (index >= rutas.length) {
        // Si todas fallan, mostrar un placeholder
        pcardImgEl.src = '';
        pcardImgEl.alt = 'Imagen no disponible';
        return;
      }
      const src = rutas[index];
      pcardImgEl.classList.add('is-fading');
      pcardImgEl.src = src;
      // Cuando la imagen se cargue correctamente, limpiamos el error y salimos
      pcardImgEl.onload = function() {
        pcardImgEl.classList.remove('is-fading');
        pcardImgEl.onerror = null; // limpiamos para que no se llame de nuevo
      };
      pcardImgEl.onerror = function() {
        // Si falla esta ruta, pasamos a la siguiente
        index++;
        tryNext();
      };
    }

    tryNext();
  }

  function updatePrice() {
    if (!pcardPriceEl) return;
    pcardPriceEl.classList.add('is-updating');
    setTimeout(() => {
      const total = computeTotalPrice();
      const unit = computeEffectiveUnitPrice();
      let displayText = `S/ ${total.toFixed(2)}`;
      if (currentQty > 1) {
        displayText += ` (${currentQty} unid., ${unit.toFixed(0)} c/u)`;
      }
      pcardPriceEl.textContent = displayText;
      pcardPriceEl.classList.remove('is-updating');
    }, 180);
    if (pcardPriceOldEl) {
      const unitPrice = computeBasePrice();
      if (currentQty > 1) {
        pcardPriceOldEl.textContent = `S/ ${(unitPrice * currentQty).toFixed(2)} (sin descuento)`;
      } else {
        pcardPriceOldEl.textContent = currentProduct.oldPrice ? `S/ ${currentProduct.oldPrice}` : '';
      }
    }
  }

  function closeAllOptionDropdowns() {
    pcardOptionsEl.querySelectorAll('.pcard-opt.is-open').forEach((el) => {
      el.classList.remove('is-open');
      el.querySelector('.pcard-opt-toggle')?.setAttribute('aria-expanded', 'false');
      el.querySelector('.pcard-opt-dropdown')?.classList.remove('is-open');
    });
  }

  function renderOptions() {
    pcardOptionsEl.innerHTML = '';
    const attrs = currentProduct.attributes;
    const rows = [attrs.slice(0, 2), attrs.slice(2, 3)];

    rows.forEach((rowAttrs, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'pcard-opt-row';

      rowAttrs.forEach((attr) => {
        const selectedId = currentSelection[attr.key] || attr.options[0].id;
        const selectedOpt = findAttrOption(attr, selectedId);

        const optEl = document.createElement('div');
        optEl.className = 'pcard-opt';
        optEl.dataset.attr = attr.key;
        optEl.innerHTML = `
          <span class="pcard-opt-label">${attr.label}</span>
          <button type="button" class="pcard-opt-toggle" aria-haspopup="true" aria-expanded="false">
            <span class="pcard-opt-value">${selectedOpt.label}</span>
            <span class="pcard-opt-plus">+</span>
          </button>
          <div class="pcard-opt-dropdown" role="menu">
            ${attr.options.map((o) => `<button type="button" class="pcard-opt-item${o.id === selectedId ? ' is-selected' : ''}" data-value="${o.id}" role="menuitem">${o.label}</button>`).join('')}
          </div>
        `;
        rowEl.appendChild(optEl);
      });

      if (rowIndex === 1) {
        const qtyEl = document.createElement('div');
        qtyEl.className = 'pcard-qty-wrap';
        qtyEl.innerHTML = `
          <span class="pcard-opt-label">Cantidad</span>
          <input type="number" min="1" step="1" value="${currentQty}" class="pcard-qty-input" id="pcard-qty" aria-label="Cantidad">
        `;
        rowEl.appendChild(qtyEl);
      }

      pcardOptionsEl.appendChild(rowEl);
    });
  }

  // Delegación de eventos
  pcardOptionsEl.addEventListener('click', (e) => {
    const toggle = e.target.closest('.pcard-opt-toggle');
    const item = e.target.closest('.pcard-opt-item');

    if (toggle) {
      const optEl = toggle.closest('.pcard-opt');
      const wasOpen = optEl.classList.contains('is-open');
      closeAllOptionDropdowns();
      if (!wasOpen) {
        optEl.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        optEl.querySelector('.pcard-opt-dropdown').classList.add('is-open');
      }
      return;
    }

    if (item) {
      const optEl = item.closest('.pcard-opt');
      const attrKey = optEl.dataset.attr;
      const value = item.dataset.value;
      currentSelection[attrKey] = value;

      const attr = currentProduct.attributes.find((a) => a.key === attrKey);
      const opt = findAttrOption(attr, value);
      optEl.querySelector('.pcard-opt-value').textContent = opt.label;
      optEl.querySelectorAll('.pcard-opt-item').forEach((el) => el.classList.toggle('is-selected', el.dataset.value === value));

      closeAllOptionDropdowns();
      updateImage();
      updatePrice();
    }
  });

  pcardOptionsEl.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'pcard-qty') {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      currentQty = val;
      updatePrice();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.pcard-opt')) closeAllOptionDropdowns();
  });

  function getSelectionSummary() {
    return currentProduct.attributes.map((attr) => {
      const opt = findAttrOption(attr, currentSelection[attr.key]);
      return { label: attr.label, value: opt.label };
    });
  }

  function openQuickview(card) {
    currentProduct = getProductForCard(card);
    currentSelection = {};
    currentProduct.attributes.forEach((attr) => { currentSelection[attr.key] = attr.options[0].id; });
    currentQty = 1;

    pcardNameEl.textContent = String(currentProduct.name).toUpperCase();
    pcardRatingEl.innerHTML = `${starsHTML(currentProduct.rating)} <span>${currentProduct.rating.toFixed ? currentProduct.rating.toFixed(1) : currentProduct.rating} (${currentProduct.reviews})</span>`;
    pcardDescEl.textContent = currentProduct.description;
    // La imagen se actualizará con updateImage() que maneja fallbacks
    pcardImgEl.alt = currentProduct.name;
    pcardImgEl.classList.remove('is-fading');

    renderOptions();
    updateImage();   // ahora con fallback
    updatePrice();

    quickviewModal.classList.add('is-open');
    quickviewOverlay.classList.add('is-open');
    quickviewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickview() {
    quickviewModal.classList.remove('is-open');
    quickviewOverlay.classList.remove('is-open');
    quickviewModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    closeAllOptionDropdowns();
    pcardContextMenu?.classList.remove('is-open');
    pcardShareMenu?.classList.remove('is-open');
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

  // Añadir al carrito desde el modal
  if (pcardAddBtn) {
    pcardAddBtn.addEventListener('click', () => {
      if (!currentProduct) return;
      const effectiveUnit = computeEffectiveUnitPrice();
      // Obtenemos la primera ruta de imagen (la que se está mostrando realmente)
      const rutas = currentVariantImagePaths();
      const imgSrc = rutas.length > 0 ? rutas[0] : currentProduct.defaultImage;
      addToCart({
        name: currentProduct.name,
        price: `S/ ${effectiveUnit.toFixed(2)}`,
        img: imgSrc,
        qty: currentQty,
      });
      closeQuickview();
    });
  }

  // WhatsApp (Comprar ahora)
  if (pcardWhatsappBtn) {
    pcardWhatsappBtn.addEventListener('click', () => {
      if (!currentProduct) return;
      const total = computeTotalPrice();
      const summary = getSelectionSummary();
      let msg = `¡Hola Leviathan Nutrition! Quiero comprar:\n\n`;
      msg += `Producto: ${currentProduct.name}\n`;
      summary.forEach((s) => { msg += `${s.label}: ${s.value}\n`; });
      msg += `Cantidad: ${currentQty}\n`;
      msg += `Total: S/ ${total.toFixed(2)}`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  // Botón cámara (captura)
  if (pcardCameraBtn) {
    pcardCameraBtn.addEventListener('click', async () => {
      if (typeof html2canvas === 'undefined' || !pcardInner) {
        showToast('No se pudo capturar la tarjeta.');
        return;
      }
      try {
        pcardCameraBtn.classList.add('is-capturing');
        const canvasEl = await html2canvas(pcardInner, {
          backgroundColor: '#0A0D13',
          scale: Math.min(window.devicePixelRatio || 1, 2) * 1.5,
          useCORS: true,
        });
        pcardInner.classList.add('is-flashing');
        setTimeout(() => pcardInner.classList.remove('is-flashing'), 420);

        canvasEl.toBlob((blob) => {
          if (!blob) return;
          const link = document.createElement('a');
          link.download = `${slugify(currentProduct?.name || 'producto')}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 4000);
          showToast('Captura guardada');
        }, 'image/png', 1);
      } catch (err) {
        showToast('No se pudo capturar la tarjeta.');
      } finally {
        setTimeout(() => pcardCameraBtn.classList.remove('is-capturing'), 500);
      }
    });
  }

  // Menú de tres puntos
  if (pcardMenuBtn && pcardContextMenu) {
    pcardMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = pcardContextMenu.classList.toggle('is-open');
      pcardMenuBtn.setAttribute('aria-expanded', isOpen);
      pcardShareMenu?.classList.remove('is-open');
    });
    pcardContextMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      pcardContextMenu.classList.remove('is-open');
      pcardMenuBtn.setAttribute('aria-expanded', 'false');
      if (action === 'share') {
        openShare();
      } else if (action === 'review') {
        showToast('Muy pronto podrás dejar tu reseña aquí.');
      }
    });
  }

  // Compartir
  const SHARE_PROVIDERS = {
    whatsapp: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    x: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  };
  async function openShare() {
    const shareUrl = window.location.href;
    const shareText = currentProduct ? `Mira este producto en Leviathan Nutrition: ${currentProduct.name}` : 'Leviathan Nutrition';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Leviathan Nutrition', text: shareText, url: shareUrl });
      } catch (err) {}
      return;
    }
    pcardShareMenu?.classList.add('is-open');
  }
  if (pcardShareMenu) {
    pcardShareMenu.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-share]');
      if (!btn) return;
      const provider = btn.dataset.share;
      const shareUrl = window.location.href;
      const shareText = currentProduct ? `Mira este producto en Leviathan Nutrition: ${currentProduct.name}` : 'Leviathan Nutrition';
      if (provider === 'copy') {
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('Enlace copiado');
        } catch (err) {
          showToast('No se pudo copiar el enlace');
        }
      } else if (SHARE_PROVIDERS[provider]) {
        window.open(SHARE_PROVIDERS[provider](shareUrl, shareText), '_blank', 'noopener');
      }
      pcardShareMenu.classList.remove('is-open');
    });
  }
  document.addEventListener('click', (e) => {
    if (pcardMenuBtn && !pcardMenuBtn.closest('.pcard-menu-wrap').contains(e.target)) {
      pcardContextMenu?.classList.remove('is-open');
      pcardShareMenu?.classList.remove('is-open');
      pcardMenuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------------------------------------------------------
     13) CONTADORES ANIMADOS (Nosotros)
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
      }, { threshold: 0.4 }
    );
    statNumbers.forEach((el) => statObserver.observe(el));
  }

  /* ---------------------------------------------------------
     14) FORMULARIO DE CONTACTO
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
     15) NEWSLETTER
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

  /* ---------------------------------------------------------
     16) BÚSQUEDA
  ---------------------------------------------------------- */
  function initSearch() {
    const overlay = document.getElementById('search-overlay');
    const toggleBtn = document.getElementById('search-toggle-btn');
    const closeBtn = document.getElementById('search-close-btn');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    if (!overlay || !toggleBtn || !closeBtn || !searchInput || !resultsContainer) return;
    function openSearch() {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInput.focus(), 200);
    }
    function closeSearch() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      const products = getProductData();
      products.forEach(p => p.element.style.display = '');
      searchInput.value = '';
      resultsContainer.innerHTML = '<p class="search-no-results">Escribe para buscar productos...</p>';
    }
    toggleBtn.addEventListener('click', openSearch);
    closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeSearch();
    });
    function getProductData() {
      const cards = document.querySelectorAll('.product-card');
      const products = [];
      cards.forEach(card => {
        const name = card.dataset.name || '';
        const category = card.dataset.catLabel || '';
        const price = card.dataset.price || '';
        const img = card.dataset.img || '';
        const catFilter = card.dataset.category || '';
        products.push({ name, category, price, img, catFilter, element: card });
      });
      return products;
    }
    function filterProducts(query) {
      const products = getProductData();
      const q = query.toLowerCase().trim();
      if (!q) {
        resultsContainer.innerHTML = '<p class="search-no-results">Escribe para buscar productos...</p>';
        products.forEach(p => p.element.style.display = '');
        return;
      }
      const matches = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.catFilter.toLowerCase().includes(q)
      );
      products.forEach(p => {
        const match = matches.includes(p);
        p.element.style.display = match ? '' : 'none';
        if (match && !p.element.classList.contains('is-visible')) {
          p.element.classList.add('is-visible');
        }
      });
      if (matches.length === 0) {
        resultsContainer.innerHTML = `<p class="search-no-results">No encontramos productos para "<strong>${query}</strong>"</p>`;
        return;
      }
      let html = '';
      matches.forEach(p => {
        html += `
          <div class="search-result-item">
            <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
            <div class="info">
              <div class="name">${p.name}</div>
              <div class="cat">${p.category}</div>
            </div>
            <div class="price">${p.price}</div>
          </div>
        `;
      });
      resultsContainer.innerHTML = html;
    }
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => filterProducts(e.target.value), 150);
    });
  }

  /* ---------------------------------------------------------
     17) DROPDOWN DE CATEGORÍAS
  ---------------------------------------------------------- */
  function initCategoryDropdown() {
    const btn = document.getElementById('category-dropdown-btn');
    const menu = document.getElementById('category-dropdown-menu');
    if (!btn || !menu) return;
    function toggleDropdown(e) {
      e.stopPropagation();
      const isOpen = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen);
    }
    btn.addEventListener('click', toggleDropdown);
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    menu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     18) DETECTAR PÁGINA DE CATEGORÍA
  ---------------------------------------------------------- */
  function updateHeaderForCategoryPage() {
    const categoryMap = {
      'aumento_masa_muscular': 'Masa muscular',
      'musculo_limpio': 'Músculo limpio',
      'maxima_recuperacion': 'Máxima recuperación',
      'definicion': 'Definición',
      'belleza_y_bienestar': 'Belleza y bienestar',
      'fuerza_y_rendimiento': 'Fuerza y rendimiento'
    };
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    let detected = null;
    for (const [key, label] of Object.entries(categoryMap)) {
      if (filename.includes(key)) {
        detected = label;
        break;
      }
    }
    if (detected) {
      document.body.classList.add('is-category-page');
      const labelContainer = document.querySelector('#category-nav .category-active-label');
      if (labelContainer) {
        labelContainer.textContent = detected;
      }
    }
  }

  /* ---------------------------------------------------------
     19) INICIALIZACIÓN
  ---------------------------------------------------------- */
  initSearch();
  initCategoryDropdown();
  updateHeaderForCategoryPage();

  // Añadir estilos para el badge del carrito (si no existen)
  if (!document.getElementById('cart-badge-styles')) {
    const styleBadge = document.createElement('style');
    styleBadge.id = 'cart-badge-styles';
    styleBadge.textContent = `
      @keyframes badge-pop {
        0% { transform: scale(1); }
        40% { transform: scale(1.6); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styleBadge);
  }

})();
