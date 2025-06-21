// Script específico para corrigir problemas no tema escuro
document.addEventListener('DOMContentLoaded', function() {
    // Função para corrigir os controles de quantidade no tema escuro
    function fixDarkModeControls() {
        console.log('Verificando e corrigindo controles no tema escuro...');
        
        // 1. Encontrar todos os controles de quantidade em todo o menu
        const allControls = document.querySelectorAll('.flex.items-center button[data-action]');
        
        allControls.forEach(button => {
            // Adicionar classes para tema escuro a todos os botões
            if (button.getAttribute('data-action') === 'decrease' || button.getAttribute('data-action') === 'increase') {
                // Adicionar classes dark: se não as tiver
                if (!button.classList.contains('dark:text-orange-400')) {
                    button.classList.add('dark:text-orange-400');
                }
                
                // Adicionar hover para tema escuro
                if (!button.classList.contains('dark:hover:bg-gray-600')) {
                    button.classList.add('dark:hover:bg-gray-600');
                }
            }
            
            // Corrigir container do botão
            const controlContainer = button.closest('.flex.items-center');
            if (controlContainer && !controlContainer.classList.contains('dark:bg-gray-700')) {
                controlContainer.classList.add('dark:bg-gray-700');
            }
        });
        
        // 2. Adicionar classes para tema escuro a todos os botões de adicionar
        const addButtons = document.querySelectorAll('.add-to-cart-btn');
        addButtons.forEach(button => {
            if (!button.classList.contains('hover:bg-orange-700')) {
                button.classList.add('hover:bg-orange-700');
            }
            if (!button.classList.contains('focus:ring-2')) {
                button.classList.add('focus:ring-2', 'focus:ring-orange-500');
            }
        });
        
        // 3. Corrigir elementos específicos do carrinho no modo escuro
        fixCartDarkMode();
        
        console.log(`Corrigidos ${allControls.length} botões de controle de quantidade`);
    }

    // Executar a função após o carregamento da página e repetir algumas vezes para garantir
    setTimeout(fixDarkModeControls, 1000);
    setTimeout(fixDarkModeControls, 2000);
      // Verificar novamente quando o tema mudar
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            setTimeout(fixDarkModeControls, 100);
        });
    }
    
    // Verificar quando o modal do carrinho é aberto
    const cartBtn = document.querySelector('#cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            // Dar tempo para o modal ser renderizado
            setTimeout(fixCartDarkMode, 100);
        });
    }
    
    // Verificar se a preferência de tema já foi ajustada pelo sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTimeout(fixDarkModeControls, 500);
    }
    
    // Observer para detectar mudanças no DOM (útil quando itens são adicionados ao carrinho)
    const observer = new MutationObserver(function(mutations) {
        // Verificar apenas quando modificações afetam o carrinho
        const cartChanges = mutations.some(mutation => 
            mutation.target.id === 'cart-items' || 
            mutation.target.closest('#cart-items')
        );
        
        if (cartChanges && (document.documentElement.classList.contains('dark') || document.body.classList.contains('dark'))) {
            fixCartDarkMode();
        }
    });
    
    // Observar mudanças no container de itens do carrinho
    const cartItems = document.querySelector('#cart-items');
    if (cartItems) {
        observer.observe(cartItems, { 
            childList: true,
            subtree: true,
            attributes: true 
        });
    }
});

/**
 * Função específica para corrigir a exibição de elementos do carrinho no tema escuro
 */
function fixCartDarkMode() {
    // Corrigir controles de quantidade no carrinho
    document.querySelectorAll('.cart-quantity-control').forEach(control => {
        if (!control.classList.contains('dark:bg-gray-700')) {
            control.classList.add('dark:bg-gray-700');
        }
    });
    
    // Garantir que os botões de quantidade no carrinho sejam visíveis
    document.querySelectorAll('.cart-quantity-btn').forEach(btn => {
        if (!btn.classList.contains('dark:text-orange-400')) {
            btn.classList.add('dark:text-orange-400');
        }
        if (!btn.classList.contains('dark:hover:bg-gray-600')) {
            btn.classList.add('dark:hover:bg-gray-600');
        }
    });
    
    // Melhorar contraste dos preços no modo escuro
    document.querySelectorAll('.cart-item .text-orange-600').forEach(price => {
        if (!price.classList.contains('dark:text-orange-400')) {
            price.classList.add('dark:text-orange-400');
        }
    });
    
    // Melhorar bordas dos itens do carrinho no modo escuro
    document.querySelectorAll('.cart-item').forEach(item => {
        if (!item.classList.contains('dark:border-gray-700')) {
            item.classList.add('dark:border-gray-700');
        }
    });
    
    console.log('Elementos do carrinho ajustados para o tema escuro');
}
