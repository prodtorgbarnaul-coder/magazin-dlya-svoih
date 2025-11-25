// ==================== СИНХРОНИЗАЦИЯ КОРЗИНЫ МЕЖДУ ВКЛАДКАМИ ====================
class CartSync {
    constructor() {
        this.storageKey = 'magazin_cart_sync';
        this.init();
    }

    init() {
        // Слушаем изменения в localStorage
        window.addEventListener('storage', this.handleStorageChange.bind(this));
        
        // Синхронизируем при загрузке
        this.syncCart();
        
        // Периодическая синхронизация (на случай если событие storage не сработало)
        setInterval(() => this.syncCart(), 2000);
    }

    handleStorageChange(event) {
        if (event.key === 'cart' || event.key === this.storageKey) {
            this.syncCart();
        }
    }

    syncCart() {
        const syncData = localStorage.getItem(this.storageKey);
        if (!syncData) return;

        try {
            const remoteCart = JSON.parse(syncData);
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];

            // Объединяем корзины
            const mergedCart = this.mergeCarts(localCart, remoteCart);
            
            // Сохраняем объединенную корзину
            localStorage.setItem('cart', JSON.stringify(mergedCart));
            
            // Обновляем UI
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }

            // Обновляем корзину если она открыта
            if (document.getElementById('cartModal').style.display === 'block') {
                if (typeof openCart === 'function') {
                    openCart();
                }
            }

        } catch (error) {
            console.error('Cart sync error:', error);
        }
    }

    mergeCarts(localCart, remoteCart) {
        const merged = [...localCart];
        
        remoteCart.forEach(remoteItem => {
            const existingItemIndex = merged.findIndex(item => 
                item.id === remoteItem.id && item.cartId === remoteItem.cartId
            );

            if (existingItemIndex !== -1) {
                // Обновляем количество
                merged[existingItemIndex].quantity = Math.max(
                    merged[existingItemIndex].quantity,
                    remoteItem.quantity
                );
            } else {
                // Добавляем новый товар
                merged.push(remoteItem);
            }
        });

        return merged;
    }

    broadcastCartUpdate() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
        
        // Триггерим собственное событие для других вкладок
        localStorage.removeItem(this.storageKey);
        setTimeout(() => {
            localStorage.setItem(this.storageKey, JSON.stringify(cart));
        }, 100);
    }
}

// ==================== РЕАКТИВНЫЕ СВОЙСТВА ДЛЯ КОРЗИНЫ ====================
function makeCartReactive() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Перехватываем методы работы с корзиной
    const originalAddToCart = window.addToCart;
    const originalChangeQuantity = window.changeQuantity;
    const originalRemoveFromCart = window.removeFromCart;
    
    window.addToCart = function(productId) {
        originalAddToCart(productId);
        cartSync.broadcastCartUpdate();
    };
    
    window.changeQuantity = function(cartId, change) {
        originalChangeQuantity(cartId, change);
        cartSync.broadcastCartUpdate();
    };
    
    window.removeFromCart = function(cartId) {
        originalRemoveFromCart(cartId);
        cartSync.broadcastCartUpdate();
    };
}

// ==================== ОФФЛАЙН-РЕЖИМ ====================
class OfflineManager {
    constructor() {
        this.init();
    }

    init() {
        // Проверяем онлайн статус
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Показываем текущий статус
        this.updateOnlineStatus();
    }

    handleOnline() {
        this.updateOnlineStatus();
        showNotification('🌐 Соединение восстановлено', 'success');
        
        // Синхронизируем данные при восстановлении связи
        this.syncPendingData();
    }

    handleOffline() {
        this.updateOnlineStatus();
        showNotification('⚠️ Работаем в оффлайн-режиме', 'warning');
    }

    updateOnlineStatus() {
        const statusElement = document.getElementById('onlineStatus') || this.createStatusElement();
        statusElement.textContent = navigator.online ? '🌐 Онлайн' : '⚠️ Оффлайн';
        statusElement.style.background = navigator.online ? 'var(--success)' : 'var(--warning)';
    }

    createStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.id = 'onlineStatus';
        statusElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: var(--success);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            z-index: 10000;
        `;
        document.body.appendChild(statusElement);
        return statusElement;
    }

    syncPendingData() {
        // Здесь можно добавить синхронизацию с сервером
        console.log('Syncing pending data...');
    }
}

// ==================== ЭКСПОРТ ДАННЫХ ====================
function exportCartData() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const exportData = {
        cart: cart,
        orders: orders,
        exportDate: new Date().toISOString(),
        totalOrders: orders.length,
        totalCartItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `cart_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('📊 Данные корзины экспортированы');
}

