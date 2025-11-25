javascript
// ==================== ОСНОВНЫЕ ДАННЫЕ И ПЕРЕМЕННЫЕ ====================
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [];
let categoriesData = JSON.parse(localStorage.getItem('categoriesData')) || [];
let siteSettings = JSON.parse(localStorage.getItem('siteSettings')) || {};
let isAdmin = localStorage.getItem('isAdmin') === 'true';
let cartIdCounter = parseInt(localStorage.getItem('cartIdCounter')) || 1;

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    checkAdminStatus();
    applySiteSettings();
    loadInitialData();
    updateUI();
    
    // Показываем конструктор если админ
    if (isAdmin) {
        document.getElementById('constructorToolbar').style.display = 'block';
    }
}

function checkAdminStatus() {
    const adminPassword = localStorage.getItem('adminPassword');
    if (!adminPassword) {
        // Устанавливаем пароль по умолчанию
        localStorage.setItem('adminPassword', 'admin123');
        isAdmin = false;
    } else {
        isAdmin = localStorage.getItem('isAdmin') === 'true';
    }
}

function applySiteSettings() {
    if (siteSettings.backgroundType === 'gradient') {
        document.body.style.background = `linear-gradient(135deg, ${siteSettings.color1 || '#667eea'}, ${siteSettings.color2 || '#764ba2'})`;
    } else if (siteSettings.backgroundType === 'solid') {
        document.body.style.background = siteSettings.solidColor || '#f8f9fa';
    } else if (siteSettings.backgroundType === 'image' && siteSettings.backgroundImage) {
        document.body.style.background = `url('${siteSettings.backgroundImage}') center/cover fixed`;
    }
    
    // Применяем настройки шапки
    if (siteSettings.siteTitle) {
        document.getElementById('siteTitle').textContent = siteSettings.siteTitle;
    }
    if (siteSettings.siteDescription) {
        document.getElementById('siteDescription').textContent = siteSettings.siteDescription;
    }
    if (siteSettings.headerPhone) {
        document.getElementById('headerPhone').textContent = siteSettings.headerPhone;
    }
    if (siteSettings.headerEmail) {
        document.getElementById('headerEmail').textContent = siteSettings.headerEmail;
    }
    if (siteSettings.headerAddress) {
        document.getElementById('headerAddress').textContent = siteSettings.headerAddress;
    }
}

function loadInitialData() {
    loadCategories();
    loadProducts();
    updateCategoryFilter();
    updateCartCount();
    
    if (products.length === 0) {
        loadSampleProducts();
    }
}

// ==================== РАБОТА С ТОВАРАМИ ====================
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '';
        noProducts.style.display = 'block';
        return;
    }
    
    noProducts.style.display = 'none';
    
    // Если filteredProducts пуст, используем все товары
    const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;
    
    productsGrid.innerHTML = displayProducts.map(product => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}" class="product-image"
                 onerror="this.src='https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-price">${product.price} ₽</div>
                
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="changeProductQuantity('${product.id}', -1)">-</button>
                    <span id="quantity-${product.id}">1</span>
                    <button class="quantity-btn" onclick="changeProductQuantity('${product.id}', 1)">+</button>
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart('${product.id}')">
                        <i class="fas fa-cart-plus"></i> В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function changeProductQuantity(productId, change) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let quantity = parseInt(quantityElement.textContent) || 1;
    quantity += change;
    
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    
    quantityElement.textContent = quantity;
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quantityElement = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityElement.textContent) || 1;
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Увеличиваем количество существующего товара
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Добавляем новый товар
        const cartItem = {
            cartId: cartIdCounter++,
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        };
        cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('cartIdCounter', cartIdCounter.toString());
    
    updateCartCount();
    showNotification('✅ Товар добавлен в корзину');
    
    // Сбрасываем количество обратно к 1
    quantityElement.textContent = '1';
}

// ==================== ФИЛЬТРАЦИЯ И ПОИСК ====================
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                             product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    loadProducts();
}

function sortProducts() {
    const sortValue = document.getElementById('sortSelect').value;
    
    const productsToSort = filteredProducts.length > 0 ? filteredProducts : products;
    
    switch (sortValue) {
        case 'name':
            productsToSort.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price':
            productsToSort.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            productsToSort.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            // Для демо - сортируем по ID
            productsToSort.sort((a, b) => b.id.localeCompare(a.id));
            break;
    }
    
    loadProducts();
}

