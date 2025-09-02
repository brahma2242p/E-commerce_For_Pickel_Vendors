document.addEventListener('DOMContentLoaded', () => {
    
    const title = document.getElementById('user-details-title');
    const detailsContainer = document.getElementById('details-container');
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        alert('No user ID provided!');
        window.location.href = 'users.html';
        return;
    }

    async function fetchUserDetails() {
        try {
            const response = await fetch(`/admin/api/user-details?id=${userId}`);
            if (!response.ok) {
                throw new Error('User not found or you are not authorized.');
            }
            const data = await response.json();
            renderUserDetails(data);
        } catch (error) {
            console.error('Error fetching user details:', error);
            detailsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    function renderUserDetails(data) {
        const user = data.user;
        const addresses = data.addresses;
        const orders = data.orders;

        title.textContent = `Details for ${user.fullName}`;

        let addressesHtml = '<h4>Saved Addresses</h4>';
        if (addresses.length > 0) {
            addressesHtml += '<ul class="details-list">';
            addresses.forEach(addr => {
                addressesHtml += `<li><strong>${addr.fullName}:</strong> ${addr.addressLine1}, ${addr.addressLine2 || ''}, ${addr.city}, ${addr.state} - ${addr.pincode}</li>`;
            });
            addressesHtml += '</ul>';
        } else {
            addressesHtml += '<p>No saved addresses.</p>';
        }

        let ordersHtml = '<h4>Order History</h4>';
        if (orders.length > 0) {
            ordersHtml += '<table class="admin-table"><thead><tr><th>Order ID</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>';
            orders.forEach(order => {
                const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN');
                ordersHtml += `<tr><td>#${order.orderId}</td><td>${orderDate}</td><td>₹${order.totalAmount.toFixed(2)}</td><td>${order.orderStatus}</td></tr>`;
            });
            ordersHtml += '</tbody></table>';
        } else {
            ordersHtml += '<p>No orders placed yet.</p>';
        }

        detailsContainer.innerHTML = `
            <div class="details-grid">
                <div class="details-card">
                    <h4>User Information</h4>
                    <p><strong>User ID:</strong> ${user.userId}</p>
                    <p><strong>Full Name:</strong> ${user.fullName}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Mobile:</strong> ${user.mobileNumber}</p>
                    <p><strong>Registered On:</strong> ${new Date(user.registrationDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div class="details-card">
                    ${addressesHtml}
                </div>
            </div>
            <div class="details-card full-width">
                ${ordersHtml}
            </div>
        `;
    }

    fetchUserDetails();
});