function importCartData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (importData.cart) {
                localStorage.setItem('cart', JSON.stringify(importData.cart));
            }
            
            if (importData.orders) {
                localStorage.setItem('orders', JSON.stringify(importData.orders));
            }
            
            showNotification('✅ Данные корзины импортированы');
            
            // Обновляем UI
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
            
        } catch (error) {
            showNotification('❌ Ошибка при импорте данных', 'error');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
}

// ==================== АНАЛИТИКА КОРЗИНЫ ====================
class CartAnalytics {
    constructor() {
        this.trackEvents();
    }

    trackEvents() {
        // Отслеживаем добавление в корзину
        const originalAddToCart = window.addToCart;
        window.addToCart = function(productId) {
            originalAddToCart(productId);
            cartAnalytics.logEvent('add_to_cart', { productId });
        };

        // Отслеживаем оформление заказа
        const originalCompleteWhatsAppOrder = window.completeWhatsAppOrder;
        window.completeWhatsAppOrder = function() {
            cartAnalytics.logEvent('purchase', { 
                value: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                items: cart.length
            });
            originalCompleteWhatsAppOrder();
        };
    }

    logEvent(eventName, params = {}) {
        const analyticsData = JSON.parse(localStorage.getItem('cart_analytics')) || {};
        const event = {
            timestamp: new Date().toISOString(),
            event: eventName,
            ...params
        };
        
        if (!analyticsData.events) {
            analyticsData.events = [];
        }
        
        analyticsData.events.push(event);
        localStorage.setItem('cart_analytics', JSON.stringify(analyticsData));
        
        console.log('Analytics event:', eventName, params);
    }

    getStats() {
        const analyticsData = JSON.parse(localStorage.getItem('cart_analytics')) || { events: [] };
        const events = analyticsData.events || [];
        
        const addToCartEvents = events.filter(e => e.event === 'add_to_cart');
        const purchaseEvents = events.filter(e => e.event === 'purchase');
        
        return {
            totalAddToCart: addToCartEvents.length,
            totalPurchases: purchaseEvents.length,
            totalRevenue: purchaseEvents.reduce((sum, e) => sum + (e.value || 0), 0),
            conversionRate: purchaseEvents.length / Math.max(addToCartEvents.length, 1)
        };
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
let cartSync;
let offlineManager;
let cartAnalytics;

document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем менеджеры
    cartSync = new CartSync();
    offlineManager = new OfflineManager();
    cartAnalytics = new CartAnalytics();
    
    // Делаем корзину реактивной
    makeCartReactive();
    
    // Добавляем кнопки управления данными для админа
    if (isAdmin) {
        addAdminDataButtons();
    }
});

function addAdminDataButtons() {
    const adminPanel = document.createElement('div');
    adminPanel.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 20px;
        z-index: 9999;
        background: rgba(255,255,255,0.95);
        padding: 10px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
    `;
    
    adminPanel.innerHTML = `
        <div style="display: flex; gap: 5px; flex-direction: column;">
            <button class="btn btn-sm btn-info" onclick="exportCartData()">📊 Экспорт данных</button>
            <button class="btn btn-sm btn-warning" onclick="showAnalytics()">📈 Аналитика</button>
            <input type="file" id="cartImport" accept=".json" style="display: none;" onchange="handleCartImport(this.files[0])">
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('cartImport').click()">📥 Импорт</button>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
}

function showAnalytics() {
    const stats = cartAnalytics.getStats();
    
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📈 Аналитика корзины</h3>
        
        <div class="analytics-stats">
            <div class="stat-item">
                <div class="stat-value">${stats.totalAddToCart}</div>
                <div class="stat-label">Добавлений в корзину</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.totalPurchases}</div>
                <div class="stat-label">Оформленных заказов</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.totalRevenue.toLocaleString()} ₽</div>
                <div class="stat-label">Общая выручка</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${(stats.conversionRate * 100).toFixed(1)}%</div>
                <div class="stat-label">Конверсия</div>
            </div>
        </div>

        <div class="panel-actions">
            <button class="btn btn-danger" onclick="clearAnalytics()">Очистить аналитику</button>
            <button class="btn btn-primary" onclick="closePanel()">Закрыть</button>
        </div>
    `;
}

function clearAnalytics() {
    if (confirm('Очистить всю аналитику?')) {
        localStorage.removeItem('cart_analytics');
        showNotification('🗑️ Аналитика очищена');
        closePanel();
    }
}

function handleCartImport(file) {
    if (file) {
        importCartData(file);
    }
}

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.exportCartData = exportCartData;
window.importCartData = importCartData;
window.showAnalytics = showAnalytics;
window.clearAnalytics = clearAnalytics;
window.handleCartImport = handleCartImport;