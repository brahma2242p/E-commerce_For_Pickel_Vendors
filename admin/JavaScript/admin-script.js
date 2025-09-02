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
    
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.admin-sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
});