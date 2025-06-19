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
        
        console.log(`Corrigidos ${allControls.length} botões de controle de quantidade`);
    }

    // Executar a função após o carregamento da página e repetir algumas vezes para garantir
    setTimeout(fixDarkModeControls, 1000);
    setTimeout(fixDarkModeControls, 2000);
    
    // Verificar novamente quando o tema mudar
    const darkModeToggle = document.querySelector('#dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            setTimeout(fixDarkModeControls, 100);
        });
    }
    
    // Verificar se a preferência de tema já foi ajustada pelo sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTimeout(fixDarkModeControls, 500);
    }
});
