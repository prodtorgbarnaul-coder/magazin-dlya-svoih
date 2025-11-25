// ==================== ИНТЕГРАЦИЯ С WHATSAPP ====================
let whatsappSyncEnabled = localStorage.getItem('whatsappSyncEnabled') === 'true';
let whatsappPhoneNumber = localStorage.getItem('whatsappPhoneNumber') || '+79237533606';

function showCartSyncPanel() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📱 Синхронизация корзины с WhatsApp</h3>
        
        <div class="form-group">
            <label>
                <input type="checkbox" id="whatsappSyncEnabled" ${whatsappSyncEnabled ? 'checked' : ''}>
                Включить автоматическую синхронизацию
            </label>
        </div>

        <div class="form-group">
            <label>Номер WhatsApp для заказов:</label>
            <input type="tel" class="form-control" id="whatsappPhone" 
                   value="${whatsappPhoneNumber}" placeholder="+79237533606">
        </div>

        <div class="form-group">
            <label>Шаблон сообщения для заказа:</label>
            <textarea class="form-control" id="orderTemplate" rows="4" placeholder="Создайте шаблон сообщения для заказов">
${generateOrderTemplate()}</textarea>
        </div>

        <div class="current-order-preview">
            <h4>Предпросмотр текущего заказа:</h4>
            <div class="order-preview" id="orderPreview">
                ${generateOrderPreview()}
            </div>
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveWhatsAppSettings()">Сохранить настройки</button>
            <button class="btn btn-primary" onclick="sendOrderToWhatsApp()">📤 Отправить текущий заказ</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>

        <div style="margin-top: 20px; color: var(--gray); font-size: 0.9rem;">
            <p><strong>Как это работает:</strong></p>
            <p>• При оформлении заказа клиент будет перенаправлен в WhatsApp</p>
            <p>• В сообщении автоматически подставятся товары из корзины</p>
            <p>• Клиенту останется только подтвердить заказ</p>
        </div>
    `;
}

function generateOrderTemplate() {
    const template = localStorage.getItem('orderTemplate') || `🛒 НОВЫЙ ЗАКАЗ

Товары:
{ITEMS}

💰 Итого: {TOTAL} ₽

📞 Телефон: {PHONE}
👤 Имя: {NAME}
📍 Адрес: {ADDRESS}

💬 Комментарий: {COMMENT}`;

    return template;
}

function generateOrderPreview() {
    if (cart.length === 0) {
        return '<p style="color: var(--gray);">Корзина пуста</p>';
    }

    const itemsText = cart.map(item => 
        `• ${item.name} - ${item.quantity} × ${item.price} ₽ = ${item.quantity * item.price} ₽`
    ).join('\n');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const preview = `🛒 НОВЫЙ ЗАКАЗ

Товары:
${itemsText}

💰 Итого: ${total} ₽

📞 Телефон: +7 XXX XXX-XX-XX
👤 Имя: Иван Иванов
📍 Адрес: г. Барнаул, ул. Примерная, 1

