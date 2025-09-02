document.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
    
});

async function fetchOrders() {
    try {
        const response = await fetch('/customer/my-orders');
        if (!response.ok) {
            if (response.status === 401) window.location.href = '../index.html'; // Redirect if not logged in
            throw new Error('Could not fetch orders.');
        }
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('ordersList').innerHTML = '<p>Could not load your orders. Please try again later.</p>';
    }
}

function renderOrders(orders) {
    const ordersListContainer = document.getElementById('ordersList');
    ordersListContainer.innerHTML = '';

    if (!orders || orders.length === 0) {
        ordersListContainer.innerHTML = `
            <div class="no-orders">
                <h2>You haven't placed any orders yet!</h2>
                <a href="../catalog.html" class="cta-button">Start Shopping</a>
            </div>
        `;
        return;
    }

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

        // Format date to be more readable
        const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // Loop through items to build the item list HTML
        let itemsHtml = '';
        order.items.forEach(item => {
            const itemPrice = (item.pricePerGram * item.weightGrams * item.quantity).toFixed(2);
            itemsHtml += `
                <div class="order-item">
                    <div class="order-item-details">
                        <strong>${item.productName}</strong>
                        <span>Quantity: ${item.quantity} x ${item.weightGrams}g</span>
                    </div>
                    <div class="order-item-price">
                        <strong>₹${itemPrice}</strong>
                    </div>
                </div>
            `;
        });

        // This is the HTML for the entire order card
        orderCard.innerHTML = `
            <div class="order-card-header">
                <div>
                    <h4>Order #${order.orderId}</h4>
                    <p>Placed on ${orderDate}</p>
                </div>
                <div class="order-total">
                    <span>Total Amount</span>
                    <strong>₹${order.totalAmount.toFixed(2)}</strong>
                </div>
            </div>
            <div class="order-card-body">
                ${itemsHtml}
            </div>
            <div class="order-card-footer">
                <div><strong>Shipping to:</strong> ${order.shippingAddress}</div>
                <div class="status-badge status-${order.orderStatus.toLowerCase()}">${order.orderStatus}</div>
            </div>
        `;
        ordersListContainer.appendChild(orderCard);
    });
    
    // Add event listeners to the order headers to toggle the body
    document.querySelectorAll('.order-card-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('expanded');
        });
    });
}