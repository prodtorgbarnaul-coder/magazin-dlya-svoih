// Global variables
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [];
let categoriesData = JSON.parse(localStorage.getItem('categoriesData')) || [
    { name: 'Бытовая химия', icon: '🧴', color1: '#667eea', color2: '#764ba2' },
    { name: 'Постельное белье', icon: '🏠', color1: '#f093fb', color2: '#f5576c' },
    { name: 'Рыба и морепродукты', icon: '🐟', color1: '#4facfe', color2: '#00f2fe' },
    { name: 'Мясо и птица', icon: '🥚', color1: '#FFC30F', color2: '#FF5733' },
    { name: 'Кондитерские изделия', icon: '🍰', color1: '#CD853F', color2: '#DAA520' },
    { name: 'Молочные продукты', icon: '🥛', color1: '#B0E0E6', color2: '#ADD8E6' },
    { name: 'Мангальные зоны и мангалы', icon: '🔥', color1: '#DC143C', color2: '#FF6347' }
];

let siteSettings = JSON.parse(localStorage.getItem('siteSettings')) || {
    backgroundType: 'gradient',
    backgroundImage: '',
    headerColor: '#2c5aa0',
    logoText: 'ДЛЯ СВОИХ'
};

// Functions for rendering components
function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    categoriesGrid.innerHTML = categoriesData.map(category => {
        let background = getCategoryBackground(category);
        return `
            <div class="category-card" style="background: ${background};" onclick="filterByCategory('${category.name}')">
                <span class="category-icon">${category.icon}</span>
                <h3>${category.name}</h3>
            </div>
        `;
    }).join('');
}

