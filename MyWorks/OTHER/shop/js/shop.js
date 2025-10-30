document.addEventListener('DOMContentLoaded', function() {
    // Load products
    loadProducts();
    
    // Initialize filters
    initFilters();
    
    // Event listeners for filters
    document.getElementById('brand-filter').addEventListener('change', filterProducts);
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('price-filter').addEventListener('change', filterProducts);
    document.getElementById('sort-by').addEventListener('change', filterProducts);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    document.getElementById('search-input').addEventListener('input', filterProducts);
});

function initFilters() {
    const storeData = getStoreData();
    const brandSelect = document.getElementById('brand-filter');
    const categorySelect = document.getElementById('category-filter');
    
    // Add brands
    storeData.brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.toLowerCase();
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
    
    // Add categories
    storeData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get('brand');
    
    if (brandParam) {
        document.getElementById('brand-filter').value = brandParam;
        filterProducts();
    }
}

function loadProducts() {
    const storeData = getStoreData();
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    storeData.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </a>
        `;
        container.appendChild(productCard);
    });
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart(this.getAttribute('data-id'));
        });
    });
}

function filterProducts() {
    const storeData = getStoreData();
    const brandFilter = document.getElementById('brand-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const sortBy = document.getElementById('sort-by').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
    let filteredProducts = [...storeData.products];
    
    // Apply filters
    if (brandFilter !== 'all') {
        filteredProducts = filteredProducts.filter(
            p => p.brand.toLowerCase() === brandFilter
        );
    }
    
    if (categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(
            p => p.category.toLowerCase() === categoryFilter
        );
    }
    
    if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-').map(part => {
            if (part.endsWith('+')) return parseFloat(part);
            return part === '' ? Infinity : parseFloat(part);
        });
        
        filteredProducts = filteredProducts.filter(p => {
            if (priceFilter === '200+') return p.price >= 200;
            return p.price >= min && p.price <= max;
        });
    }
    
    // Apply search
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery) || 
            p.brand.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply sorting
    switch (sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
    
    // Render filtered products
    renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-results">No products match your filters.</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </a>
        `;
        container.appendChild(productCard);
    });
    
    // Reattach event listeners
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart(this.getAttribute('data-id'));
        });
    });
}

function resetFilters() {
    document.getElementById('brand-filter').value = 'all';
    document.getElementById('category-filter').value = 'all';
    document.getElementById('price-filter').value = 'all';
    document.getElementById('sort-by').value = 'default';
    document.getElementById('search-input').value = '';
    filterProducts();
}

function addToCart(productId) {
    const storeData = getStoreData();
    const product = storeData.products.find(p => p.id === productId);
    let cart = getCart();
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart(cart);
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = `${product.name} added to cart`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}