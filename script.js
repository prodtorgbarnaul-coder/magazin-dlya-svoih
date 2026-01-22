// Global variables
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [];

// FUNCTIONS FOR MODAL WINDOWS

// Open profile modal
function openProfile() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'block';
}

// Close profile modal
function closeProfile() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'none';
}

// Open notifications modal
function openNotifications() {
    const modal = document.getElementById('notificationsModal');
    modal.style.display = 'block';
}

// Close notifications modal
function closeNotifications() {
    const modal = document.getElementById('notificationsModal');
    modal.style.display = 'none';
}

// Open cart modal
function openCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = 'block';
    renderCartItems();
}

// Close cart modal
function closeCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = 'none';
}

// RENDERING FUNCTIONS

// Render cart items inside modal
function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Clear previous items
    cartItems.innerHTML = '';

    // Iterate through cart items and append them to the modal
    cart.forEach(item => {
        const itemHtml = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>Цена: ${item.price} рублей</p>
                <button onclick="removeFromCart(${item.id})">Удалить</button>
            </div>
        `;
        cartItems.insertAdjacentHTML('beforeend', itemHtml);
    });

    // Calculate total cost
    const totalCost = cart.reduce((acc, curr) => acc + curr.price, 0);
    cartTotal.textContent = `Всего: ${totalCost} рублей`;
}

// REMOVE ITEM FROM CART
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index >= 0) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    }
}

// LOADING DATA ON PAGE LOAD
document.addEventListener('DOMContentLoaded', function() {
    // Load products from storage
    loadProducts();

    // Add event listeners for actions
    document.querySelector('.header-action[data-action="profile"]').addEventListener('click', openProfile);
    document.querySelector('.header-action[data-action="notifications"]').addEventListener('click', openNotifications);
    document.querySelector('.header-action[data-action="cart"]').addEventListener('click', openCart);
});

// ADDITIONAL FUNCTIONS (LOADING PRODUCTS ETC.)

// Example loading function
function loadProducts() {
    // This would typically involve fetching products from server/localStorage/database
    // For demonstration purposes, we'll assume we have some predefined products
    products = [
        { id: 1, title: 'Товар 1', price: 100, image: 'image-url-1' },
        { id: 2, title: 'Товар 2', price: 200, image: 'image-url-2' },
        // More products...
    ];

    // Now you could render these products using a loop or similar mechanism
    console.log('Loaded products:', products);
}
