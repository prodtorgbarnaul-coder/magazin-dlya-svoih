// ==================== ОСНОВНЫЕ ДАННЫЕ ====================
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [];
let categoriesData = JSON.parse(localStorage.getItem('categoriesData')) || [
    { 
        name: 'Бытовая химия', 
        icon: '🧴', 
        color1: '#667eea', 
        color2: '#764ba2',
        backgroundType: 'gradient',
        backgroundImage: ''
    },
    { 
        name: 'Постельное белье', 
        icon: '🛏️', 
        color1: '#f093fb', 
        color2: '#f5576c',
        backgroundType: 'gradient',
        backgroundImage: ''
    },
    { 
        name: 'Рыба и морепродукты', 
        icon: '🐟', 
        color1: '#4facfe', 
        color2: '#00f2fe',
        backgroundType: 'gradient',
        backgroundImage: ''
    },
    { 
        name: 'Мясо и птица', 
        icon: '🍗', 
        color1: '#43e97b', 
        color2: '#38f9d7',
        backgroundType: 'gradient',
        backgroundImage: ''
    },
    { 
        name: 'Кондитерские изделия', 
        icon: '🍰', 
        color1: '#fa709a', 
        color2: '#fee140',
        backgroundType: 'gradient',
        backgroundImage: ''
    },
    { 
        name: 'Молочные продукты', 
        icon: '🥛', 
        color1: '#a8edea', 
        color2: '#fed6e3',
        backgroundType: 'gradient',
        backgroundImage: ''
    },
    { 
        name: 'Мангальные зоны и мангалы', 
        icon: '🔥', 
        color1: '#ff9a9e', 
        color2: '#fecfef',
        backgroundType: 'gradient',
        backgroundImage: ''
    }
];

let siteSettings = JSON.parse(localStorage.getItem('siteSettings')) || {
    backgroundType: 'gradient',
    backgroundImage: '',
    headerColor: '#2c5aa0',
    logoText: 'ДЛЯ СВОИХ'
};

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    name: 'Гость',
    phone: '',
    role: 'customer',
    avatar: 'Г'
};

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================
function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    categoriesGrid.innerHTML = categoriesData.map(category => {
        let background = getCategoryBackground(category);
        
        return `
            <div class="category-card" style="background: ${background}" onclick="filterByCategory('${category.name}')">
                <span class="category-icon">${category.icon}</span>
                <h3>${category.name}</h3>
            </div>
        `;
    }).join('');
}

function getCategoryBackground(category) {
    if (category.backgroundType === 'gradient') {
        return `linear-gradient(135deg, ${category.color1}, ${category.color2})`;
    } else if (category.backgroundType === 'solid') {
        return category.color1;
    } else if (category.backgroundType === 'image') {
        return `url('${category.backgroundImage}') center/cover`;
    }
    return `linear-gradient(135deg, ${category.color1}, ${category.color2})`;
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
                <img src="${productImage}" alt="${product.name}" class="product-image" 
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

function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    const categoriesFromProducts = [...new Set(products.map(p => p.category))];
    const categoriesFromSettings = categoriesData.map(cat => cat.name);
    const allCategories = [...new Set([...categoriesFromProducts, ...categoriesFromSettings])];
    
    categoryFilter.innerHTML = '<option value="">Все категории</option>' +
        allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

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

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function closePanel() {
    document.querySelectorAll('.edit-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.getElementById('editOverlay').style.display = 'none';
}

function openProfile() {
    document.getElementById('profileModal').style.display = 'block';
    updateProfileView();
}

function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const content = document.getElementById('productModalContent'];
    
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

function saveDesign() {
    showNotification('💾 Все изменения сохранены!');
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    // Применяем сохраненные настройки
    if (siteSettings.backgroundType === 'gradient') {
        document.body.style.background = `linear-gradient(135deg, ${siteSettings.color1}, ${siteSettings.color2})`;
    } else if (siteSettings.backgroundType === 'solid') {
        document.body.style.background = siteSettings.solidColor;
    } else if (siteSettings.backgroundType === 'image' && siteSettings.backgroundImage) {
        document.body.style.background = `url('${siteSettings.backgroundImage}') center/cover fixed`;
    }

    // Загружаем данные
    loadCategories();
    loadProducts();
    updateCategoryFilter();
    updateCartCount();
    updateUserInfo();

    // Добавляем тестовые товары если их нет
    if (products.length === 0) {
        const testProducts = [
            {
                id: 100,
                name: 'FAIRY banane - 5 литров',
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
                name: 'Комплект постельного белья Люкс',
                category: 'Постельное белье',
                price: 2500,
                oldPrice: 3000,
                quantity: 5,
                status: 'in_stock',
                description: 'Набор постельного белья из 100% хлопка. Размер: 2.0 спальный.',
                image: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=Постельное'
            }
        ];

        products = testProducts;
        localStorage.setItem('products', JSON.stringify(products));
        filteredProducts = [...products];
        loadProducts();
        updateCategoryFilter();
    }
});
