document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProduct(productId);
    } else {
        // Redirect to shop if no product ID
        window.location.href = 'shop.html';
    }
});

function loadProduct(productId) {
    const storeData = getStoreData();
    const product = storeData.products.find(p => p.id === productId);
    const container = document.getElementById('product-container');
    
    if (!product) {
        container.innerHTML = '<p>Product not found. <a href="shop.html">Browse our collection</a></p>';
        return;
    }
    
    container.innerHTML = `
        <div class="product-gallery">
            <img src="${product.image}" alt="${product.name}" class="main-image" id="main-image">
            <div class="thumbnail-container">
                <img src="${product.image}" alt="${product.name}" class="thumbnail" onclick="changeMainImage(this.src)">
                <!-- Additional thumbnails would go here -->
            </div>
        </div>
        <div class="product-details">
            <h1 class="product-title">${product.name}</h1>
            <p class="product-brand">${product.brand}</p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            
            <div class="product-description">
                <p>${product.description}</p>
            </div>
            
            <div class="product-meta">
                <div class="meta-item">
                    <span class="meta-label">Category:</span>
                    <span>${product.category}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Availability:</span>
                    <span>${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
            </div>
            
            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" id="decrease-qty">-</button>
                    <input type="number" value="1" min="1" max="${product.stock}" class="quantity-input" id="quantity">
                    <button class="quantity-btn" id="increase-qty">+</button>
                </div>
                <button class="btn-add-to-cart" id="add-to-cart" data-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('add-to-cart').addEventListener('click', function() {
        const quantity = parseInt(document.getElementById('quantity').value);
        addToCart(this.getAttribute('data-id'), quantity);
    });
    
    document.getElementById('decrease-qty').addEventListener('click', function() {
        const quantityInput = document.getElementById('quantity');
        let quantity = parseInt(quantityInput.value);
        if (quantity > 1) {
            quantityInput.value = quantity - 1;
        }
    });
    
    document.getElementById('increase-qty').addEventListener('click', function() {
        const quantityInput = document.getElementById('quantity');
        let quantity = parseInt(quantityInput.value);
        if (quantity < product.stock) {
            quantityInput.value = quantity + 1;
        }
    });
}

function changeMainImage(src) {
    document.getElementById('main-image').src = src;
}

function addToCart(productId, quantity = 1) {
    const storeData = getStoreData();
    const product = storeData.products.find(p => p.id === productId);
    let cart = getCart();
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    updateCart(cart);
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = `${quantity} ${product.name} added to cart`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}