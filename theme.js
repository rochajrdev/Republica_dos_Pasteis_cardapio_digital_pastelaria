// Theme toggle functionality
function setupThemeToggle() {
    // Create theme toggle button - usando CSS externo para estilização
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    // Removendo classes Tailwind pois agora usamos CSS personalizado
    themeToggle.setAttribute('aria-label', 'Alternar tema claro/escuro');
    
    // Set initial icon based on current theme
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    themeToggle.innerHTML = isDarkMode 
        ? '<i class="fas fa-sun" aria-hidden="true"></i>' 
        : '<i class="fas fa-moon" aria-hidden="true"></i>';
    
    // Apply dark mode if needed
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    }
    
    // Add click event
    themeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.classList.toggle('dark');
        
        if (isDark) {
            localStorage.setItem('theme', 'dark');
            this.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
            // Announce theme change for screen readers
            announceThemeChange('Tema escuro ativado');
        } else {
            localStorage.setItem('theme', 'light');
            this.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
            announceThemeChange('Tema claro ativado');
        }
    });
    
    // Inserir o botão no lugar do botão do carrinho no topo
    const nav = document.querySelector('nav');
    if (nav) {
        nav.appendChild(themeToggle);
    } else {
        // Fallback: criar um nav e adicionar ao header
        const header = document.querySelector('header');
        if (header) {
            const navElement = document.createElement('nav');
            navElement.className = 'absolute top-0 left-0 right-0 flex justify-end p-4';
            navElement.appendChild(themeToggle);
            header.appendChild(navElement);
        } else {
            // Se não encontrar nem header, adiciona ao body
            document.body.appendChild(themeToggle);
        }
    }
}

function announceThemeChange(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Remove after announcement is read
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 3000);
}

// Add animation to menu items when they appear in viewport
function setupAnimations() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    menuItems.forEach(item => {
        observer.observe(item);
    });
}

// Improve add to cart animation
function enhanceCartAnimation() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        const originalClickHandler = button.onclick;
        
        button.addEventListener('click', function(e) {
            // Create flying element
            const itemImage = this.closest('.menu-item').querySelector('img');
            const cart = document.getElementById('cart-btn');
            
            if (itemImage && cart) {
                const flyingImage = itemImage.cloneNode();
                flyingImage.classList.add('fixed', 'z-50', 'rounded-md', 'shadow-lg');
                flyingImage.style.height = '50px';
                flyingImage.style.width = '50px';
                flyingImage.style.opacity = '0.8';
                flyingImage.style.position = 'fixed';
                
                // Position at the start position
                const rect = itemImage.getBoundingClientRect();
                flyingImage.style.top = `${rect.top}px`;
                flyingImage.style.left = `${rect.left}px`;
                
                // Append to body
                document.body.appendChild(flyingImage);
                
                // Animate to cart
                const cartRect = cart.getBoundingClientRect();
                setTimeout(() => {
                    flyingImage.style.transition = 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
                    flyingImage.style.top = `${cartRect.top}px`;
                    flyingImage.style.left = `${cartRect.left}px`;
                    flyingImage.style.height = '20px';
                    flyingImage.style.width = '20px';
                    flyingImage.style.opacity = '0';
                    
                    // Remove after animation
                    setTimeout(() => {
                        document.body.removeChild(flyingImage);
                        
                        // Bounce cart icon
                        cart.classList.add('animate-bounce-in');
                        setTimeout(() => {
                            cart.classList.remove('animate-bounce-in');
                        }, 500);
                    }, 800);
                }, 10);
            }
        });
    });
}

// Initialize all enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupThemeToggle();
    setupAnimations();
    enhanceCartAnimation();
    
    // Improve keyboard navigation
    const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(el => {
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});
