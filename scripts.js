document.addEventListener("DOMContentLoaded", function () {
    // Load header and initialize theme-related functionality
    fetch('/header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('header-container').innerHTML = html;

            setupThemeToggle();
            initializeTheme();
            updateLogo();
            setupHamburgerMenu();
        });

    // Load footer
    fetch('/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footer-container').innerHTML = html;
        });
});

function setupHamburgerMenu() {
    const menuButton = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');

    menuButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !menuButton.contains(event.target)) {
            sidebar.classList.remove('open');
        }
    });
}

function setupThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌓';
    document.body.appendChild(themeToggle);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateLogo();
    });
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function updateLogo() {
    const logo = document.querySelector('.logo');
    if (!logo) return;

    const currentTheme = document.documentElement.getAttribute('data-theme');
    logo.src = currentTheme === 'dark' ? '/images/TMWrath.svg' : '/images/TMWrath_Light.svg';
}
