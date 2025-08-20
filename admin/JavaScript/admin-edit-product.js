document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('editProductForm');
    const title = document.getElementById('edit-product-title');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert('No product ID provided!');
        window.location.href = 'products.html';
        return;
    }

    // --- Fetch existing product data and populate the form ---
    async function loadProductData() {
        try {
            const response = await fetch(`/admin/api/products?id=${productId}`);
            if (!response.ok) {
                throw new Error('Product not found.');
            }
            const product = await response.json();

            title.textContent = `Edit Product: ${product.name}`;
            
            form.innerHTML = `
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" value="${product.id}">
                
                <div class="form-group">
                    <label for="name">Product Name</label>
                    <input type="text" id="name" name="name" value="${product.name}" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="4" required>${product.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" name="category" required>
                        <option value="veg" ${product.category === 'veg' ? 'selected' : ''}>Vegetarian</option>
                        <option value="non-veg" ${product.category === 'non-veg' ? 'selected' : ''}>Non-Vegetarian</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="spiceLevel">Spice Level</label>
                    <select id="spiceLevel" name="spiceLevel" required>
                        <option value="mild" ${product.spiceLevel === 'mild' ? 'selected' : ''}>Mild</option>
                        <option value="medium" ${product.spiceLevel === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="hot" ${product.spiceLevel === 'hot' ? 'selected' : ''}>Hot</option>
                        <option value="extra-hot" ${product.spiceLevel === 'extra-hot' ? 'selected' : ''}>Extra Hot</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pricePerGram">Price Per Gram (₹)</label>
                    <input type="number" step="0.01" id="pricePerGram" name="pricePerGram" value="${product.pricePerGram}" required>
                </div>
                <div class="form-group">
                    <label for="image">New Product Image (Optional)</label>
                    <input type="file" id="image" name="image" accept="image/jpeg, image/png">
                    <small>Current Image:</small><br>
                    <img src="/spiceheritage/api/product-image?id=${product.id}" alt="Current Image" class="product-thumbnail">
                </div>
                <div class="form-group">
                    <label for="popular">Is Popular?</label>
                    <select id="popular" name="popular" required>
                        <option value="true" ${product.popular ? 'selected' : ''}>Yes</option>
                        <option value="false" ${!product.popular ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-add-new">Update Product</button>
            `;
        } catch (error) {
            console.error('Error loading product data:', error);
            form.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

    // --- Handle form submission for update ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/admin/products', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                alert('Product updated successfully!');
                window.location.href = 'products.html';
            } else {
                alert('Error updating product: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
        }
    });

    loadProductData();
});
