// ==================== КОНСТРУКТОР САЙТА ====================
function toggleConstructor() {
    const editButtons = document.getElementById('editButtons');
    const isVisible = editButtons.style.display === 'flex';
    
    editButtons.style.display = isVisible ? 'none' : 'flex';
    
    if (!isVisible) {
        editButtons.style.opacity = '0';
        editButtons.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            editButtons.style.opacity = '1';
            editButtons.style.transform = 'translateY(0)';
        }, 50);
    }
}

function showLoginPanel() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>🔐 Вход в панель управления</h3>
        <div class="form-group">
            <label>Пароль администратора:</label>
            <input type="password" class="form-control" id="adminPassword" placeholder="Введите пароль">
        </div>
        <div class="panel-actions">
            <button class="btn btn-primary" onclick="login()">Войти</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>
        <div style="margin-top: 20px; color: var(--gray); font-size: 0.9rem;">
            <p>Пароль по умолчанию: <code>admin123</code></p>
        </div>
    `;
}

function login() {
    const password = document.getElementById('adminPassword').value;
    const storedPassword = localStorage.getItem('adminPassword') || 'admin123';
    
    if (password === storedPassword) {
        localStorage.setItem('isAdmin', 'true');
        isAdmin = true;
        document.getElementById('constructorToolbar').style.display = 'block';
        showNotification('✅ Успешный вход в панель управления');
        closePanel();
    } else {
        showNotification('❌ Неверный пароль', 'error');
    }
}

function closePanel() {
    document.getElementById('editOverlay').style.display = 'none';
    document.getElementById('productsPanel').style.display = 'none';
}

// ==================== РЕДАКТИРОВАНИЕ ТОВАРОВ ====================
function editProducts() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📦 Управление товарами</h3>
        
        <div class="panel-actions" style="margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="showAddProductForm()">+ Добавить товар</button>
        </div>

        <div class="products-editor-list">
            ${products.map((product, index) => `
                <div class="product-editor-item" style="display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid var(--border);">
                    <img src="${product.image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius);"
                         onerror="this.src='https://via.placeholder.com/60x60/ecf0f1/7f8c8d?text=Нет'">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${product.name}</div>
                        <div style="color: var(--gray); font-size: 0.9rem;">
                            <span>${product.price} ₽</span> • 
                            <span>${product.category}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-sm btn-outline" onclick="editProduct(${index})">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${index})">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="panel-actions">
            <button class="btn btn-danger" onclick="closePanel()">Закрыть</button>
        </div>
    `;
}

function showAddProductForm() {
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>➕ Добавление товара</h3>
        
        <div class="form-group">
            <label>Название товара:</label>
            <input type="text" class="form-control" id="productName" placeholder="Название товара">
        </div>

        <div class="form-group">
            <label>Описание:</label>
            <textarea class="form-control" id="productDescription" placeholder="Описание товара" rows="3"></textarea>
        </div>

        <div class="form-group">
            <label>Цена (₽):</label>
            <input type="number" class="form-control" id="productPrice" placeholder="0" min="0">
        </div>

        <div class="form-group">
            <label>Категория:</label>
            <select class="form-control" id="productCategory">
                ${categoriesData.filter(cat => cat.id !== 'all').map(cat => 
                    `<option value="${cat.id}">${cat.name}</option>`
                ).join('')}
            </select>
        </div>

        <div class="form-group">
            <label>URL изображения:</label>
            <input type="text" class="form-control" id="productImage" 
                   placeholder="https://example.com/image.jpg">
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="addProduct()">Добавить товар</button>
            <button class="btn btn-danger" onclick="editProducts()">Отмена</button>
        </div>
    `;
}

function addProduct() {
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value;

    if (!name || !price) {
        showNotification('❌ Заполните обязательные поля', 'error');
        return;
    }

    const newProduct = {
        id: Date.now().toString(),
        name: name,
        description: description || 'Описание отсутствует',
        price: price,
        category: category,
        image: image || 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения',
        status: 'in_stock',
        createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    showNotification('✅ Товар добавлен');
    editProducts();
}

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.toggleConstructor = toggleConstructor;
window.showLoginPanel = showLoginPanel;
window.login = login;
window.closePanel = closePanel;
window.editProducts = editProducts;
window.showAddProductForm = showAddProductForm;
window.addProduct = addProduct;
