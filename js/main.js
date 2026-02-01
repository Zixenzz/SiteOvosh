/**
 * ================================================
 * ОВОЩИ И ФРУКТЫ — Коряжма
 * Основной JavaScript файл
 * ================================================
 */

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let productsData = null;
let contentData = null;
let currentCategory = 'all';

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initHeader();
  initMobileMenu();
  initScrollToTop();
  initAnimations();
  initPage();
});

// === ЗАГРУЗКА ДАННЫХ ===
async function loadData() {
  try {
    // Загружаем данные о товарах
    const productsResponse = await fetch('data/products.json');
    productsData = await productsResponse.json();
    
    // Загружаем контент
    const contentResponse = await fetch('data/content.json');
    contentData = await contentResponse.json();
    
    // Обновляем контактные данные на странице
    updateContactInfo();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
}

// === ОБНОВЛЕНИЕ КОНТАКТНОЙ ИНФОРМАЦИИ ===
function updateContactInfo() {
  if (!contentData) return;
  
  const { company } = contentData;
  
  // Обновляем телефоны
  document.querySelectorAll('[data-phone]').forEach(el => {
    el.href = `tel:${company.phoneClean}`;
    if (el.querySelector('.phone-text')) {
      el.querySelector('.phone-text').textContent = company.phone;
    }
  });
  
  // Обновляем WhatsApp
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    el.href = `https://wa.me/${company.whatsapp}`;
  });
  
  // Обновляем VK
  document.querySelectorAll('[data-vk]').forEach(el => {
    el.href = company.vk;
  });
  
  // Обновляем адрес
  document.querySelectorAll('[data-address]').forEach(el => {
    el.textContent = company.address;
  });
  
  // Обновляем email
  document.querySelectorAll('[data-email]').forEach(el => {
    el.href = `mailto:${company.email}`;
    el.textContent = company.email;
  });
}

// === ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ ===
function initPage() {
  const page = document.body.dataset.page;
  
  switch (page) {
    case 'home':
      renderCategories();
      renderFeaturedProducts();
      break;
    case 'catalog':
      renderCatalogFilters();
      renderAllProducts();
      break;
    case 'prices':
      renderPricesList();
      break;
  }
}

// === РЕНДЕР КАТЕГОРИЙ НА ГЛАВНОЙ ===
function renderCategories() {
  const container = document.getElementById('categories-grid');
  if (!container || !productsData) return;
  
  const html = productsData.categories.map(category => {
    const count = productsData.products.filter(p => p.category === category.id).length;
    return `
      <a href="catalog.html?category=${category.id}" class="category-card fade-in">
        <div class="category-icon">${category.icon}</div>
        <div class="category-name">${category.name}</div>
        <div class="category-count">${count} ${getProductWord(count)}</div>
      </a>
    `;
  }).join('');
  
  container.innerHTML = html;
  initAnimations();
}

// === РЕНДЕР ПОПУЛЯРНЫХ ТОВАРОВ ===
function renderFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container || !productsData) return;
  
  // Берем товары с бейджами (хиты, популярные)
  const featured = productsData.products.filter(p => p.badge).slice(0, 8);
  
  container.innerHTML = renderProductCards(featured);
  initAnimations();
}

// === РЕНДЕР ФИЛЬТРОВ КАТАЛОГА ===
function renderCatalogFilters() {
  const container = document.getElementById('catalog-filters');
  if (!container || !productsData) return;
  
  // Получаем категорию из URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category') || 'all';
  currentCategory = categoryFromUrl;
  
  let html = `<button class="filter-btn ${currentCategory === 'all' ? 'active' : ''}" data-category="all">Все товары</button>`;
  
  html += productsData.categories.map(category => `
    <button class="filter-btn ${currentCategory === category.id ? 'active' : ''}" data-category="${category.id}">
      ${category.icon} ${category.name}
    </button>
  `).join('');
  
  container.innerHTML = html;
  
  // Обработчики кликов
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAllProducts();
      
      // Обновляем URL без перезагрузки
      const url = new URL(window.location);
      if (currentCategory === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', currentCategory);
      }
      window.history.replaceState({}, '', url);
    });
  });
}

// === РЕНДЕР ВСЕХ ТОВАРОВ ===
function renderAllProducts() {
  const container = document.getElementById('products-grid');
  if (!container || !productsData) return;
  
  let products = productsData.products;
  
  if (currentCategory !== 'all') {
    products = products.filter(p => p.category === currentCategory);
  }
  
  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">Товары не найдены</h3>
        <p class="empty-state-text">Попробуйте выбрать другую категорию</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = renderProductCards(products);
  initAnimations();
}

// === РЕНДЕР КАРТОЧЕК ТОВАРОВ ===
function renderProductCards(products) {
  return products.map(product => {
    const category = productsData.categories.find(c => c.id === product.category);
    const badgeClass = product.badge ? (product.badge === 'Хит продаж' ? 'hit' : '') : '';
    
    return `
      <article class="product-card fade-in">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy" 
               onerror="this.src='https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop'">
          ${product.badge ? `<span class="product-badge ${badgeClass}">${product.badge}</span>` : ''}
        </div>
        <div class="product-info">
          <div class="product-category">${category ? category.name : ''}</div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <div class="product-price">${product.price} ₽ <span>/ ${product.unit}</span></div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// === РЕНДЕР ПРАЙС-ЛИСТА ===
function renderPricesList() {
  const container = document.getElementById('prices-list');
  if (!container || !productsData) return;
  
  const html = productsData.categories.map((category, index) => {
    const products = productsData.products.filter(p => p.category === category.id);
    
    const productsList = products.map(product => `
      <div class="price-item">
        <span class="price-item-name">${product.name}</span>
        <span class="price-item-value">${product.price} ₽/${product.unit}</span>
      </div>
    `).join('');
    
    return `
      <div class="prices-category ${index === 0 ? 'active' : ''}" data-category="${category.id}">
        <div class="prices-category-header">
          <div class="prices-category-title">
            <span class="prices-category-icon">${category.icon}</span>
            ${category.name}
          </div>
          <span class="prices-category-toggle">▼</span>
        </div>
        <div class="prices-list">
          ${productsList}
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
  
  // Обработчики аккордеона
  container.querySelectorAll('.prices-category-header').forEach(header => {
    header.addEventListener('click', () => {
      const category = header.closest('.prices-category');
      category.classList.toggle('active');
    });
  });
}

// === ШАПКА ===
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// === МОБИЛЬНОЕ МЕНЮ ===
function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (!burger || !mobileMenu) return;
  
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
  
  // Закрываем при клике на ссылку
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// === КНОПКА НАВЕРХ ===
function initScrollToTop() {
  const btn = document.querySelector('.floating-btn.top');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// === АНИМАЦИИ ПОЯВЛЕНИЯ ===
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}

// === ФОРМА ОБРАТНОЙ СВЯЗИ ===
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Здесь можно добавить отправку на сервер
    console.log('Форма отправлена:', data);
    
    // Показываем уведомление
    showNotification('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
    form.reset();
  });
}

// === УВЕДОМЛЕНИЯ ===
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function getProductWord(count) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'товаров';
  }
  
  if (lastDigit === 1) {
    return 'товар';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'товара';
  }
  
  return 'товаров';
}

// === ИНИЦИАЛИЗАЦИЯ ФОРМЫ НА СТРАНИЦЕ КОНТАКТОВ ===
document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});
