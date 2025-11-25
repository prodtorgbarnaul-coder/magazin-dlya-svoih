// ==================== КОНСТРУКТОР САЙТА ====================
function toggleConstructor() {
    const editButtons = document.getElementById('editButtons');
    const isVisible = editButtons.style.display === 'flex';
    
    editButtons.style.display = isVisible ? 'none' : 'flex';
    
    // Анимация появления
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

function logout() {
    localStorage.setItem('isAdmin', 'false');
    isAdmin = false;
    document.getElementById('constructorToolbar').style.display = 'none';
    showNotification('👋 Вы вышли из панели управления');
}

function closePanel() {
    document.getElementById('editOverlay').style.display = 'none';
    document.getElementById('productsPanel').style.display = 'none';
}

// ==================== РЕДАКТИРОВАНИЕ ФОНА ====================
function editBackground() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>🎨 Настройка фона сайта</h3>
        
        <div class="form-group">
            <label>Тип фона:</label>
            <select class="form-control" id="backgroundType" onchange="toggleBackgroundOptions()">
                <option value="gradient">Градиент</option>
                <option value="solid">Сплошной цвет</option>
                <option value="image">Изображение</option>
            </select>
        </div>

        <div id="gradientOptions">
            <div class="form-group">
                <label>Первый цвет градиента:</label>
                <input type="color" class="form-control" id="color1" value="${siteSettings.color1 || '#667eea'}">
            </div>
            <div class="form-group">
                <label>Второй цвет градиента:</label>
                <input type="color" class="form-control" id="color2" value="${siteSettings.color2 || '#764ba2'}">
            </div>
        </div>

        <div id="solidOptions" style="display: none;">
            <div class="form-group">
                <label>Цвет фона:</label>
                <input type="color" class="form-control" id="solidColor" value="${siteSettings.solidColor || '#f8f9fa'}">
            </div>
        </div>

        <div id="imageOptions" style="display: none;">
            <div class="form-group">
                <label>URL изображения:</label>
                <input type="text" class="form-control" id="backgroundImage" 
                       placeholder="https://example.com/image.jpg" value="${siteSettings.backgroundImage || ''}">
            </div>
            <div class="form-group">
                <label>Или загрузите файл:</label>
                <input type="file" class="form-control" id="backgroundUpload" accept="image/*">
            </div>
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveBackground()">Применить</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>
    `;

    // Восстанавливаем сохраненные настройки
    if (siteSettings.backgroundType) {
        document.getElementById('backgroundType').value = siteSettings.backgroundType;
        toggleBackgroundOptions();
    }
}

function toggleBackgroundOptions() {
    const type = document.getElementById('backgroundType').value;
    
    document.getElementById('gradientOptions').style.display = type === 'gradient' ? 'block' : 'none';
    document.getElementById('solidOptions').style.display = type === 'solid' ? 'block' : 'none';
    document.getElementById('imageOptions').style.display = type === 'image' ? 'block' : 'none';
}

function saveBackground() {
    const backgroundType = document.getElementById('backgroundType').value;
    
    siteSettings.backgroundType = backgroundType;
    
    if (backgroundType === 'gradient') {
        siteSettings.color1 = document.getElementById('color1').value;
        siteSettings.color2 = document.getElementById('color2').value;
    } else if (backgroundType === 'solid') {
        siteSettings.solidColor = document.getElementById('solidColor').value;
    } else if (backgroundType === 'image') {
        siteSettings.backgroundImage = document.getElementById('backgroundImage').value;
    }
    
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    applySiteSettings();
    showNotification('✅ Фон сайта обновлен');
    closePanel();
}

// ==================== РЕДАКТИРОВАНИЕ ШАПКИ ====================
function editHeader() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>🏢 Настройка шапки сайта</h3>
        
        <div class="form-group">
            <label>Название сайта:</label>
            <input type="text" class="form-control" id="siteTitle" 
                   value="${siteSettings.siteTitle || 'Магазин \"Для своих\"'}">
        </div>

        <div class="form-group">
            <label>Описание сайта:</label>
            <input type="text" class="form-control" id="siteDescription" 
                   value="${siteSettings.siteDescription || 'Лучшие товары по специальным ценам'}">
        </div>

        <div class="form-group">
            <label>Телефон:</label>
            <input type="text" class="form-control" id="headerPhone" 
                   value="${siteSettings.headerPhone || '+7 (923) 753-36-06'}">
        </div>

        <div class="form-group">
            <label>Email:</label>
            <input type="email" class="form-control" id="headerEmail" 
                   value="${siteSettings.headerEmail || 'prodtorg.barnaul@gmail.com'}">
        </div>

        <div class="form-group">
            <label>Адрес:</label>
            <input type="text" class="form-control" id="headerAddress" 
                   value="${siteSettings.headerAddress || 'г. Барнаул, ул. Островского, 10'}">
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveHeader()">Сохранить</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>
    `;
}