function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="color: var(--gray); margin-bottom: 20px;">Товары не найдены</h3>
                <p style="color: var(--gray);">Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => {
        const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
        const statusClass = `status-${product.status.replace('_', '-')}`;
        
        const productImage = product.image && product.image.trim() !== ''
            ? product.image
            : 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения';
            
        return `
            <div class="product-card">
                ${discount > 0 ? `<div class="product-badge">-${discount}%</div>` : ''}
                <img src="${productImage}" alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения'"
                     onclick="showProductDetails(${product.id})">
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name" onclick="showProductDetails(${product.id})">${product.name}</h3>
                    <div class="product-description-short">${product.description}</div>
                    
                    <div class="product-price">
                        <span class="current-price">${product.price.toLocaleString()} ₽</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                        ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ''}
                    </div>
                    
                    <div class="product-status ${statusClass}">
                        ${getProductStatusText(product.status)}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})"
                                ${product.status !== 'in_stock' ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            ${product.status === 'in_stock' ? 'В корзину' : 'Недоступно'}
                        </button>
                        <button class="details-btn" onclick="showProductDetails(${product.id})">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getProductStatusText(status) {
    const statuses = {
        'in_stock': 'В наличии',
        'out_of_stock': 'Нет в наличии',
        'pre_order': 'Под заказ'
    };
    return statuses[status] || status;
}

// Filtering logic
function filterByCategory(category) {
    document.getElementById('categoryFilter').value = category;
    filterProducts();
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
}

function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    
    filteredProducts = products.filter(product => {
        if (category && product.category !== category) return false;
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            if (product.price < min || product.price > max) return false;
        }
        return true;
    });
    
    loadProducts();
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    loadProducts();
}

// Sorting logic
function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    
    if (sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    loadProducts();
}

// Adding to cart functionality
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            cartId: Date.now()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Товар добавлен в корзину!');
}

// Updating cart counter
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Modal windows handling
function openCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">Корзина пуста</p>';
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
    
    modal.style.display = 'block';
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function changeQuantity(cartId, change) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(cartId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            openCart();
        }
    }
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    openCart();
    showNotification('Товар удален из корзины');
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`✅ Заказ оформлен! Сумма: ${total.toLocaleString()} ₽`);
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    closeCart();
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Profile modal
function openProfile() {
    document.getElementById('profileModal').style.display = 'block';
}

function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

// Single product modal
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const content = document.getElementById('productModalContent');
    
    title.textContent = product.name;
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${product.image}" alt="${product.name}"
                 style="max-width: 100%; max-height: 300px; border-radius: 10px;"
                 onerror="this.src='https://via.placeholder.com/400x300/ecf0f1/7f8c8d?text=Нет+изображения'">
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Категория:</strong> ${product.category}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Цена:</strong> <span style="font-size: 1.5rem; color: var(--primary); font-weight: bold;">${product.price} ₽</span>
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Наличие:</strong> ${product.quantity} шт.
        </div>
        <div style="margin-bottom: 20px;">
            <strong>Описание:</strong>
            <p style="margin-top: 10px; line-height: 1.6;">${product.description}</p>
        </div>
        <button class="btn btn-primary" onclick="addToCart(${product.id}); closeProductModal();" style="width: 100%;">
            <i class="fas fa-shopping-cart"></i> Добавить в корзину
        </button>
    `;
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Notifications
function openNotifications() {
    showNotification('У вас нет новых уведомлений');
}

// Constructor tools
function toggleConstructor() {
    const toolbar = document.querySelector('.constructor-toolbar');
    const editButtons = document.getElementById('editButtons');
    
    if (toolbar.classList.contains('expanded')) {
        toolbar.classList.remove('expanded');
        editButtons.style.display = 'none';
    } else {
        toolbar.classList.add('expanded');
        editButtons.style.display = 'flex';
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Apply saved settings
    if (siteSettings.backgroundType === 'gradient') {
        document.body.style.background = `linear-gradient(135deg, ${siteSettings.color1}, ${siteSettings.color2})`;
    } else if (siteSettings.backgroundType === 'solid') {
        document.body.style.background = siteSettings.solidColor;
    } else if (siteSettings.backgroundType === 'image' && siteSettings.backgroundImage) {
        document.body.style.background = `url('${siteSettings.backgroundImage}') center/cover fixed`;
    }

    // Load categories and products
    loadCategories();
    loadProducts();
    updateCategoryFilter();
    updateCartCount();

    // Add some test products if there are none
    if (products.length === 0) {
        const testProducts = [
            {
                id: 100,
                title: 'FAIRY banane - 5 литров',
                category: 'Бытовая химия',
                price: 800,
                oldPrice: null,
                quantity: 10,
                status: 'in_stock',
                description: 'Концентрированное средство для мытья посуды. Объем: 5 литров. Аромат: Банан.',
                image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=FAIRY'
            },
            {
                id: 101,
                title: 'Матрас ортопедический',
                category: 'Постельное белье',
                price: 15000,
                oldPrice: 18000,
                quantity: 5,
                status: 'in_stock',
                description: 'Ортопедический матрас с эффектом памяти.',
                image: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=Матрас'
            }
        ];

        products = testProducts;
        localStorage.setItem('products', JSON.stringify(products));
        filteredProducts = [...products];
        loadProducts();
        updateCategoryFilter();
    }
});

// Helper functions
function getCategoryBackground(category) {
    if (category.backgroundType === 'gradient') {
        return `linear-gradient(135deg, ${category.color1}, ${category.color2})`;
    } else if (category.backgroundType === 'solid') {
        return category.color1;
    } else if (category.backgroundType === 'image') {
        return `url('${category.backgroundImage}')`;
    }
    return `linear-gradient(135deg, ${category.color1}, ${category.color2})`;
}

function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Collect unique categories from products
    const categoriesFromProducts = [...new Set(products.map(p => p.category))];
    
    // Collect categories from settings
    const categoriesFromSettings = categoriesData.map(cat => cat.name);
    
    // Merge and deduplicate categories
    const allCategories = [...new Set([...categoriesFromProducts, ...categoriesFromSettings])];
    
    categoryFilter.innerHTML = '<option value="">Все категории</option>' +
        allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Export global functions
window.filterByCategory = filterByCategory;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.openNotifications = openNotifications;
window.showProductDetails = showProductDetails;
window.closeProductModal = closeProductModal;
window.toggleConstructor = toggleConstructor;
window.updateCategoryFilter = updateCategoryFilter;