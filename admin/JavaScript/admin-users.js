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
                fetchAndRenderUsers();
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

    // --- Fetch and Render Users ---
    async function fetchAndRenderUsers() {
        const tableBody = document.getElementById('usersTableBody');
        try {
            const response = await fetch('/admin/api/users');
            const users = await response.json();

            tableBody.innerHTML = '';

            if (users.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = document.createElement('tr');
                const registrationDate = new Date(user.registrationDate).toLocaleDateString('en-IN');
                
                row.innerHTML = `
                    <td data-label="User ID">${user.userId}</td>
                    <td data-label="Full Name">${user.fullName}</td>
                    <td data-label="Email">${user.email}</td>
                    <td data-label="Mobile Number">${user.mobileNumber}</td>
                    <td data-label="Registration Date">${registrationDate}</td>
                    <td data-label="Actions">
                        <div class="action-buttons">
                            <a href="user-details.html?id=${user.userId}" class="btn btn-edit"><i class="fas fa-eye"></i> View Details</a>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error fetching users:', error);
            tableBody.innerHTML = '<tr><td colspan="6">Error loading users.</td></tr>';
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