💬 Комментарий: Прошу перезвонить для уточнения времени доставки`;

    return `<pre style="background: var(--light); padding: 15px; border-radius: var(--radius); white-space: pre-wrap;">${preview}</pre>`;
}

function saveWhatsAppSettings() {
    whatsappSyncEnabled = document.getElementById('whatsappSyncEnabled').checked;
    whatsappPhoneNumber = document.getElementById('whatsappPhone').value;
    const orderTemplate = document.getElementById('orderTemplate').value;

    localStorage.setItem('whatsappSyncEnabled', whatsappSyncEnabled);
    localStorage.setItem('whatsappPhoneNumber', whatsappPhoneNumber);
    localStorage.setItem('orderTemplate', orderTemplate);

    showNotification('✅ Настройки WhatsApp сохранены');
    closePanel();
}

function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        showNotification('❌ Корзина пуста', 'error');
        return;
    }

    const orderData = collectOrderData();
    const message = formatOrderMessage(orderData);
    const whatsappUrl = createWhatsAppUrl(message);

    // Сохраняем заказ в историю
    saveOrderToHistory(orderData);

    // Открываем WhatsApp
    window.open(whatsappUrl, '_blank');
    
    showNotification('📤 Заказ отправлен в WhatsApp');
    closePanel();
}

function collectOrderData() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
        id: 'ORDER_' + Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        total: total,
        status: 'processing',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        comment: ''
    };
}

function formatOrderMessage(orderData) {
    let template = localStorage.getItem('orderTemplate') || generateOrderTemplate();

    const itemsText = orderData.items.map(item => 
        `• ${item.name} - ${item.quantity} × ${item.price} ₽ = ${item.quantity * item.price} ₽`
    ).join('\n');

    // Заменяем плейсхолдеры в шаблоне
    return template
        .replace('{ITEMS}', itemsText)
        .replace('{TOTAL}', orderData.total.toLocaleString())
        .replace('{PHONE}', orderData.customerPhone)
        .replace('{NAME}', orderData.customerName)
        .replace('{ADDRESS}', orderData.customerAddress)
        .replace('{COMMENT}', orderData.comment);
}

function createWhatsAppUrl(message) {
    const phone = whatsappPhoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
}

function saveOrderToHistory(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// ==================== АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ ====================
function setupWhatsAppSync() {
    if (!whatsappSyncEnabled) return;

    // Добавляем кнопку "Оформить через WhatsApp" в корзину
    const cartModal = document.getElementById('cartModal');
    if (cartModal && !document.querySelector('.whatsapp-checkout-btn')) {
        const whatsappBtn = document.createElement('button');
        whatsappBtn.className = 'btn btn-success whatsapp-checkout-btn';
        whatsappBtn.style.marginTop = '15px';
        whatsappBtn.style.width = '100%';
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Оформить через WhatsApp';
        whatsappBtn.onclick = startWhatsAppCheckout;

        const cartItems = document.getElementById('cartItems');
        cartItems.parentNode.insertBefore(whatsappBtn, cartItems.nextSibling);
    }
}

function startWhatsAppCheckout() {
    if (cart.length === 0) {
        showNotification('❌ Корзина пуста', 'error');
        return;
    }

    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📝 Оформление заказа</h3>
        
        <div class="form-group">
            <label>Ваше имя:</label>
            <input type="text" class="form-control" id="customerName" placeholder="Иван Иванов" required>
        </div>

        <div class="form-group">
            <label>Телефон:</label>
            <input type="tel" class="form-control" id="customerPhone" placeholder="+7 (923) 753-36-06" required>
        </div>

        <div class="form-group">
            <label>Адрес доставки:</label>
            <input type="text" class="form-control" id="customerAddress" placeholder="г. Барнаул, ул. Островского, 10">
        </div>

        <div class="form-group">
            <label>Комментарий к заказу:</label>
            <textarea class="form-control" id="customerComment" rows="3" placeholder="Пожелания по доставке или товарам"></textarea>
        </div>

        <div class="order-summary">
            <h4>Ваш заказ:</h4>
            <div class="order-items">
                ${cart.map(item => `
                    <div class="order-item-summary">
                        <span>${item.name}</span>
                        <span>${item.quantity} × ${item.price} ₽</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total-summary">
                <strong>Итого: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽</strong>
            </div>
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="completeWhatsAppOrder()">📤 Отправить заказ в WhatsApp</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>
    `;
}

function completeWhatsAppOrder() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const comment = document.getElementById('customerComment').value;

    if (!name || !phone) {
        showNotification('❌ Заполните обязательные поля', 'error');
        return;
    }

    const orderData = collectOrderData();
    orderData.customerName = name;
    orderData.customerPhone = phone;
    orderData.customerAddress = address;
    orderData.comment = comment;

    const message = formatOrderMessage(orderData);
    const whatsappUrl = createWhatsAppUrl(message);

    // Сохраняем заказ
    saveOrderToHistory(orderData);

    // Очищаем корзину
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Закрываем модальные окна
    closePanel();
    closeCart();

    // Открываем WhatsApp
    window.open(whatsappUrl, '_blank');
    
    showNotification('✅ Заказ оформлен! Открывается WhatsApp...');
}

// ==================== РОЗЫГРЫШ ЧЕРЕЗ WHATSAPP ====================
function setupGiveawayIntegration() {
    const giveaway = JSON.parse(localStorage.getItem('giveaway')) || {};
    if (!giveaway.active) return;

    // Добавляем блок розыгрыша на сайт
    const mainContent = document.querySelector('.main-content .container');
    if (mainContent && !document.getElementById('giveawaySection')) {
        const giveawaySection = document.createElement('div');
        giveawaySection.id = 'giveawaySection';
        giveawaySection.className = 'giveaway-section';
        giveawaySection.innerHTML = `
            <div class="giveaway-banner" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: var(--radius); margin: 30px 0; text-align: center;">
                <h2>🎁 ${giveaway.title}</h2>
                <p>${giveaway.description}</p>
                <p><strong>Приз:</strong> ${giveaway.prize}</p>
                <p><strong>Дата окончания:</strong> ${new Date(giveaway.endDate).toLocaleDateString()}</p>
                <button class="btn btn-warning" onclick="participateInGiveaway()" style="margin-top: 15px;">
                    <i class="fas fa-gift"></i> Участвовать в розыгрыше
                </button>
            </div>
        `;
        
        mainContent.insertBefore(giveawaySection, mainContent.firstChild);
    }
}

function participateInGiveaway() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>🎁 Участие в розыгрыше</h3>
        
        <div class="form-group">
            <label>Ваше имя:</label>
            <input type="text" class="form-control" id="participantName" placeholder="Иван Иванов" required>
        </div>

        <div class="form-group">
            <label>Телефон для связи:</label>
            <input type="tel" class="form-control" id="participantPhone" placeholder="+7 (923) 753-36-06" required>
        </div>

        <div class="panel-actions">
            <button class="btn btn-success" onclick="submitGiveawayParticipation()">Участвовать</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>
    `;
}

