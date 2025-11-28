// ==================== КОРЗИНА ====================
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

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

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

function showCheckoutForm() {
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    closeCart();
    
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    checkoutItems.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>${item.name} × ${item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString()} ₽</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = total.toLocaleString();
    
    // Заполняем данные пользователя если они есть
    if (currentUser.name && currentUser.name !== 'Гость') {
        document.getElementById('customerName').value = currentUser.name;
    }
    if (currentUser.phone) {
        document.getElementById('customerPhone').value = currentUser.phone;
    }
    
    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function submitOrder() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('deliveryAddress').value;
    const comment = document.getElementById('orderComment').value;
    
    if (!name.trim() || !phone.trim() || !address.trim()) {
        showNotification('❌ Заполните все обязательные поля');
        return;
    }
    
    // Сохраняем данные пользователя
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.avatar = name.charAt(0).toUpperCase();
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInfo();
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Создаем заказ
    const order = {
        id: Date.now(),
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        comment: comment,
        items: [...cart],
        total: total,
        status: 'new',
        createdAt: new Date().toISOString()
    };
    
    // Сохраняем заказ
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Очищаем корзину
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    showNotification(`✅ Заказ оформлен! Сумма: ${total.toLocaleString()} ₽\nС вами свяжутся для уточнения деталей доставки.`);
    closeCheckout();
}

// ==================== ПОДЕЛИТЬСЯ КОРЗИНОЙ ====================
function shareCart() {
    if (cart.length === 0) {
        showNotification('❌ Корзина пуста');
        return;
    }

    let shareText = "🛒 Моя корзина покупок:\n\n";
    let total = 0;
    
    cart.forEach((item, index) => {
        shareText += `${index + 1}. ${item.name} - ${item.quantity} × ${item.price} ₽ = ${item.quantity * item.price} ₽\n`;
        total += item.quantity * item.price;
    });
    
    shareText += `\n💰 Итого: ${total} ₽`;
    shareText += `\n\n📍 Магазин: ${siteSettings.logoText}`;
    
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = shareText;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    
    showNotification('✅ Корзина скопирована в буфер обмена!');
    
    if (confirm('Хотите поделиться через WhatsApp?')) {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// ==================== ПОДЕЛИТЬСЯ МАГАЗИНОМ ====================
function shareShop() {
    const shopName = siteSettings.logoText || "Магазин Для своих";
    const shopDescription = "Закрытый магазин для друзей и близких. Специальные цены, эксклюзивные товары и регулярные розыгрыши призов.";
    const shopContacts = `📞 Телефон: +7 (923) 753-36-06\n📧 Email: prodtorg.barnaul@gmail.com`;
    
    const shareText = `🛍️ *${shopName}*\n\n${shopDescription}\n\n${shopContacts}\n\n📍 *Ссылка на магазин:* ${window.location.href}`;
    
    // Создаем модальное окно для выбора способа шаринга
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📤 Поделиться магазином</h3>
        <div style="text-align: center; margin: 20px 0;">
            <p style="margin-bottom: 20px;">Выберите способ для быстрого распространения ссылки на ваш магазин:</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0;">
                <button class="share-btn whatsapp" onclick="shareViaWhatsApp()" style="background: #25D366; color: white;">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
                
                <button class="share-btn telegram" onclick="shareViaTelegram()" style="background: #0088cc; color: white;">
                    <i class="fab fa-telegram"></i>
                    Telegram
                </button>
                
                <button class="share-btn vk" onclick="shareViaVK()" style="background: #4C75A3; color: white;">
                    <i class="fab fa-vk"></i>
                    ВКонтакте
                </button>
                
                <button class="share-btn copy" onclick="copyShopLink()" style="background: var(--primary); color: white;">
                    <i class="fas fa-copy"></i>
                    Скопировать
                </button>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <h4>📋 Текст для отправки:</h4>
                <p style="font-size: 14px; line-height: 1.4; text-align: left;">${shareText.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
        
        <div class="panel-actions">
            <button class="btn btn-danger" onclick="closePanel()">Закрыть</button>
        </div>
    `;
}

function shareViaWhatsApp() {
    const shopName = siteSettings.logoText || "Магазин Для своих";
    const shareText = `🛍️ *${shopName}*\n\nЗакрытый магазин для друзей и близких. Специальные цены, эксклюзивные товары и регулярные розыгрыши призов.\n\n📞 Телефон: +7 (923) 753-36-06\n📧 Email: prodtorg.barnaul@gmail.com\n\n📍 *Ссылка на магазин:* ${window.location.href}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    showNotification('✅ Открывается WhatsApp...');
    closePanel();
}

function shareViaTelegram() {
    const shopName = siteSettings.logoText || "Магазин Для своих";
    const shareText = `🛍️ *${shopName}*\n\nЗакрытый магазин для друзей и близких. Специальные цены, эксклюзивные товары и регулярные розыгрыши призов.\n\n📞 Телефон: +7 (923) 753-36-06\n📧 Email: prodtorg.barnaul@gmail.com\n\n📍 Ссылка на магазин: ${window.location.href}`;
    
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
    showNotification('✅ Открывается Telegram...');
    closePanel();
}

function shareViaVK() {
    const shareText = `${siteSettings.logoText || "Магазин Для своих"} - закрытый магазин для друзей и близких`;
    const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareText)}&comment=${encodeURIComponent("Специальные цены, эксклюзивные товары")}`;
    window.open(vkUrl, '_blank');
    showNotification('✅ Открывается ВКонтакте...');
    closePanel();
}

function copyShopLink() {
    const shopName = siteSettings.logoText || "Магазин Для своих";
    const shareText = `🛍️ ${shopName}\n\nЗакрытый магазин для друзей и близких. Специальные цены, эксклюзивные товары и регулярные розыгрыши призов.\n\n📞 Телефон: +7 (923) 753-36-06\n📧 Email: prodtorg.barnaul@gmail.com\n\n📍 Ссылка на магазин: ${window.location.href}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
        showNotification('✅ Ссылка скопирована в буфер обмена!');
        closePanel();
    }).catch(() => {
        // Fallback для старых браузеров
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = shareText;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        showNotification('✅ Ссылка скопирована в буфер обмена!');
        closePanel();
    });
}
