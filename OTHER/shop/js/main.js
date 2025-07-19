// Data structure
let storeData = {
    products: [],
    orders: [],
    categories: ['Running', 'Basketball', 'Lifestyle', 'Skateboarding'],
    brands: ['Nike', 'Adidas', 'Jordan', 'New Balance', 'Puma']
};

// Initialize store data if not exists
if (!localStorage.getItem('sneakerStoreData')) {
    // Sample initial products
    storeData.products = [
        {
            id: '1',
            name: 'Air Jordan 1 Retro',
            price: 199.99,
            image: 'images/jordan1.jpg',
            brand: 'Jordan',
            category: 'Lifestyle',
            description: 'The iconic Air Jordan 1 Retro combines classic style with modern comfort.',
            stock: 10,
            featured: true
        },
        {
            id: '2',
            name: 'Nike Air Max 270',
            price: 149.99,
            image: 'images/airmax270.jpg',
            brand: 'Nike',
            category: 'Running',
            description: 'Max Air cushioning delivers unrivaled comfort all day long.',
            stock: 15,
            featured: true
        },
        {
            id: '3',
            name: 'Nike Dunk Low',
            price: 120.00,
            image: 'images/dunk.jpg',
            brand: 'Nike',
            category: 'Skateboarding',
            description: 'The Nike Dunk Low returns with classic colors and timeless design.',
            stock: 8,
            featured: false
        },
        {
            id: '4',
            name: 'Adidas Yeezy Boost',
            price: 220.00,
            image: 'images/yeezy.jpg',
            brand: 'Adidas',
            category: 'Lifestyle',
            description: 'Kanye West collaboration featuring revolutionary Boost technology.',
            stock: 5,
            featured: true
        },
        {
            id: '5',
            name: 'Adidas Ultraboost 21',
            price: 180.00,
            image: 'images/ultraboost.jpg',
            brand: 'Adidas',
            category: 'Running',
            description: 'Our most responsive cushioning ever for maximum energy return.',
            stock: 12,
            featured: false
        }
    ];
    localStorage.setItem('sneakerStoreData', JSON.stringify(storeData));
}

// Utility functions
function getStoreData() {
    return JSON.parse(localStorage.getItem('sneakerStoreData'));
}

function updateStoreData(data) {
    localStorage.setItem('sneakerStoreData', JSON.stringify(data));
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Cart functionality
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Theme functionality
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

// Initialize theme and cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    updateCartCount();
});