function submitGiveawayParticipation() {
    const name = document.getElementById('participantName').value;
    const phone = document.getElementById('participantPhone').value;

    if (!name || !phone) {
        showNotification('❌ Заполните все поля', 'error');
        return;
    }

    const giveaway = JSON.parse(localStorage.getItem('giveaway')) || {};
    if (!giveaway.participants) {
        giveaway.participants = [];
    }

    // Проверяем, не участвовал ли уже этот номер
    if (giveaway.participants.find(p => p.phone === phone)) {
        showNotification('❌ Вы уже участвуете в розыгрыше', 'warning');
        closePanel();
        return;
    }

    giveaway.participants.push({
        name: name,
        phone: phone,
        date: new Date().toISOString()
    });

    localStorage.setItem('giveaway', JSON.stringify(giveaway));

    // Отправляем подтверждение в WhatsApp
    const message = `🎉 Спасибо за участие в розыгрыше "${giveaway.title}"!\n\nВы успешно зарегистрированы. Результаты будут announced ${new Date(giveaway.endDate).toLocaleDateString()}.\n\nУдачи! 🍀`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    closePanel();
    window.open(whatsappUrl, '_blank');
    showNotification('✅ Вы участвуете в розыгрыше!');
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupWhatsAppSync();
        setupGiveawayIntegration();
    }, 1000);
});

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.showCartSyncPanel = showCartSyncPanel;
window.sendOrderToWhatsApp = sendOrderToWhatsApp;
window.startWhatsAppCheckout = startWhatsAppCheckout;
window.completeWhatsAppOrder = completeWhatsAppOrder;
window.participateInGiveaway = participateInGiveaway;
window.submitGiveawayParticipation = submitGiveawayParticipation;