function saveHeader() {
    siteSettings.siteTitle = document.getElementById('siteTitle').value;
    siteSettings.siteDescription = document.getElementById('siteDescription').value;
    siteSettings.headerPhone = document.getElementById('headerPhone').value;
    siteSettings.headerEmail = document.getElementById('headerEmail').value;
    siteSettings.headerAddress = document.getElementById('headerAddress').value;
    
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    applySiteSettings();
    showNotification('✅ Шапка сайта обновлена');
    closePanel();
}

// ==================== РЕДАКТИРОВАНИЕ КАТЕГОРИЙ ====================
function editCategories() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>🏷️ Управление категориями</h3>
        
        <div class="categories-list" id="categoriesList">
            ${categoriesData.map((category, index) => `
                <div class="category-editor-item">
                    <div class="category-header">
                        <h4>${category.name}</h4>
                        <div class="category-actions">
                            <button class="btn btn-sm btn-outline" onclick="editCategory(${index})">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${index})" ${category.id === 'all' ? 'disabled' : ''}>🗑️</button>
                        </div>
                    </div>
                    <div class="category-details">
                        <span style="color: ${category.color};"><i class="${category.icon}"></i> ${category.id}</span>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="panel-actions">
            <button class="btn btn-primary" onclick="showAddCategoryForm()">+ Добавить категорию</button>
            <button class="btn btn-danger" onclick="closePanel()">Закрыть</button>
        </div>
    `;
}

function showAddCategoryForm() {
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>➕ Добавление категории</h3>
        
        <div class="form-group">
            <label>Название категории:</label>
            <input type="text" class="form-control" id="newCategoryName" placeholder="Новая категория">
        </div>

        <div class="form-group">
            <label>ID категории (латинскими буквами):</label>
            <input type="text" class="form-control" id="newCategoryId" placeholder="new_category">
        </div>

        <div class="form-group">
            <label>Иконка (Font Awesome):</label>
            <input type="text" class="form-control" id="newCategoryIcon" placeholder="fas fa-tag">
            <small style="color: var(--gray);">Используйте классы Font Awesome, например: fas fa-tag, fas fa-tshirt</small>
        </div>

        <div class="form-group">
            <label>Цвет категории:</label>
            <input type="color" class="form-control" id="newCategoryColor" value="#667eea">
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="addCategory()">Добавить</button>
            <button class="btn btn-danger" onclick="editCategories()">Отмена</button>
        </div>
    `;
}

function addCategory() {
    const name = document.getElementById('newCategoryName').value;
    const id = document.getElementById('newCategoryId').value;
    const icon = document.getElementById('newCategoryIcon').value;
    const color = document.getElementById('newCategoryColor').value;
    
    if (!name || !id) {
        showNotification('❌ Заполните все поля', 'error');
        return;
    }
    
    if (categoriesData.find(cat => cat.id === id)) {
        showNotification('❌ Категория с таким ID уже существует', 'error');
        return;
    }
    
    categoriesData.push({
        id: id,
        name: name,
        icon: icon || 'fas fa-tag',
        color: color
    });
    
    localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
    updateCategoryFilter();
    showNotification('✅ Категория добавлена');
    editCategories();
}

// ==================== РЕДАКТИРОВАНИЕ ТОВАРОВ ====================
function editProducts() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📦 Управление товарами</h3>
        
        <div class="panel-actions" style="margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="showAddProductForm()">+ Добавить товар</button>
            <button class="btn btn-success" onclick="exportToExcel()">📊 Экспорт в Excel</button>
            <button class="btn btn-info" onclick="importFromExcel()">📥 Импорт из Excel</button>
        </div>

        <div class="products-editor-list">
            ${products.map((product, index) => `
                <div class="product-editor-item">
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/60x60/ecf0f1/7f8c8d?text=Нет'">
                    <div class="product-editor-info">
                        <div class="product-editor-name">${product.name}</div>
                        <div class="product-editor-details">
                            <span>${product.price} ₽</span> • 
                            <span style="color: ${categoriesData.find(c => c.id === product.category)?.color || '#666'}">
                                ${categoriesData.find(c => c.id === product.category)?.name || product.category}
                            </span>
                        </div>
                    </div>
                    <div class="product-editor-actions">
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

        <div class="form-group">
            <label>Или загрузите изображение:</label>
            <input type="file" class="form-control" id="productImageUpload" accept="image/*">
        </div>

        <div class="form-group">
            <label>Статус:</label>
            <select class="form-control" id="productStatus">
                <option value="in_stock">В наличии</option>
                <option value="out_of_stock">Нет в наличии</option>
                <option value="preorder">Предзаказ</option>
            </select>
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
    const status = document.getElementById('productStatus').value;

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
        status: status,
        createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    showNotification('✅ Товар добавлен');
    editProducts();
}

function editProduct(index) {
    const product = products[index];
    
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>✏️ Редактирование товара</h3>
        
        <div class="form-group">
            <label>Название товара:</label>
            <input type="text" class="form-control" id="editProductName" value="${product.name}">
        </div>

        <div class="form-group">
            <label>Описание:</label>
            <textarea class="form-control" id="editProductDescription" rows="3">${product.description}</textarea>
        </div>

        <div class="form-group">
            <label>Цена (₽):</label>
            <input type="number" class="form-control" id="editProductPrice" value="${product.price}" min="0">
        </div>

        <div class="form-group">
            <label>Категория:</label>
            <select class="form-control" id="editProductCategory">
                ${categoriesData.filter(cat => cat.id !== 'all').map(cat => 
                    `<option value="${cat.id}" ${cat.id === product.category ? 'selected' : ''}>${cat.name}</option>`
                ).join('')}
            </select>
        </div>

        <div class="form-group">
            <label>URL изображения:</label>
            <input type="text" class="form-control" id="editProductImage" value="${product.image}">
        </div>

        <div class="form-group">
            <label>Статус:</label>
            <select class="form-control" id="editProductStatus">
                <option value="in_stock" ${product.status === 'in_stock' ? 'selected' : ''}>В наличии</option>
                <option value="out_of_stock" ${product.status === 'out_of_stock' ? 'selected' : ''}>Нет в наличии</option>
                <option value="preorder" ${product.status === 'preorder' ? 'selected' : ''}>Предзаказ</option>
            </select>
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveProduct(${index})">Сохранить</button>
            <button class="btn btn-danger" onclick="editProducts()">Отмена</button>
        </div>
    `;
}

function saveProduct(index) {
    const product = products[index];
    
    product.name = document.getElementById('editProductName').value;
    product.description = document.getElementById('editProductDescription').value;
    product.price = parseInt(document.getElementById('editProductPrice').value);
    product.category = document.getElementById('editProductCategory').value;
    product.image = document.getElementById('editProductImage').value;
    product.status = document.getElementById('editProductStatus').value;

    localStorage.setItem('products', JSON.stringify(products));
    showNotification('✅ Товар обновлен');
    editProducts();
}

function deleteProduct(index) {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        showNotification('🗑️ Товар удален');
        editProducts();
    }
}

// ==================== ЭКСПОРТ/ИМПОРТ EXCEL ====================
function exportToExcel() {
    try {
        const ws = XLSX.utils.json_to_sheet(products.map(p => ({
            'Название': p.name,
            'Описание': p.description,
            'Цена': p.price,
            'Категория': p.category,
            'Статус': p.status,
            'ID': p.id
        })));
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Товары");
        XLSX.writeFile(wb, "товары_магазина.xlsx");
        showNotification('📊 Excel файл экспортирован');
    } catch (error) {
        showNotification('❌ Ошибка при экспорте', 'error');
        console.error('Export error:', error);
    }
}

function importFromExcel() {
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📥 Импорт товаров из Excel</h3>
        
        <div class="form-group">
            <label>Выберите Excel файл:</label>
            <input type="file" class="form-control" id="excelFile" accept=".xlsx, .xls">
        </div>

        <div class="form-group">
            <label>или вставьте данные CSV:</label>
            <textarea class="form-control" id="csvData" placeholder="Название,Описание,Цена,Категория&#10;Товар 1,Описание,1000,electronics" rows="5"></textarea>
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="processExcelImport()">Импортировать</button>
            <button class="btn btn-danger" onclick="editProducts()">Отмена</button>
        </div>

        <div style="margin-top: 20px; color: var(--gray); font-size: 0.9rem;">
            <p><strong>Формат данных:</strong></p>
            <p>Excel/CSV должен содержать колонки: Название, Описание, Цена, Категория</p>
        </div>
    `;
}

function processExcelImport() {
    const fileInput = document.getElementById('excelFile');
    const csvData = document.getElementById('csvData').value;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                
                importProductsData(jsonData);
            } catch (error) {
                showNotification('❌ Ошибка при чтении файла', 'error');
                console.error('Excel read error:', error);
            }
        };
        
        reader.readAsArrayBuffer(file);
    } else if (csvData) {
        try {
            const lines = csvData.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const jsonData = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length === headers.length) {
                    const item = {};
                    headers.forEach((header, index) => {
                        item[header] = values[index];
                    });
                    jsonData.push(item);
                }
            }
            
            importProductsData(jsonData);
        } catch (error) {
            showNotification('❌ Ошибка при чтении CSV', 'error');
            console.error('CSV read error:', error);
        }
    } else {
        showNotification('❌ Выберите файл или введите данные', 'error');
    }
}

