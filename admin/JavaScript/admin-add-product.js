document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', event => {
        if (event.keyCode === 123) { // F12
            event.preventDefault();
        }
        if (event.ctrlKey && event.shiftKey && event.keyCode === 73) { // Ctrl+Shift+I
            event.preventDefault();
        }
        if (event.ctrlKey && event.keyCode === 85) { // Ctrl+U
            event.preventDefault();
        }
        if (event.ctrlKey && event.keyCode === 67) { // Ctrl+C
            event.preventDefault();
        }
        if (event.ctrlKey && event.keyCode === 86) { // Ctrl+V
            event.preventDefault();
        }
    });
    
    const form = document.getElementById('addProductForm');

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
                alert('Product added successfully!');
                window.location.href = 'products.html';
            } else {
                alert('Error adding product: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
        }
    });
});
