// Define global variables
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [];
// Importing libraries
const XLSX = require('xlsx');

// Initial setup
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

// Function to export products in different formats
function exportProducts(format) {
    switch (format) {
        case 'json':
            download(JSON.stringify(products), 'products.json', 'application/json');
            break;
        case 'csv':
            const csvContent = convertToCsv(products);
            download(csvContent, 'products.csv', 'text/csv');
            break;
        default:
            alert('Формат не поддерживается');
    }
}

// Download helper function
function download(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Convert products to CSV format
function convertToCsv(data) {
    const fields = Object.keys(data[0]); // Get field names from first product
    const replacer = (key, value) => value === null ? '' : value;
    const header = fields.join(',');
    const rows = data.map(row => fields.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    return [header, ...rows].join('\n');
}

// Functions for managing the store
function importCatalog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, .xlsx';
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
            const contents = event.target.result;
            const products = await processFile(contents);
            console.log('Импортировано товаров:', products.length);
        };
        reader.readAsBinaryString(file);
    };
}

function manageProducts() {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <img alt="${product.title}" id="019be6aa-2676-76f7-a6c6-48e38763cb1a">
            <h3>${product.title}</h3>
            <p>Цена: ${product.price} рублей</p>
            <button onclick="editProduct(${product.id})">Редактировать</button>
            <button onclick="deleteProduct(${product.id})">Удалить</button>
        </div>
    `).join('');
}

function viewOrders() {
    // Functionality for viewing orders goes here
    console.log('View Orders functionality needs implementation');
}

function viewStatistics() {
    // Functionality for statistics visualization goes here
    console.log('View Statistics functionality needs implementation');
}

// Helper functions
async function processFile(contents) {
    const workbook = XLSX.read(contents, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    return data;
}

function editProduct(productId) {
    // Implement editing product functionality
    console.log('Editing product with ID:', productId);
}

function deleteProduct(productId) {
    // Implement deleting product functionality
    console.log('Deleting product with ID:', productId);
}

// Loading initial state
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

    // Add some test products if needed
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

// Export global functions
window.importCatalog = importCatalog;
window.manageProducts = manageProducts;
window.viewOrders = viewOrders;
window.viewStatistics = viewStatistics;
window.processFile = processFile;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;