// ==================== РАБОТА С КОРЗИНОЙ ====================
function openCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; color: var(--gray); padding: 40px;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>Корзина пуста</p>
            </div>
        `;
        cartTotal.textContent = '0';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/60x60/ecf0f1/7f8c8d?text=Нет'">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ₽ × ${item.quantity}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="changeQuantity(${item.cartId}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity(${item.cartId}, 1)">+</button>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.cartId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toLocaleString();
    }
    
    // Добавляем кнопку синхронизации с WhatsApp если админ
    if (isAdmin) {
        const existingSyncBtn = document.querySelector('.whatsapp-sync-btn');
        if (!existingSyncBtn) {
            const syncButton = document.createElement('button');
            syncButton.className = 'btn btn-success whatsapp-sync-btn';
            syncButton.style.marginTop = '15px';
            syncButton.style.width = '100%';
            syncButton.innerHTML = '<i class="fab fa-whatsapp"></i> Отправить в WhatsApp';
            syncButton.onclick = showCartSyncPanel;
            
            const modalContent = document.querySelector('.modal-content');
            const totalElement = modalContent.querySelector('.cart-total');
            totalElement.parentNode.insertBefore(syncButton, totalElement.nextSibling);
        }
    }
    
    modal.style.display = 'block';
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function changeQuantity(cartId, change) {
    const itemIndex = cart.findIndex(item => item.cartId === cartId);
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity < 1) {
        cart[itemIndex].quantity = 1;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    openCart(); // Переоткрываем корзину для обновления
    updateCartCount();
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    localStorage.setItem('cart', JSON.stringify(cart));
    openCart();
    updateCartCount();
    showNotification('🗑️ Товар удален из корзины');
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// ==================== КАТЕГОРИИ ====================
function loadCategories() {
    if (categoriesData.length === 0) {
        // Создаем категории по умолчанию
        categoriesData = [
            { id: 'all', name: 'Все товары', icon: 'fas fa-boxes', color: '#2c5aa0' },
            { id: 'electronics', name: 'Электроника', icon: 'fas fa-laptop', color: '#e74c3c' },
            { id: 'clothing', name: 'Одежда', icon: 'fas fa-tshirt', color: '#27ae60' },
            { id: 'home', name: 'Для дома', icon: 'fas fa-home', color: '#f39c12' },
            { id: 'other', name: 'Разное', icon: 'fas fa-ellipsis-h', color: '#9b59b6' }
        ];
        localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
    }
}

function updateCategoryFilter() {
    const categoryFilters = document.getElementById('categoryFilters');
    
    categoryFilters.innerHTML = categoriesData.map(category => `
        <button class="category-btn ${category.id === 'all' ? 'active' : ''}" 
                data-category="${category.id}" 
                onclick="selectCategory('${category.id}')"
                style="border-color: ${category.color}; color: ${category.id === 'all' ? 'white' : category.color}; background: ${category.id === 'all' ? category.color : 'white'}">
            <i class="${category.icon}"></i> ${category.name}
        </button>
    `).join('');
}

function selectCategory(categoryId) {
    // Убираем активный класс у всех кнопок
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'white';
        btn.style.color = btn.dataset.category === 'all' ? '#2c5aa0' : btn.style.borderColor;
    });
    
    // Добавляем активный класс выбранной кнопке
    const activeBtn = document.querySelector(`[data-category="${categoryId}"]`);
    const category = categoriesData.find(c => c.id === categoryId);
    
    if (activeBtn && category) {
        activeBtn.classList.add('active');
        activeBtn.style.background = category.color;
        activeBtn.style.color = 'white';
    }
    
    filterProducts();
}

// ==================== УВЕДОМЛЕНИЯ ====================
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ==================== ДЕМО ДАННЫЕ ====================
function loadSampleProducts() {
    products = [
        {
            id: '1',
            name: 'iPhone 15 Pro',
            description: 'Смартфон 256GB, титановый корпус',
            price: 89990,
            category: 'electronics',
            image: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=iPhone+15',
            status: 'in_stock'
        },
        {
            id: '2', 
            name: 'Футболка мужская',
            description: 'Хлопковая футболка, все размеры',
            price: 1200,
            category: 'clothing',
            image: 'https://via.placeholder.com/300x200/4facfe/ffffff?text=Футболка',
            status: 'in_stock'
        },
        {
            id: '3',
            name: 'FAIRY Средство для посуды',
            description: 'Концентрированное средство, 5л',
            price: 850,
            category: 'home', 
            image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=FAIRY+5л',
            status: 'in_stock'
        },
        {
            id: '4',
            name: 'Samsung Galaxy S24',
            description: 'Флагманский смартфон, 128GB',
            price: 74990,
            category: 'electronics',
            image: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=Galaxy+S24',
            status: 'in_stock'
        }
    ];
    
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
}

// ==================== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ====================
function updateUI() {
    updateCartCount();
    loadProducts();
}

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.filterProducts = filterProducts;
window.sortProducts = sortProducts;
window.openCart = openCart;
window.closeCart = closeCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.selectCategory = selectCategory;
window.changeProductQuantity = changeProductQuantity;
window.addToCart = addToCart;