document.addEventListener('DOMContentLoaded', () => {
    // Handle navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href.includes('#')) return; // Skip if no hash

            const [path, hash] = href.split('#');
            
            // If we're already on index.html or root
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                e.preventDefault();
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            } else {
                // If we're on another page, let the browser handle the navigation
                // The hash in the URL will automatically scroll to the section
                return true;
            }
        });
    });
});