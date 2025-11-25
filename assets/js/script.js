// ==================== ОСНОВНЫЕ ДАННЫЕ И ПЕРЕМЕННЫЕ ====================
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let categoriesData = JSON.parse(localStorage.getItem('categoriesData')) || [];
let siteSettings = JSON.parse(localStorage.getItem('siteSettings')) || {};
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadInitialData();
    updateUI();
    
    if (isAdmin) {
        document.getElementById('constructorToolbar').style.display = 'block';
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

// ==================== ТОВАРЫ ====================
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '';
        noProducts.style.display = 'block';
        return;
    }
    
    noProducts.style.display = 'none';
    
    productsGrid.innerHTML = products.map(product => `
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
    
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        };
        cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('✅ Товар добавлен в корзину');
    quantityElement.textContent = '1';
}

// ==================== КОРЗИНА ====================
function openCart() {
    alert('Функция корзины будет добавлена в следующем обновлении!');
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// ==================== КАТЕГОРИИ ====================
function loadCategories() {
    if (categoriesData.length === 0) {
        categoriesData = [
            { id: 'all', name: 'Все товары', icon: 'fas fa-boxes', color: '#2c5aa0' },
            { id: 'electronics', name: 'Электроника', icon: 'fas fa-laptop', color: '#e74c3c' },
            { id: 'clothing', name: 'Одежда', icon: 'fas fa-tshirt', color: '#27ae60' },
            { id: 'home', name: 'Для дома', icon: 'fas fa-home', color: '#f39c12' }
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
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'white';
        btn.style.color = btn.dataset.category === 'all' ? '#2c5aa0' : btn.style.borderColor;
    });
    
    const activeBtn = document.querySelector(`[data-category="${categoryId}"]`);
    const category = categoriesData.find(c => c.id === categoryId);
    
    if (activeBtn && category) {
        activeBtn.classList.add('active');
        activeBtn.style.background = category.color;
        activeBtn.style.color = 'white';
    }
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
            name: 'Средство для посуды',
            description: 'Концентрированное средство, 5л',
            price: 850,
            category: 'home', 
            image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=FAIRY+5л',
            status: 'in_stock'
        }
    ];
    
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
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

// ==================== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ====================
function updateUI() {
    updateCartCount();
    loadProducts();
}

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.changeProductQuantity = changeProductQuantity;
window.addToCart = addToCart;
window.openCart = openCart;
window.selectCategory = selectCategory;
