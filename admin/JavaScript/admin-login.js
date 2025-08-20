document.addEventListener('DOMContentLoaded', () => {
    
    const loginContainer = document.getElementById('login-form-container');
    const resetContainer = document.getElementById('reset-form-container');
    const showResetLink = document.getElementById('showResetFormLink');
    const showLoginLink = document.getElementById('showLoginFormLink');

    showResetLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        resetContainer.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        resetContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginMessage = document.getElementById('login-message');

    adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginMessage.textContent = '';

        const formData = new FormData(adminLoginForm);
        const body = new URLSearchParams(formData).toString();

        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body,
            });

            const result = await response.json();

            if (result.success) {
                loginMessage.textContent = 'Login successful! Redirecting...';
                loginMessage.style.color = 'green';
                window.location.href = 'dashboard.html';
            } else {
                loginMessage.textContent = result.message || 'Invalid username or password.';
                loginMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginMessage.textContent = 'An error occurred. Please try again.';
            loginMessage.style.color = 'red';
        }
    });

    const adminResetForm = document.getElementById('adminResetForm');
    const resetMessage = document.getElementById('reset-message');

    adminResetForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        resetMessage.textContent = '';

        const formData = new FormData(adminResetForm);
        const body = new URLSearchParams(formData).toString();

        try {
            const response = await fetch('/admin/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body,
            });

            const result = await response.json();

            if (result.success) {
                resetMessage.textContent = 'Password reset successfully! You can now log in.';
                resetMessage.style.color = 'green';
                adminResetForm.reset();
            } else {
                resetMessage.textContent = result.message || 'Could not reset password.';
                resetMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Reset password error:', error);
            resetMessage.textContent = 'An error occurred. Please try again.';
            resetMessage.style.color = 'red';
        }
    });
});