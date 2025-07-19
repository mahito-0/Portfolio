document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const sections = document.querySelectorAll('.admin-section');
    const navLinks = document.querySelectorAll('.admin-sidebar a[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(`${sectionId}-section`).classList.add('active');
            document.getElementById('admin-section-title').textContent = 
                this.textContent.trim();
        });
    });

    // Load dashboard stats
    loadDashboardStats();
    
    // Load products
    loadProducts();
    
    // Load orders
    loadOrders();
    
    // Product modal
    const productModal = document.getElementById('product-modal');
    const addProductBtn = document.getElementById('add-product-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    addProductBtn.addEventListener('click', () => {
        openProductModal();
    });
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });
    
    // Populate brand and category dropdowns
    const storeData = getStoreData();
    const brandSelect = document.getElementById('product-brand');
    const categorySelect = document.getElementById('product-category');
    
    storeData.brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
    
    storeData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // Product form submission
    const productForm = document.getElementById('product-form');
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        // In a real app, this would clear authentication
        window.location.href = 'index.html';
    });
});

function loadDashboardStats() {
    const storeData = getStoreData();
    document.getElementById('total-products').textContent = storeData.products.length;
    document.getElementById('total-orders').textContent = storeData.orders.length;
    document.getElementById('low-stock').textContent = 
        storeData.products.filter(p => p.stock < 5).length;
}

function loadProducts() {
    const storeData = getStoreData();
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    storeData.products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" class="product-thumb"></td>
            <td>${product.name}</td>
            <td>${product.brand}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>${product.featured ? 'Yes' : 'No'}</td>
            <td class="actions">
                <button class="btn-edit" data-id="${product.id}">Edit</button>
                <button class="btn-delete" data-id="${product.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            openProductModal(productId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(productId);
            }
        });
    });
}

function loadOrders() {
    // In a real app, this would fetch from a backend
    // For demo, we'll just show sample data
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = `
        <tr>
            <td>ORD-1001</td>
            <td>John Doe</td>
            <td>2023-05-15</td>
            <td>$349.98</td>
            <td><span class="status shipped">Shipped</span></td>
            <td><button class="btn-view">View</button></td>
        </tr>
        <tr>
            <td>ORD-1002</td>
            <td>Jane Smith</td>
            <td>2023-05-18</td>
            <td>$199.99</td>
            <td><span class="status processing">Processing</span></td>
            <td><button class="btn-view">View</button></td>
        </tr>
    `;
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    const storeData = getStoreData();
    
    if (productId) {
        // Edit mode
        title.textContent = 'Edit Product';
        const product = storeData.products.find(p => p.id === productId);
        
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-brand').value = product.brand;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-featured').checked = product.featured || false;
    } else {
        // Add mode
        title.textContent = 'Add New Product';
        form.reset();
        document.getElementById('product-id').value = generateId();
    }
    
    modal.style.display = 'flex';
}

function saveProduct() {
    const storeData = getStoreData();
    const form = document.getElementById('product-form');
    const productId = document.getElementById('product-id').value;
    
    const productData = {
        id: productId,
        name: document.getElementById('product-name').value,
        brand: document.getElementById('product-brand').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        image: document.getElementById('product-image').value,
        description: document.getElementById('product-description').value,
        featured: document.getElementById('product-featured').checked
    };
    
    // Check if we're editing or adding
    const existingIndex = storeData.products.findIndex(p => p.id === productId);
    
    if (existingIndex >= 0) {
        // Update existing product
        storeData.products[existingIndex] = productData;
    } else {
        // Add new product
        storeData.products.push(productData);
    }
    
    updateStoreData(storeData);
    loadProducts();
    loadDashboardStats();
    
    // Close modal
    document.getElementById('product-modal').style.display = 'none';
    form.reset();
}

function deleteProduct(productId) {
    const storeData = getStoreData();
    storeData.products = storeData.products.filter(p => p.id !== productId);
    updateStoreData(storeData);
    loadProducts();
    loadDashboardStats();
}