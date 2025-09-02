document.addEventListener('DOMContentLoaded', () => {
    
    // --- Security Check ---

    let isCheckingSession = false; // Guard to prevent race conditions

    (async function checkAdminSession() {
        if (isCheckingSession) return;
        isCheckingSession = true;
        try {
            const response = await fetch('/admin/login');
            if (!response.ok) {
                window.location.href = 'login.html';
                return;
            }
            const data = await response.json();
            if (data.loggedIn) {
                document.getElementById('adminUsername').textContent = data.username;
                fetchAndRenderProducts();
            } else {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error("Session check failed:", error);
            window.location.href = 'login.html';
        } finally {
            isCheckingSession = false;
        }
    })();

    // --- Fetch and Render Products ---
    async function fetchAndRenderProducts() {
        const tableBody = document.getElementById('productsTableBody');
        try {
            const response = await fetch('/admin/api/products');
            const products = await response.json();

            tableBody.innerHTML = ''; // Clear loading message

            if (products.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
                return;
            }

            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="ID">${product.id}</td>
                    <td data-label="Image"><img src="/api/product-image?id=${product.id}" alt="${product.name}" class="product-thumbnail"></td>
                    <td data-label="Name">${product.name}</td>
                    <td data-label="Category">${product.category}</td>
                    <td data-label="Price/Gram">₹${product.pricePerGram.toFixed(2)}</td>
                    <td data-label="Actions">
                        <div class="action-buttons">
                            <a href="edit-product.html?id=${product.id}" class="btn btn-edit"><i class="fas fa-pencil-alt"></i> Edit</a>
                            <button class="btn btn-delete" data-id="${product.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Add event listeners to delete buttons
            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', handleDelete);
            });

        } catch (error) {
            console.error('Error fetching products:', error);
            tableBody.innerHTML = '<tr><td colspan="6">Error loading products.</td></tr>';
        }
    }

    // --- Handle Delete ---
    async function handleDelete(event) {
        const productId = event.currentTarget.dataset.id;
        if (confirm(`Are you sure you want to delete product ID ${productId}?`)) {
            try {
                const response = await fetch(`/admin/products?action=delete&id=${productId}`, {
                    method: 'GET' // Using GET as per the servlet's doGet for delete
                });
                const result = await response.json();
                if (result.success) {
                    alert('Product deleted successfully!');
                    fetchAndRenderProducts(); // Refresh the list
                } else {
                    alert('Error deleting product: ' + result.message);
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('An error occurred while deleting the product.');
            }
        }
    }
    
    // --- Logout Handler ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/admin/logout', { method: 'POST' });
            window.location.href = 'login.html';
        });
    }
});