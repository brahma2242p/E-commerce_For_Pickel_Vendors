document.addEventListener('DOMContentLoaded', () => {
    
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
                fetchAndRenderOrders();
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

    function updateStatusColors() {
        document.querySelectorAll('.status-select').forEach(select => {
            select.classList.remove('status-pending', 'status-confirmed', 'status-shipped', 'status-delivered', 'status-cancelled');
            const selectedStatus = select.value.toLowerCase();
            select.classList.add(`status-${selectedStatus}`);
        });
    }


    // --- Fetch and Render Orders ---
    async function fetchAndRenderOrders() {
        const tableBody = document.getElementById('ordersTableBody');
        try {
            const response = await fetch('/admin/api/orders');
            const orders = await response.json();

            tableBody.innerHTML = '';

            if (orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const row = document.createElement('tr');
                const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN');
                
                row.innerHTML = `
                    <td data-label="Order ID">#${order.orderId}</td>
                    <td data-label="Customer">${order.customerName}</td>
                    <td data-label="Date">${orderDate}</td>
                    <td data-label="Amount">₹${order.totalAmount.toFixed(2)}</td>
                    <td data-label="Shipping Address">${order.shippingAddress}</td>
                    <td data-label="Status">
                        <select class="status-select" data-order-id="${order.orderId}">
                            <option value="Pending" ${order.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Confirmed" ${order.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Shipped" ${order.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${order.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', handleStatusChange);
            });

            updateStatusColors();

        } catch (error) {
            console.error('Error fetching orders:', error);
            tableBody.innerHTML = '<tr><td colspan="6">Error loading orders.</td></tr>';
        }
    }

    // --- Handle Status Change ---
    async function handleStatusChange(event) {
    const select = event.target;
    const orderId = select.dataset.orderId;
    const newStatus = select.value;

        try {
            const response = await fetch('/admin/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `orderId=${orderId}&status=${newStatus}`
            });

            const result = await response.json();
            if (result.success) {
                alert(`Order #${orderId} status updated to ${newStatus}.`);
                updateStatusColors();
            } else {
                alert('Failed to update order status.');
            }
        } catch (error) {
            console.error('Status update error:', error);
            alert('An error occurred while updating the status.');
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