function importProductsData(data) {
    let importedCount = 0;
    
    data.forEach(item => {
        const name = item['Название'] || item['Name'];
        const price = parseInt(item['Цена'] || item['Price']);
        
        if (name && price) {
            const newProduct = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name: name,
                description: item['Описание'] || item['Description'] || 'Описание отсутствует',
                price: price,
                category: item['Категория'] || item['Category'] || 'other',
                image: item['Изображение'] || item['Image'] || 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения',
                status: 'in_stock',
                createdAt: new Date().toISOString()
            };
            
            products.push(newProduct);
            importedCount++;
        }
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    showNotification(`✅ Импортировано ${importedCount} товаров`);
    editProducts();
}

// ==================== УПРАВЛЕНИЕ ЗАКАЗАМИ ====================
function editOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📦 Управление заказами</h3>
        
        ${orders.length === 0 ? `
            <div style="text-align: center; color: var(--gray); padding: 40px;">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>Заказов пока нет</p>
            </div>
        ` : `
            <div class="orders-list">
                ${orders.map((order, index) => `
                    <div class="order-item">
                        <div class="order-header">
                            <div class="order-info">
                                <strong>Заказ #${order.id}</strong>
                                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div class="order-status ${order.status}">
                                ${getOrderStatusText(order.status)}
                            </div>
                        </div>
                        <div class="order-details">
                            <div class="order-customer">
                                <strong>Клиент:</strong> ${order.customerName} (${order.customerPhone})
                            </div>
                            <div class="order-items">
                                <strong>Товары:</strong> ${order.items.length} шт.
                            </div>
                            <div class="order-total">
                                <strong>Сумма:</strong> ${order.total} ₽
                            </div>
                        </div>
                        <div class="order-actions">
                            <select onchange="updateOrderStatus(${index}, this.value)" class="form-control">
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Выполнен</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                            </select>
                            <button class="btn btn-sm btn-danger" onclick="deleteOrder(${index})">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}

        <div class="panel-actions">
            <button class="btn btn-danger" onclick="closePanel()">Закрыть</button>
        </div>
    `;
}

function getOrderStatusText(status) {
    const statusMap = {
        'processing': 'В обработке',
        'completed': 'Выполнен', 
        'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
}

function updateOrderStatus(orderIndex, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders[orderIndex]) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        showNotification('✅ Статус заказа обновлен');
    }
}

function deleteOrder(orderIndex) {
    if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.splice(orderIndex, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        showNotification('🗑️ Заказ удален');
        editOrders();
    }
}

// ==================== РОЗЫГРЫШ И АКЦИИ ====================
function editGiveaway() {
    const giveaway = JSON.parse(localStorage.getItem('giveaway')) || {
        active: false,
        title: '',
        description: '',
        prize: '',
        endDate: '',
        participants: []
    };
    
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>🎁 Управление розыгрышем</h3>
        
        <div class="form-group">
            <label>
                <input type="checkbox" id="giveawayActive" ${giveaway.active ? 'checked' : ''}>
                Активный розыгрыш
            </label>
        </div>

        <div class="form-group">
            <label>Название розыгрыша:</label>
            <input type="text" class="form-control" id="giveawayTitle" 
                   value="${giveaway.title || 'Розыгрыш призов!'}" placeholder="Название розыгрыша">
        </div>

        <div class="form-group">
            <label>Описание:</label>
            <textarea class="form-control" id="giveawayDescription" rows="3" 
                      placeholder="Описание розыгрыша и условия участия">${giveaway.description || ''}</textarea>
        </div>

        <div class="form-group">
            <label>Приз:</label>
            <input type="text" class="form-control" id="giveawayPrize" 
                   value="${giveaway.prize || ''}" placeholder="Описание приза">
        </div>

        <div class="form-group">
            <label>Дата окончания:</label>
            <input type="date" class="form-control" id="giveawayEndDate" value="${giveaway.endDate || ''}">
        </div>

        ${giveaway.participants.length > 0 ? `
            <div class="giveaway-participants">
                <h4>Участники (${giveaway.participants.length}):</h4>
                <div class="participants-list">
                    ${giveaway.participants.map((participant, index) => `
                        <div class="participant-item">
                            <span>${participant.name} (${participant.phone})</span>
                            <span class="participant-date">${new Date(participant.date).toLocaleDateString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveGiveaway()">Сохранить розыгрыш</button>
            ${giveaway.participants.length > 0 ? `
                <button class="btn btn-primary" onclick="selectWinner()">🎲 Выбрать победителя</button>
            ` : ''}
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>
    `;
}

function saveGiveaway() {
    const giveaway = {
        active: document.getElementById('giveawayActive').checked,
        title: document.getElementById('giveawayTitle').value,
        description: document.getElementById('giveawayDescription').value,
        prize: document.getElementById('giveawayPrize').value,
        endDate: document.getElementById('giveawayEndDate').value,
        participants: JSON.parse(localStorage.getItem('giveaway'))?.participants || []
    };
    
    localStorage.setItem('giveaway', JSON.stringify(giveaway));
    showNotification('✅ Розыгрыш сохранен');
    closePanel();
}

function selectWinner() {
    const giveaway = JSON.parse(localStorage.getItem('giveaway'));
    if (!giveaway || giveaway.participants.length === 0) {
        showNotification('❌ Нет участников для розыгрыша', 'error');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * giveaway.participants.length);
    const winner = giveaway.participants[randomIndex];
    
    alert(`🎉 Победитель: ${winner.name} (${winner.phone})\n\nПриз: ${giveaway.prize}`);
    
    // Можно отправить уведомление в WhatsApp
    const message = `🎉 Поздравляем! Вы выиграли в розыгрыше "${giveaway.title}"!\n\nПриз: ${giveaway.prize}\n\nСвяжитесь с нами для получения приза: ${siteSettings.headerPhone || '+7 (923) 753-36-06'}`;
    const whatsappUrl = `https://wa.me/${winner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    if (confirm('Открыть WhatsApp для отправки поздравления победителю?')) {
        window.open(whatsappUrl, '_blank');
    }
}

// ==================== ИМПОРТ ИЗ WHATSAPP ====================
function importFromWhatsApp() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📱 Импорт из WhatsApp</h3>
        
        <div class="form-group">
            <label>Ссылка на каталог WhatsApp:</label>
            <input type="text" class="form-control" id="whatsappCatalogUrl" 
                   placeholder="https://wa.me/catalog/...">
        </div>

        <div class="form-group">
            <label>или вставьте данные товаров (каждый товар с новой строки):</label>
            <textarea class="form-control" id="whatsappData" rows="8" 
placeholder="Название товара 1 - 1000 ₽
Описание товара 1
📸 Фото: [ссылка на фото]

Название товара 2 - 2000 ₽  
Описание товара 2
📸 Фото: [ссылка на фото]"></textarea>
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="processWhatsAppImport()">Импортировать</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>

        <div style="margin-top: 20px; color: var(--gray); font-size: 0.9rem;">
            <p><strong>Формат данных WhatsApp:</strong></p>
            <p>• Каждый товар в отдельном блоке</p>
            <p>• Первая строка: Название - Цена ₽</p>
            <p>• Вторая строка: Описание</p>
            <p>• Третья строка: 📸 Фото: [ссылка]</p>
        </div>
    `;
}

function processWhatsAppImport() {
    const catalogUrl = document.getElementById('whatsappCatalogUrl').value;
    const textData = document.getElementById('whatsappData').value;

    if (textData) {
        importFromTextData(textData);
    } else if (catalogUrl) {
        showNotification('⚠️ Ручной импорт из ссылки пока не поддерживается. Используйте текстовый ввод.', 'warning');
    } else {
        showNotification('❌ Введите данные для импорта', 'error');
    }
}

function importFromTextData(textData) {
    const productBlocks = textData.split('\n\n');
    let importedCount = 0;

    productBlocks.forEach(block => {
        const lines = block.split('\n').filter(line => line.trim());
        
        if (lines.length >= 2) {
            // Парсим первую строку: "Название - Цена ₽"
            const firstLine = lines[0];
            const priceMatch = firstLine.match(/(\d+)\s*₽/);
            const price = priceMatch ? parseInt(priceMatch[1]) : 0;
            
            // Название - все до цены
            let name = firstLine;
            if (priceMatch) {
                name = firstLine.substring(0, priceMatch.index).trim();
                // Убираем разделитель "-" если есть
                name = name.replace(/\s*-\s*$/, '');
            }

            // Описание - вторая строка
            const description = lines[1];

            // Ищем ссылку на изображение
            let image = '';
            for (let line of lines) {
                if (line.includes('📸') && line.includes('http')) {
                    const urlMatch = line.match(/https?:\/\/[^\s]+/);
                    if (urlMatch) {
                        image = urlMatch[0];
                        break;
                    }
                }
            }

            if (name && price > 0) {
                const newProduct = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: name,
                    description: description,
                    price: price,
                    category: 'other',
                    image: image || 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения',
                    status: 'in_stock',
                    createdAt: new Date().toISOString(),
                    importedFrom: 'whatsapp'
                };

                products.push(newProduct);
                importedCount++;
            }
        }
    });

    if (importedCount > 0) {
        localStorage.setItem('products', JSON.stringify(products));
        showNotification(`✅ Импортировано ${importedCount} товаров из WhatsApp`);
        closePanel();
    } else {
        showNotification('❌ Не удалось импортировать товары', 'error');
    }
}

// ==================== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ КАТЕГОРИЙ ====================
function editCategory(index) {
    const category = categoriesData[index];
    
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>✏️ Редактирование категории</h3>
        
        <div class="form-group">
            <label>Название категории:</label>
            <input type="text" class="form-control" id="editCategoryName" value="${category.name}">
        </div>

        <div class="form-group">
            <label>ID категории:</label>
            <input type="text" class="form-control" id="editCategoryId" value="${category.id}" ${category.id === 'all' ? 'readonly' : ''}>
        </div>

        <div class="form-group">
            <label>Иконка (Font Awesome):</label>
            <input type="text" class="form-control" id="editCategoryIcon" value="${category.icon}">
        </div>

        <div class="form-group">
            <label>Цвет категории:</label>
            <input type="color" class="form-control" id="editCategoryColor" value="${category.color}">
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveCategory(${index})">Сохранить</button>
            <button class="btn btn-danger" onclick="editCategories()">Отмена</button>
        </div>
    `;
}

function saveCategory(index) {
    categoriesData[index].name = document.getElementById('editCategoryName').value;
    
    if (categoriesData[index].id !== 'all') {
        categoriesData[index].id = document.getElementById('editCategoryId').value;
    }
    
    categoriesData[index].icon = document.getElementById('editCategoryIcon').value;
    categoriesData[index].color = document.getElementById('editCategoryColor').value;

    localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
    updateCategoryFilter();
    showNotification('✅ Категория обновлена');
    editCategories();
}

function deleteCategory(index) {
    if (categoriesData[index].id === 'all') {
        showNotification('❌ Нельзя удалить основную категорию "Все товары"', 'error');
        return;
    }

    if (confirm(`Вы уверены, что хотите удалить категорию "${categoriesData[index].name}"?`)) {
        // Перемещаем товары этой категории в "other"
        products.forEach(product => {
            if (product.category === categoriesData[index].id) {
                product.category = 'other';
            }
        });
        
        categoriesData.splice(index, 1);
        localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
        localStorage.setItem('products', JSON.stringify(products));
        
        updateCategoryFilter();
        showNotification('🗑️ Категория удалена');
        editCategories();
    }
}

// ==================== СОХРАНЕНИЕ ДИЗАЙНА ====================
function saveDesign() {
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
    showNotification('💾 Дизайн сохранен!');
}

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.toggleConstructor = toggleConstructor;
window.showLoginPanel = showLoginPanel;
window.login = login;
window.logout = logout;
window.closePanel = closePanel;
window.editBackground = editBackground;
window.toggleBackgroundOptions = toggleBackgroundOptions;
window.saveBackground = saveBackground;
window.editHeader = editHeader;
window.saveHeader = saveHeader;
window.editCategories = editCategories;
window.showAddCategoryForm = showAddCategoryForm;
window.addCategory = addCategory;
window.editProducts = editProducts;
window.showAddProductForm = showAddProductForm;
window.addProduct = addProduct;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.exportToExcel = exportToExcel;
window.importFromExcel = importFromExcel;
window.processExcelImport = processExcelImport;
window.editOrders = editOrders;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.editGiveaway = editGiveaway;
window.saveGiveaway = saveGiveaway;
window.selectWinner = selectWinner;
window.importFromWhatsApp = importFromWhatsApp;
window.processWhatsAppImport = processWhatsAppImport;
window.editCategory = editCategory;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;
window.saveDesign = saveDesign;
