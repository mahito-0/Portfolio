document.addEventListener('DOMContentLoaded', function() {
    // Load featured products
    loadFeaturedProducts();
});

function loadFeaturedProducts() {
    const storeData = getStoreData();
    const featuredContainer = document.getElementById('featured-products');
    featuredContainer.innerHTML = '';

    const featuredProducts = storeData.products.filter(product => product.featured);
    
    if (featuredProducts.length === 0) {
        featuredContainer.innerHTML = '<p>No featured products available.</p>';
        return;
    }

    featuredProducts.slice(0, 4).forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'featured-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="featured-image">
            <div class="featured-info">
                <h3 class="featured-name">${product.name}</h3>
                <p class="featured-price">$${product.price.toFixed(2)}</p>
                <a href="product.html?id=${product.id}" class="btn-primary">View Details</a>
            </div>
        `;
        featuredContainer.appendChild(productCard);
    });
}