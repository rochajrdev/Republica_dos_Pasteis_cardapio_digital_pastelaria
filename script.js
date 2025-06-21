// Declaração de variáveis globais
let menu, cartBtn, cartModal, cartItemsContainer, cartTotal, checkoutBtn, 
    closeModalBtn, cartCounter, addressInput, addressWarn, paymentMethod, paymentWarn;

// Carrinho de compras
let cart = [];

// Variáveis para o checkout em etapas
let currentStep = 1;
let isDelivery = true; // Por padrão, modo de entrega selecionado
let deliveryOptions;
let nextButtons;
let prevButtons;

// Função para inicializar elementos do DOM
function initElements() {
    console.log("Inicializando elementos DOM");
    // Inicialização de elementos essenciais
    menu = document.getElementById("menu");
    cartBtn = document.getElementById("fixed-cart-btn");
    cartModal = document.getElementById("cart-modal");
    cartItemsContainer = document.getElementById("cart-items");
    cartTotal = document.getElementById("cart-total");
    checkoutBtn = document.getElementById("checkout-btn");
    closeModalBtn = document.getElementById("close-modal-btn");
    cartCounter = document.getElementById("cart-count");
    addressInput = document.getElementById("address");
    addressWarn = document.getElementById("address-warn");
    paymentMethod = document.getElementById("payment-method");
    paymentWarn = document.getElementById("payment-warn");
    
    console.log("Elementos iniciais:", { 
        cartBtn: !!cartBtn, 
        cartModal: !!cartModal,
        cartItemsContainer: !!cartItemsContainer
    });
    
    // Verificar cada elemento essencial e tentar alternativas se necessário
    if (!cartBtn) {        console.warn("Botão do carrinho não encontrado pelo ID, tentando seletores alternativos");
        // Tentar vários seletores diferentes para encontrar o botão
        const selectors = [
            "button[aria-label='Ver carrinho de compras']",
            "button.fa-shopping-cart",
            "button:has(i.fa-shopping-cart)",
            "#fixed-cart-btn",
            ".fixed button"
        ];
        
        for (const selector of selectors) {
            try {
                cartBtn = document.querySelector(selector);
                if (cartBtn) {
                    console.log(`Botão encontrado com seletor: ${selector}`);
                    break;
                }
            } catch (err) {
                console.warn(`Erro ao buscar com seletor ${selector}:`, err);
            }
        }
        
        // Se ainda não encontrou, criar um botão fixo no canto
        if (!cartBtn) {
            createFixedCartButton();
        }
    }
    
    if (!cartModal) {
        console.warn("Modal do carrinho não encontrado");
    }
    
    if (!cartItemsContainer) {
        console.warn("Container de itens do carrinho não encontrado");
    }
    
    // Iniciar os listeners de eventos imediatamente e também após um delay
    // para garantir que todos os elementos foram carregados
    setupEventListeners();
    
    setTimeout(() => {
        setupEventListeners();
        console.log("Eventos inicializados após delay");
    }, 300);
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Abrir o modal do carrinho
    if (cartBtn) {
        console.log("Adicionando eventos de clique ao botão do carrinho");
        
        try {
            // Limpar qualquer handler existente para evitar duplicações
            const newBtn = cartBtn.cloneNode(true);
            if (cartBtn.parentNode) {
                cartBtn.parentNode.replaceChild(newBtn, cartBtn);
                cartBtn = newBtn;
            }
            
            // Adicionar eventos diretos para maior compatibilidade
            cartBtn.onclick = function cartBtnClickHandler(e) {
                console.log("Botão do carrinho clicado via onclick");
                e.preventDefault();
                e.stopPropagation();
                openModalDiretamente(e);
                return false;
            };
            
            // Adicionar listener de evento como reforço
            cartBtn.addEventListener("click", function cartBtnEventHandler(e) {
                console.log("Botão do carrinho clicado via event listener");
                e.preventDefault();
                e.stopPropagation();
                openModalDiretamente(e);
            });
            
            console.log("Eventos adicionados com sucesso ao botão do carrinho");
        } catch (err) {
            console.error("Erro ao configurar eventos do botão:", err);
            createFixedCartButton(); // Criar botão de backup se houver erro
        }
    } else {
        console.error('Botão do carrinho não encontrado');
        createFixedCartButton(); // Criar botão de backup
    }
    
    // Fechar o modal quando clicar fora
    if (cartModal) {
        cartModal.addEventListener("click", function(event){
            if(event.target === cartModal){
                closeCartModal();
            }
        });
    }

    // Botão de fechar o modal do carrinho
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", function(){
            closeCartModal();
        });
    }
    
    // Configurar opções de entrega
    setupDeliveryOptions();
}

// Função legacy para abrir o modal do carrinho
// Mantida por compatibilidade, apenas chama a função principal
function openCartModal(e) {
    console.log("Chamando openCartModal (versão legacy)");
    openModalDiretamente(e);
    
    // Sempre ir para a etapa 1 (resumo do pedido) ao abrir o carrinho
    setTimeout(() => {
        if (typeof goToStep === 'function') {
            goToStep(1);
        }
    }, 100);
}

// Inicializar quando o DOM for carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, inicializando elementos");
    
    // Log para elementos importantes antes da inicialização    console.log("Verificando elementos antes da inicialização:");
    console.log("- Botão fixo do carrinho existe:", !!document.getElementById("fixed-cart-btn"));
    console.log("- Modal do carrinho existe:", !!document.getElementById("cart-modal"));
    
    // Carregar carrinho do localStorage primeiro para garantir que está disponível
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Inicializar elementos do DOM
    initElements();
    
    // Log para confirmar após inicialização
    console.log("Após inicialização:");
    console.log("- cartBtn inicializado:", !!cartBtn);
    console.log("- cartModal inicializado:", !!cartModal);
      // Atualizar informações do carrinho
    try {
        updateCartModal();
    } catch (err) {
        console.error("Erro ao atualizar carrinho:", err);
    }
    
    // Configurar navegação do checkout
    setupCheckoutNavigation();
    // Iniciar verificação de status do restaurante
    updateRestaurantStatus();
    
    // Múltiplas tentativas de garantir que o botão do carrinho funcione
    const checkAndFixCartButton = (attempt = 1) => {
        console.log(`Tentativa ${attempt} de garantir funcionamento do botão do carrinho`);
        
        // Verificar se o botão existe
        const btnExists = cartBtn && document.body.contains(cartBtn);
        console.log(`Botão do carrinho existe e está no DOM: ${btnExists}`);
        
        if (!btnExists && attempt <= 3) {
            console.warn(`Botão do carrinho não encontrado na tentativa ${attempt}`);
            
            // Tentar novamente encontrar o botão            cartBtn = document.getElementById("fixed-cart-btn");
            if (!cartBtn) {
                // Se ainda não encontrar, criar um botão flutuante
                createFixedCartButton();
            } else {
                // Se encontrar, adicionar os events
                setupEventListeners();
            }
            
            // Tentar novamente após um delay
            setTimeout(() => checkAndFixCartButton(attempt + 1), 500);
        } else if (btnExists) {
            // O botão existe, garantir que os eventos estão configurados
            console.log("Reforçando eventos do botão do carrinho");
            setupEventListeners();
        }
    };
    
    // Iniciar verificações após um breve delay para garantir que o DOM está pronto
    setTimeout(checkAndFixCartButton, 300);
});

// Fechar com ESC e gerenciar acessibilidade com teclado
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cartModal.style.display === 'flex') {
        closeCartModal();
    }
    
    // Manter o foco dentro do modal (trap focus)
    if (e.key === 'Tab' && cartModal.style.display === 'flex') {
        const focusableElements = cartModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

// Função para fechar o modal do carrinho
function closeCartModal() {
    if (cartModal) {
        // Aplicar uma transição suave de saída
        const modalContent = cartModal.querySelector('.animate-slide-up');
        if (modalContent) {
            // Adicionar classe de animação de saída
            modalContent.classList.add('closing');
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'translateY(20px)';
            
            // Aguardar a animação antes de ocultar
            setTimeout(() => {
                cartModal.style.display = "none";
                document.body.style.overflow = '';
                
                // Resetar o estilo para a próxima abertura
                modalContent.classList.remove('closing');
                modalContent.style.opacity = '';
                modalContent.style.transform = '';
            }, 200);
        } else {
            // Fallback se não encontrou o elemento para animar
            cartModal.style.display = "none";
            document.body.style.overflow = '';
        }
        
        // Atualizar atributo aria-expanded para acessibilidade
        if (cartBtn) {
            cartBtn.setAttribute('aria-expanded', 'false');
            cartBtn.focus(); // Retorna o foco para o botão do carrinho
        }
        
        announceScreenReaderMessage('Carrinho de compras fechado');
    }
}

// Função para anunciar mensagens para leitores de tela
function announceScreenReaderMessage(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => document.body.removeChild(announcement), 3000);
}

// Melhoria na funcionalidade do controle de quantidade para acessibilidade
document.addEventListener('keydown', function(e) {
    if ((e.key === 'Enter' || e.key === ' ') && 
        (e.target.classList.contains('quantity-btn') || e.target.classList.contains('cart-quantity-btn'))) {
        e.preventDefault();
        e.target.click();
    }
});

// Controle de quantidade
document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const display = e.currentTarget.parentNode.querySelector('.quantity-display');
        let quantity = parseInt(display.textContent);
        const oldQuantity = quantity;

        if (action === 'increase') {
            quantity = Math.min(quantity + 1, 10); // Limita a 10 itens
        } else if (action === 'decrease') {
            quantity = Math.max(quantity - 1, 1); // Não permite menos que 1
        }

        display.textContent = quantity;
        
        // Anuncia para leitores de tela
        if (quantity !== oldQuantity) {
            const productName = button.closest('.menu-item').querySelector('h3, p.font-bold').textContent;
            announceScreenReaderMessage(`Quantidade de ${productName} alterada para ${quantity}`);
        }
    });
});

// Modificar a função que adiciona ao carrinho para considerar a quantidade
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Encontrar o display de quantidade mais próximo
        const quantityDisplay = button.parentNode.querySelector('.quantity-display');
        const quantity = parseInt(quantityDisplay.textContent);
        
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const total = price * quantity;

        // Adicionar ao carrinho com a quantidade selecionada
        addToCart(name, price, quantity);

        // Mostrar notificação
        Toastify({
            text: `${quantity}x ${name} adicionado ao carrinho!`,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
    });
});

// Adicionar no carrinho
/*
menu.addEventListener("click", function(event){
    let parentButton = event.target.closest(".add-to-cart-btn")
    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))
        addToCart(name, price)
    }
})
*/

// Função modificada para adicionar ao carrinho com animações e feedback
function addToCart(name, price, quantity = 1) {
    // Inicialize cart como array global
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.name === name);
    const isNewItem = !existingItem;
    
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        cart.push({
            name,
            price,
            quantity,
            total: price * quantity
        });
    }
    
    // Salvar no localStorage e atualizar interface
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartModal();
    
    // Animação do contador do carrinho
    animateCartCounter();
    
    // Feedback sonoro
    playFeedbackSound('add');
    
    // Feedback visual
    Toastify({
        text: isNewItem 
            ? `${name} adicionado ao carrinho!` 
            : `${name}: quantidade atualizada (${existingItem.quantity})`,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#22c55e",
            boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
        }
    }).showToast();
    
    // Anúncio para leitores de tela
    const message = isNewItem 
        ? `${name} adicionado ao carrinho.` 
        : `${name}: quantidade atualizada para ${existingItem.quantity} unidades.`;
    announceScreenReaderMessage(message);
    
    // Efeito visual no botão do carrinho
    if (cartBtn) {
        cartBtn.classList.add('ring-2', 'ring-white');
        setTimeout(() => {
            cartBtn.classList.remove('ring-2', 'ring-white');
        }, 1000);
    }
}

// Função melhorada para atualizar informações do contador do carrinho
function updateCartInfo() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Atualizar o número exibido com transição suave
    if (cartCounter) {
        // Animação para mudança de valor
        const oldValue = parseInt(cartCounter.innerText) || 0;
        if (oldValue !== cartCount) {
            // Aplicar classe para animar a mudança
            cartCounter.classList.add('cart-count-updating');
            
            // Atualizar o valor
            cartCounter.innerText = cartCount;
            
            // Remover classe após animação
            setTimeout(() => {
                cartCounter.classList.remove('cart-count-updating');
            }, 500);
        } else {
            // Sem animação para o mesmo valor
            cartCounter.innerText = cartCount;
        }
        
        // Destacar visualmente quando houver itens
        if (cartCount > 0) {
            // Adicionar estilo para indicar carrinho com itens
            cartCounter.classList.add('bg-white', 'text-orange-600');
            cartCounter.classList.remove('bg-gray-200', 'text-gray-500');
            
            if (cartBtn) {
                cartBtn.setAttribute('aria-label', `Ver carrinho de compras (${cartCount} ${cartCount === 1 ? 'item' : 'itens'})`);
            }
        } else {
            // Estilo para carrinho vazio
            cartCounter.classList.add('bg-gray-200', 'text-gray-500');
            cartCounter.classList.remove('bg-white', 'text-orange-600');
            
            if (cartBtn) {
                cartBtn.setAttribute('aria-label', 'Ver carrinho de compras (vazio)');
            }
        }
    }
}

// Função para atualizar todos os possíveis contadores de itens
function updateAllCounters(count) {
    // Atualizar o contador original
    if (cartCounter) {
        cartCounter.innerText = count.toString();
    }
    
    // Atualizar contador do botão fixo, se existir
    const fixedCounter = document.getElementById('fixed-cart-count');
    if (fixedCounter) {
        fixedCounter.innerText = count.toString();
    }
    
    // Buscar por outros contadores possíveis
    const allCounters = document.querySelectorAll('[id$="cart-count"]');
    allCounters.forEach(counter => {
        counter.innerText = count.toString();
    });
}

// Atualizar a exibição do carrinho para mostrar quantidades
function updateCartModal() {
    console.log("Atualizando modal do carrinho");
    
    // Verificar elementos essenciais
    const itemsContainer = cartItemsContainer || document.getElementById("cart-items");
    
    if (!itemsContainer) {
        console.error("Container de itens não encontrado para atualizar o carrinho");
        return;
    }
      itemsContainer.innerHTML = '';
    let totalAmount = 0;
    let totalItemCount = 0;
      
    // Adicionar botão "Limpar carrinho" se houver itens
    if (cart && cart.length > 0) {
        const clearCartContainer = document.createElement('div');
        clearCartContainer.className = 'flex justify-end mb-2';
        clearCartContainer.innerHTML = `
            <button 
                id="clear-cart-btn" 
                class="clear-cart-btn text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 text-sm flex items-center"
                aria-label="Remover todos os itens do carrinho"
                title="Limpar carrinho">
                <i class="fas fa-trash-alt mr-1"></i>
                Limpar carrinho
            </button>
        `;
        cartItemsContainer.appendChild(clearCartContainer);
        
        // Adicionar evento ao botão de limpar carrinho
        document.getElementById('clear-cart-btn').addEventListener('click', () => {
            clearCart();
        });
    }
    
    if (cart.length === 0) {
        // Mensagem para carrinho vazio com estilo consistente
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-cart-indicator flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 animate-fade-in';
        emptyMessage.innerHTML = `
            <div class="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full mb-4">
                <i class="fas fa-shopping-cart text-4xl text-orange-500 dark:text-orange-400"></i>
            </div>
            <p class="text-lg font-medium">Seu carrinho está vazio</p>
            <p class="text-sm mt-1 max-w-xs text-center">Adicione itens do cardápio para fazer seu pedido</p>
            <button class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors" 
                onclick="closeCartModal()" aria-label="Continuar comprando">
                <i class="fas fa-utensils mr-2"></i>Ver cardápio
            </button>
        `;
        cartItemsContainer.appendChild(emptyMessage);
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            // Aplicar estilos consistentes aos itens do carrinho com classes melhoradas
            itemElement.className = 'cart-item flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-4 shadow-md hover:shadow-xl transition-all';
            itemElement.setAttribute('data-name', item.name);
            
            // Determinar qual imagem mostrar com base no nome do item
            let imageSrc = './assets/pastel.jpg';
            let imageAlt = 'Pastel';
            
            if (item.name.toLowerCase().includes('coca') || item.name.toLowerCase().includes('cola')) {
                imageSrc = './assets/refri-1.png';
                imageAlt = 'Coca-Cola';
            } else if (item.name.toLowerCase().includes('guaran') || item.name.toLowerCase().includes('soda') || 
                      item.name.toLowerCase().includes('refri')) {
                imageSrc = './assets/refri-2.png';
                imageAlt = 'Refrigerante';
            } else if (item.name.toLowerCase().includes('cuscuz')) {
                imageSrc = './assets/cuscuz.jpg';
                imageAlt = 'Cuscuz';
            }
            
            // HTML melhorado para os itens do carrinho
            itemElement.innerHTML = `                <div class="relative cart-image-container">
                    <img 
                        src="${imageSrc}" 
                        alt="${imageAlt}" 
                        class="cart-item-image w-24 h-24 md:w-28 md:h-28 object-cover rounded-md shadow-md"
                        loading="lazy"
                    />
                    <span class="absolute -top-2 -right-2 bg-orange-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">
                        ${item.quantity}
                    </span>
                </div>                <div class="w-full">
                    <h4 class="font-bold text-lg text-gray-900 dark:text-gray-100">${item.name}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Preço unitário: <span class="font-medium">R$ ${parseFloat(item.price).toFixed(2)}</span></p>
                    
                    <div class="flex items-center gap-2 justify-between mt-3">
                        <p class="font-bold text-lg text-orange-600 dark:text-orange-400">
                            Total: R$ ${(item.price * item.quantity).toFixed(2)}
                        </p>                        <div class="flex items-center gap-3">
                            <div class="cart-quantity-control flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600" role="group" aria-label="Ajustar quantidade de ${item.name}">
                                <button 
                                    class="cart-action-btn px-3 py-2 text-orange-600 dark:text-orange-400 cart-quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                                    data-action="decrease"
                                    data-name="${item.name}"
                                    aria-label="Diminuir quantidade de ${item.name}"
                                    title="Diminuir quantidade">
                                    <i class="fas fa-minus" aria-hidden="true"></i>
                                </button>
                                <span class="cart-quantity-display px-4 py-1 font-bold text-base" aria-live="polite">${item.quantity}</span>
                                <button 
                                    class="cart-action-btn px-3 py-2 text-orange-600 dark:text-orange-400 cart-quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                                    data-action="increase"
                                    data-name="${item.name}"
                                    aria-label="Aumentar quantidade de ${item.name}"
                                    title="Aumentar quantidade">
                                    <i class="fas fa-plus" aria-hidden="true"></i>
                                </button>
                            </div>
                            <button 
                                class="cart-action-btn remove-from-cart-btn bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 shadow hover:shadow-lg transform hover:scale-105 active:scale-95" 
                                data-name="${item.name}"
                                aria-label="Remover ${item.name} do carrinho"
                                title="Remover item">
                                <i class="fa fa-trash" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;            cartItemsContainer.appendChild(itemElement);            totalAmount += item.price * item.quantity;
            totalItemCount += item.quantity;
        });
    }
      // Atualizar o total no rodapé do carrinho
    cartTotal.innerText = totalAmount.toFixed(2);
      // Atualizar o resumo de totais na primeira etapa
    updateCartTotalSummary(totalAmount, totalItemCount);
    
    updateCartInfo();
    
    // Otimizar a altura do modal baseado no conteúdo atual
    optimizeCartModalHeight();
      // Atualizar o resumo do pedido, se existir
    const orderSummaryContainer = document.getElementById('order-summary-container');
    if (orderSummaryContainer && typeof generateOrderSummary === 'function') {
        orderSummaryContainer.innerHTML = generateOrderSummary();
    }
    
    // Desabilitar botão de checkout se o carrinho estiver vazio
    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// Função para gerar o resumo do pedido de forma simplificada - apenas mostrando o total
function generateOrderSummary() {
    // Se o carrinho estiver vazio, retorna uma mensagem
    if (cart.length === 0) {
        return `
            <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p class="text-gray-500 dark:text-gray-400">Seu carrinho está vazio</p>
            </div>
        `;
    }
    
    // Somar o total do pedido
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItemCount = cart.reduce((count, item) => count + item.quantity, 0);
    
    // Criar um card simples com apenas o total - SEM tabela de itens/subtotais
    let html = `
        <div class="order-summary p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-sm">
            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Itens:</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${totalItemCount} ${totalItemCount === 1 ? 'item' : 'itens'}</span>
                </div>
                
                <div class="flex justify-between items-center border-t border-orange-200 dark:border-orange-800 pt-3 mt-1">
                    <span class="font-medium text-gray-800 dark:text-gray-200">Total:</span>
                    <span class="font-bold text-xl text-orange-600 dark:text-orange-400">R$ ${totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    return html;
}

// Função para destacar linha da tabela quando o usuário passar o mouse
// A função abaixo não é mais necessária já que não exibimos mais a tabela de itens no resumo
function setupOrderSummaryInteraction() {
    // Função mantida para compatibilidade, mas sem funcionalidade
}

// Evento melhorado para controlar a quantidade no carrinho
if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", function(event) {
        const button = event.target.closest('.cart-quantity-btn');
        if (button) {
            const action = button.dataset.action;
            const name = button.dataset.name;
            const item = cart.find(item => item.name === name);
            
            if (item) {
                let wasRemoved = false;
                let oldQuantity = item.quantity;
                
                if (action === 'increase') {
                    if (item.quantity < 20) { // Limite aumentado
                        item.quantity++;
                        
                        // Feedback visual do botão
                        button.classList.add('ring-2', 'ring-orange-500');
                        setTimeout(() => button.classList.remove('ring-2', 'ring-orange-500'), 300);
                        
                        // Feedback sonoro sutil
                        playFeedbackSound('add');
                    } else {
                        // Feedback quando atinge o máximo
                        Toastify({
                            text: `Máximo de 20 itens por produto`,
                            duration: 2000,
                            gravity: "top", 
                            position: "center",
                            style: {
                                background: "#f97316",
                            }
                        }).showToast();
                    }
                } else if (action === 'decrease') {
                    if (item.quantity > 1) {
                        item.quantity--;
                        
                        // Feedback visual do botão
                        button.classList.add('ring-2', 'ring-orange-500');
                        setTimeout(() => button.classList.remove('ring-2', 'ring-orange-500'), 300);
                    } else {
                        // Se a quantidade chegar a 0, pergunta antes de remover
                        const cartItem = button.closest('.cart-item');
                        if (cartItem) {
                            cartItem.classList.add('cart-item-removing');
                            wasRemoved = true;
                            
                            // Aguardar a animação antes de remover
                            setTimeout(() => {
                                removeItemCart(name);
                            }, 500);
                        }
                    }
                }
                
                if (!wasRemoved) {
                    // Atualizar carrinho no localStorage e a interface
                    item.total = item.quantity * item.price; // Atualizar o total do item
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // Atualizar apenas o display de quantidade e total em vez do modal inteiro
                    const cartItem = button.closest('.cart-item');
                    if (cartItem) {
                        const quantityDisplay = cartItem.querySelector('.cart-quantity-display');
                        const totalElement = cartItem.querySelector('p.font-bold.text-base');
                        
                        if (quantityDisplay) {
                            quantityDisplay.textContent = item.quantity;
                            quantityDisplay.classList.add('highlight');
                            setTimeout(() => quantityDisplay.classList.remove('highlight'), 500);
                        }
                        
                        if (totalElement) {
                            totalElement.textContent = `Total: R$ ${(item.price * item.quantity).toFixed(2)}`;
                        }
                        
                        // Atualizar o valor total e o contador
                        updateCartInfo();
                        let totalAmount = cart.reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0);
                        cartTotal.innerText = totalAmount.toFixed(2);
                    } else {
                        // Fallback: atualizar todo o modal
                        updateCartModal();
                    }
                    
                    // Anunciar para leitores de tela
                    const message = `Quantidade de ${name} atualizada para ${item.quantity}`;
                    announceScreenReaderMessage(message);
                }
            }
        }
    });
}

// Evento para o botão de remover item - versão corrigida e melhorada
if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", function(event) {
        // Verifica se o clique ocorreu no botão de remover ou em um filho dele (o ícone)
        const removeButton = event.target.closest('.remove-from-cart-btn');
        if (removeButton) {
            const name = removeButton.dataset.name;
            
            // Primeiro aplica a animação de remoção
            const cartItem = removeButton.closest('.cart-item');
            if (cartItem) {
                // Adiciona a classe para iniciar a animação
                cartItem.classList.add('cart-item-removing');
                
                // Desabilita o botão durante a animação para evitar cliques múltiplos
                removeButton.disabled = true;
                removeButton.classList.add('opacity-50');
                
                // Aguarda o fim da animação antes de remover efetivamente
                setTimeout(() => {
                    removeItemCart(name);
                    
                    // Feedback visual com Toastify
                    Toastify({
                        text: `${name} removido do carrinho!`,
                        duration: 3000,
                        gravity: "bottom",
                        position: "right",
                        style: {
                            background: "#ef4444",
                            boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
                        }
                    }).showToast();
                    
                    // Feedback sonoro para acessibilidade
                    playFeedbackSound('remove');
                }, 500); // Tempo da animação
            } else {
                // Fallback se não encontrou o elemento pai
                removeItemCart(name);
            }
        }
    });
}

// Modifique a função removeItemCart para remover o item completamente
function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartModal();
        
        // Anunciar para leitores de tela
        announceScreenReaderMessage(`${name} removido do carrinho.`);
        
        // Animar o contador do carrinho
        animateCartCounter();
    }
}

// Função para limpar o carrinho completamente
function clearCart() {
    // Confirmação visual antes de limpar
    if (cart.length > 0) {
        // Aplicar animação a todos os itens
        const cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(item => {
            item.classList.add('cart-item-removing');
        });
        
        setTimeout(() => {
            // Limpar o array do carrinho
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartModal();
            
            // Feedback visual e sonoro
            Toastify({
                text: "Carrinho limpo com sucesso!",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "#4b5563",
                }
            }).showToast();
            
            // Anúncio para leitores de tela
            announceScreenReaderMessage("Todos os itens foram removidos do carrinho.");
            
            // Animar o contador do carrinho
            animateCartCounter();
            
            // Feedback sonoro
            playFeedbackSound('clear');
        }, 500); // Tempo da animação
    }
}

// Função para animar o contador do carrinho
function animateCartCounter() {
    if (cartCounter) {
        cartCounter.classList.add('cart-count-updating');
        setTimeout(() => {
            cartCounter.classList.remove('cart-count-updating');
        }, 500);
    }
}

// Função melhorada para tocar sons de feedback (acessibilidade)
function playFeedbackSound(type) {
    // Verificar se o navegador suporta a API de áudio
    if (!window.AudioContext && !window.webkitAudioContext) {
        return; // Sai silenciosamente se não há suporte
    }

    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Sons mais agradáveis e sutis para diferentes ações
        switch(type) {
            case 'remove':
                // Som de remoção - mais grave e curto
                oscillator.type = 'sine';
                oscillator.frequency.value = 320;
                gainNode.gain.value = 0.08;
                
                const now = audioCtx.currentTime;
                oscillator.frequency.setValueAtTime(320, now);
                oscillator.frequency.linearRampToValueAtTime(280, now + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                break;
            
            case 'add':
                // Som de adição - mais agudo e alegre
                oscillator.type = 'sine';
                oscillator.frequency.value = 520;
                gainNode.gain.value = 0.08;
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                break;
                
            case 'clear':
                // Som completo para limpar carrinho - duas notas descendentes
                oscillator.type = 'sine';
                oscillator.frequency.value = 440;
                gainNode.gain.value = 0.08;
                
                // Criar uma sequência de duas notas
                const clearTime = audioCtx.currentTime;
                oscillator.frequency.setValueAtTime(440, clearTime);
                oscillator.frequency.setValueAtTime(330, clearTime + 0.15);
                
                // Reduzir o volume gradualmente
                gainNode.gain.setValueAtTime(0.08, clearTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, clearTime + 0.4);
                break;
                
            case 'success':
                // Som de sucesso - duas notas ascendentes
                oscillator.type = 'sine'; 
                oscillator.frequency.value = 440;
                gainNode.gain.value = 0.08;
                
                const successTime = audioCtx.currentTime;
                oscillator.frequency.setValueAtTime(440, successTime);
                oscillator.frequency.setValueAtTime(660, successTime + 0.15);
                
                gainNode.gain.setValueAtTime(0.08, successTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, successTime + 0.4);
                break;
                
            default:
                oscillator.type = 'sine';
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.08;
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        }
        
        // Conectar nós de áudio
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Determinar duração com base no tipo
        const duration = (type === 'clear' || type === 'success') ? 0.5 : 0.3;
        
        // Tocar som
        oscillator.start();
        
        // Parar depois do período definido
        setTimeout(() => {
            oscillator.stop();
        }, duration * 1000);
    } catch (e) {
        // Fallback silencioso se não suportar AudioContext
        console.log("Feedback sonoro não suportado neste navegador");
    }
}

// Validação de campos do formulário
// Validações de formulário
if (addressInput) {
    addressInput.addEventListener("input", function(event){
        let inputValue = event.target.value;

        if(inputValue !== ""){
            addressInput.classList.remove("border-red-500");
            addressInput.setAttribute("aria-invalid", "false");
            if (addressWarn) addressWarn.classList.add("hidden");
        }
    });
}

if (paymentMethod) {
    paymentMethod.addEventListener("change", function(event){
        if(event.target.value !== ""){
            paymentMethod.classList.remove("border-red-500");
            paymentMethod.setAttribute("aria-invalid", "false");
            if (paymentWarn) paymentWarn.classList.add("hidden");
        }
    });
}

// Função de finalização de pedido está implementada na seção de checkout em etapas

// As funções de checkout em etapas estão implementadas mais abaixo no código

// Função para navegar entre etapas
function goToStep(stepNumber) {
    // Validar o número da etapa
    if (stepNumber < 1 || stepNumber > 4) return;
    
    // Atualizar a etapa atual
    currentStep = stepNumber;
    
    // Atualizar classes visuais para as etapas
    const checkoutSteps = document.querySelectorAll('.checkout-step');
    checkoutSteps.forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Mostrar/esconder os conteúdos das etapas
    const stepContents = document.querySelectorAll('.checkout-step-content');
    stepContents.forEach(content => {
        content.classList.remove('active', 'hidden');
        content.classList.add('hidden');
    });
    
    // Mostrar o conteúdo da etapa atual
    const currentContent = document.getElementById(`checkout-step-${stepNumber}`);
    if (currentContent) {
        currentContent.classList.remove('hidden');
        currentContent.classList.add('active');
        
        // Anunciar para leitores de tela
        announceScreenReaderMessage(`Etapa ${currentStep} de 4: ${getStepName(currentStep)}`);
    }
    
    // Lógica específica para cada etapa
    handleStepSpecificLogic(stepNumber);
}

// Função para lidar com lógica específica de cada etapa
function handleStepSpecificLogic(stepNumber) {
    switch (stepNumber) {
        case 1: // Resumo do carrinho
            break;
            
        case 2: // Escolha de entrega/retirada
            // Garantir que a opção correta esteja marcada
            const deliveryRadios = document.querySelectorAll('input[name="delivery-option"]');
            deliveryRadios.forEach(radio => {
                if ((radio.value === 'delivery' && isDelivery) || 
                    (radio.value === 'pickup' && !isDelivery)) {
                    radio.checked = true;
                }
            });
            
            // Adicionar listener para as opções de entrega ou retirada
            deliveryRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    isDelivery = radio.value === 'delivery';
                    console.log(`Modo de entrega alterado: ${isDelivery ? 'Entrega' : 'Retirada'}`);
                });
            });
            break;
            
        case 3: // Endereço (apenas para entrega) ou identificação para retirada
            // Se for retirada, mostrar etapa de identificação do cliente
            if (!isDelivery) {
                // Esconder o step-3 e mostrar o formulário de identificação
                const step3Content = document.getElementById('checkout-step-3');
                const pickupContent = document.getElementById('checkout-step-pickup');
                
                if (step3Content && pickupContent) {
                    step3Content.classList.add('hidden');
                    step3Content.classList.remove('active');
                    pickupContent.classList.remove('hidden');
                    pickupContent.classList.add('active');
                    
                    // Anunciar para leitores de tela
                    announceScreenReaderMessage('Formulário de identificação para retirada na loja');
                    
                    // Focar no primeiro campo
                    const nameInput = document.getElementById('pickup-name');
                    if (nameInput) {
                        nameInput.focus();
                    }
                }
            }
            break;
            
        case 4: // Pagamento e finalização
            // Para retirada, usar os dados do formulário de identificação
            if (!isDelivery && addressInput) {
                // Obter os dados do cliente
                const nameInput = document.getElementById('pickup-name');
                const phoneInput = document.getElementById('pickup-phone');
                const notesInput = document.getElementById('pickup-notes');
                
                // Compor o texto para o endereço com os dados do cliente
                let pickupInfo = "Retirada na loja";
                if (nameInput && phoneInput) {
                    pickupInfo += `\nNome: ${nameInput.value}`;
                    pickupInfo += `\nTelefone: ${phoneInput.value}`;
                    
                    if (notesInput && notesInput.value.trim()) {
                        pickupInfo += `\nObservações: ${notesInput.value.trim()}`;
                    }
                }
                
                // Preencher o campo de endereço com os dados de retirada
                addressInput.value = pickupInfo;
                addressInput.disabled = true;
            } else if (addressInput) {
                // Para entrega, campo normal
                addressInput.disabled = false;
            }
            
            // Atualizar o resumo final do pedido
            updateFinalOrderSummary();
            break;
    }
}

// Função para gerar o resumo final do pedido na última etapa
function updateFinalOrderSummary() {
    const finalSummaryContainer = document.getElementById('final-order-summary');
    if (!finalSummaryContainer) return;
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const deliveryText = isDelivery ? 'Entrega em casa' : 'Retirada na loja';
    
    // Adicionar a tabela detalhada apenas na etapa de pagamento
    let html = `
        <div class="order-summary p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-sm mb-3">
            <h4 class="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200 flex items-center">
                <i class="fas fa-receipt text-orange-500 mr-2"></i>
                Detalhes do Pedido
            </h4>
            
            <div class="order-items-container max-h-32 overflow-y-auto mb-3" style="scrollbar-width: thin; scrollbar-color: #f97316 #e5e7eb;">
                <table class="w-full text-sm">
                    <thead class="border-b border-orange-200 dark:border-orange-800 sticky top-0 bg-orange-50 dark:bg-orange-900/20 z-10">
                        <tr>
                            <th scope="col" class="text-left py-2 font-medium text-gray-600 dark:text-gray-300">Item</th>
                            <th scope="col" class="text-center py-2 font-medium text-gray-600 dark:text-gray-300">Qtd</th>
                            <th scope="col" class="text-right py-2 font-medium text-gray-600 dark:text-gray-300">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Adicionar cada item do carrinho na tabela
        cart.forEach(item => {
            html += `
                <tr class="border-b border-orange-100 dark:border-orange-900/30 hover:bg-orange-100/50 dark:hover:bg-orange-900/10 transition-colors">
                    <td class="py-2 text-gray-800 dark:text-gray-200">${item.name}</td>
                    <td class="py-2 text-center text-gray-800 dark:text-gray-200">${item.quantity}</td>
                    <td class="py-2 text-right text-gray-800 dark:text-gray-200">R$ ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `;
        });
          // Fechar a tabela e adicionar o total
        html += `
                    </tbody>
                </table>
            </div>
            
            <div class="flex justify-between items-center border-t border-orange-200 dark:border-orange-800 pt-3">
                <span class="font-medium text-gray-800 dark:text-gray-200">Total do Pedido:</span>
                <span class="font-bold text-xl text-orange-600 dark:text-orange-400">R$ ${totalAmount.toFixed(2)}</span>
            </div>
        </div>
    `;
      finalSummaryContainer.innerHTML = html;
      
      // Adicionar interatividade às linhas da tabela na etapa de pagamento
      const rows = document.querySelectorAll('#final-order-summary .order-items-container tbody tr');
      rows.forEach(row => {
          // Destacar a linha ao passar o mouse
          row.addEventListener('mouseenter', function() {
              this.classList.add('bg-orange-50', 'dark:bg-orange-900/20');
          });
          
          row.addEventListener('mouseleave', function() {
              this.classList.remove('bg-orange-50', 'dark:bg-orange-900/20');
          });
      });
}

// Modificar a função checkout para considerar o modo de entrega
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function(){
        // Verificar se o restaurante está aberto
        const isOpen = checkRestaurantOpen();
        if(!isOpen){
            Toastify({
                text: "Ops! O restaurante está fechado no momento!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "center",
                stopOnFocus: true,
                style: {
                    background: "#ef4444",
                },
            }).showToast();
            
            announceScreenReaderMessage("O restaurante está fechado no momento. Tente novamente no horário de funcionamento.");
            return;
        }

        // Verificar se há itens no carrinho
        if(cart.length === 0) {
            announceScreenReaderMessage("O carrinho está vazio. Adicione itens antes de finalizar o pedido.");
            return;
        }

        // Validar formulário (apenas para entrega)
        let hasError = false;
        
        // Validar método de pagamento em qualquer caso
        if(paymentMethod.value.trim() === ""){
            paymentWarn.classList.remove("hidden");
            paymentMethod.classList.add("border-red-500");
            paymentMethod.setAttribute("aria-invalid", "true");
            paymentMethod.focus();
            hasError = true;
        }
        
        // Validar endereço apenas se for entrega (não retirada)
        if(isDelivery && addressInput.value.trim() === ""){
            addressWarn.classList.remove("hidden");
            addressInput.classList.add("border-red-500");
            addressInput.setAttribute("aria-invalid", "true");
            if (!hasError) {
                addressInput.focus();
            }
            hasError = true;
        }
        
        // Validação do formulário de identificação para retirada na loja
        if (!isDelivery) {
            const isPickupFormValid = validatePickupForm();
            if (!isPickupFormValid) {
                hasError = true;
            }
        }
        
        if(hasError) {
            announceScreenReaderMessage("Preencha todos os campos obrigatórios antes de finalizar o pedido.");
            return;
        }

        // Preparar dados do pedido formatados
        let pedidoTexto = "🛒 *NOVO PEDIDO* 🛒\n\n";
        
        // Adicionar tipo de entrega
        pedidoTexto += isDelivery ? "🚚 *ENTREGA EM CASA*\n\n" : "🏪 *RETIRADA NA LOJA*\n\n";
        
        pedidoTexto += "📋 *ITENS DO PEDIDO:*\n";
        
        cart.forEach(item => {
            pedidoTexto += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        pedidoTexto += "\n💰 *TOTAL:* R$ " + cartTotal.innerText + "\n\n";
        
        // Se for entrega, inclui o endereço
        if (isDelivery) {
            pedidoTexto += "🏠 *ENDEREÇO DE ENTREGA:*\n" + addressInput.value.trim() + "\n\n";
        }
        
        pedidoTexto += "💳 *FORMA DE PAGAMENTO:*\n" + paymentMethod.options[paymentMethod.selectedIndex].text;

        const message = encodeURIComponent(pedidoTexto);
        const phone = "557981575934";
        
        // Notificação de confirmação
        Toastify({
            text: "Pedido finalizado! Redirecionando para o WhatsApp...",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast();
        
        announceScreenReaderMessage("Pedido finalizado com sucesso! Redirecionando para o WhatsApp.");

        // Abrir WhatsApp com pequeno delay para permitir que a notificação seja lida
        setTimeout(() => {
            window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
            
            // Limpar carrinho após finalizar pedido
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartModal();
              // Fechar modal após finalizar
            closeCartModal();
        }, 1500);
    });
}

// Função para inicializar o checkout em etapas
function initCheckoutSteps() {
    // Buscar elementos das etapas
    const checkoutSteps = document.querySelectorAll('.checkout-step');
    const stepContents = document.querySelectorAll('.checkout-step-content');
    deliveryOptions = document.querySelectorAll('input[name="delivery-option"]');
    nextButtons = document.querySelectorAll('[id^="step-"][id$="-next"]');
    prevButtons = document.querySelectorAll('[id^="step-"][id$="-prev"]');
    
    // Configurar os botões de próximo passo
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepId = parseInt(this.id.split('-')[1]);
            
            // Validações específicas para cada etapa
            if (currentStepId === 1) {
                // Verificar se há itens no carrinho
                if (cart.length === 0) {
                    Toastify({
                        text: "Adicione itens ao carrinho antes de continuar",
                        duration: 3000,
                        gravity: "top",
                        position: "center",
                        style: {
                            background: "#ef4444",
                        }
                    }).showToast();
                    return;
                }
            } else if (currentStepId === 3) {
                // Validação do endereço na etapa de entrega
                if (isDelivery && addressInput.value.trim() === "") {
                    addressWarn.classList.remove("hidden");
                    addressInput.classList.add("border-red-500");
                    addressInput.focus();
                    return;
                }
            }
            
            // Para entrega, segue o fluxo normal
            if (isDelivery) {
                goToStep(currentStepId + 1);
            } 
            // Para retirada na loja, pula a etapa de endereço
            else if (currentStepId === 2) {
                goToStep(4); // Ir direto para a etapa de pagamento/finalização
            }
        });
    });
    
    // Configurar os botões de voltar
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepId = parseInt(this.id.split('-')[1]);
            
            // Para entrega, segue o fluxo normal
            if (isDelivery) {
                goToStep(currentStepId - 1);
            } 
            // Para retirada na loja, se estiver na etapa de pagamento, volta para a etapa de escolha de entrega/retirada
            else if (currentStepId === 4) {
                goToStep(2); // Volta para a etapa de escolha de entrega/retirada
            }
        });
    });
    
    // Configurar as opções de entrega/retirada
    deliveryOptions.forEach(option => {
        option.addEventListener('change', function() {
            isDelivery = this.value === 'delivery';
            console.log('Modo de entrega:', isDelivery ? 'Entrega' : 'Retirada');
            
            // Atualiza a etapa 3 (endereço) para required apenas se for entrega
            if (addressInput) {
                addressInput.required = isDelivery;
            }
        });
    });
}

// Função para retornar o nome da etapa atual (para acessibilidade)
function getStepName(stepNumber) {
    switch (stepNumber) {
        case 1:
            return "Resumo do Pedido";
        case 2:
            return "Método de Recebimento";
        case 3:
            return "Endereço de Entrega";
        case 4:
            return "Forma de Pagamento";
        default:
            return "Etapa desconhecida";
    }
}

// Fallback global para garantir que o carrinho possa ser aberto de qualquer lugar
// Esta função será acessível globalmente
window.abrirCarrinho = function(e) {
    console.log("Abrindo carrinho via função global window.abrirCarrinho");
    
    // Usar diretamente a função principal
    openModalDiretamente(e);
    
    // Sempre garantir que vá para a primeira etapa (resumo do pedido)
    setTimeout(() => {
        if (typeof goToStep === 'function') {
            goToStep(1);
        }
    }, 100);
};

// Função para atualizar o resumo do total na primeira etapa
function updateCartTotalSummary(total, itemCount) {
    const subtotalElement = document.getElementById('cart-subtotal');
    const itemCountElement = document.getElementById('cart-item-count');
    const grandTotalElement = document.getElementById('cart-grand-total');
    
    if (subtotalElement && itemCountElement && grandTotalElement) {
        subtotalElement.textContent = `R$ ${total.toFixed(2)}`;
        itemCountElement.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`;
        grandTotalElement.textContent = `R$ ${total.toFixed(2)}`;
        
        // Aplicar classe para destacar quando há mudanças
        [subtotalElement, itemCountElement, grandTotalElement].forEach(el => {
            el.classList.add('highlight');
            setTimeout(() => el.classList.remove('highlight'), 500);
        });
    }
}

// Função para validar o formulário de identificação para retirada
function validatePickupForm() {
    const nameInput = document.getElementById('pickup-name');
    const phoneInput = document.getElementById('pickup-phone');
    const nameError = document.getElementById('pickup-name-error');
    const phoneError = document.getElementById('pickup-phone-error');
    
    let isValid = true;
    
    // Validar campo de nome
    if (!nameInput || !nameInput.value.trim()) {
        nameInput.classList.add('error');
        nameError.style.display = 'block';
        isValid = false;
    } else {
        nameInput.classList.remove('error');
        nameError.style.display = 'none';
    }
    
    // Validar campo de telefone
    if (!phoneInput || !phoneInput.value.trim()) {
        phoneInput.classList.add('error');
        phoneError.style.display = 'block';
        isValid = false;
    } else {
        phoneInput.classList.remove('error');
        phoneError.style.display = 'none';
    }
    
    return isValid;
}

// Configurar eventos para navegação no checkout
function setupCheckoutNavigation() {    // Botões para avançar
    const nextButtons = document.querySelectorAll('[id^="step-"][id$="-next"]');
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepId = this.id.replace('-next', '');
            const currentStepNum = parseInt(currentStepId.replace('step-', ''));
            
            // Lógica especial para alguns botões
            if (currentStepId === 'step-2') {
                // Verificar se é entrega ou retirada
                const deliveryOption = document.querySelector('input[name="delivery-option"]:checked');
                if (deliveryOption) {
                    isDelivery = deliveryOption.value === 'delivery';
                    
                    // Se for retirada, ir para a etapa de identificação, senão para endereço
                    if (!isDelivery) {
                        // Ir para o formulário de identificação
                        const step3Content = document.getElementById('checkout-step-3');
                        const pickupContent = document.getElementById('checkout-step-pickup');
                        
                        if (step3Content && pickupContent) {
                            step3Content.classList.add('hidden');
                            step3Content.classList.remove('active');
                            pickupContent.classList.remove('hidden');
                            pickupContent.classList.add('active');
                            
                            // Atualizar o indicador visual de etapas
                            const steps = document.querySelectorAll('.checkout-step');
                            steps.forEach(step => {
                                const stepNum = parseInt(step.dataset.step);
                                if (stepNum < 3) {
                                    step.classList.add('completed');
                                    step.classList.remove('active');
                                } else if (stepNum === 3) {
                                    step.classList.add('active');
                                    step.classList.remove('completed');
                                }
                            });
                            
                            return;
                        }
                    }
                }
            } else if (currentStepId === 'step-pickup') {
                // Validar o formulário de identificação antes de prosseguir
                if (!validatePickupForm()) {
                    // Formulário inválido, mostrar feedback e não prosseguir
                    Toastify({
                        text: "Por favor, preencha todos os campos obrigatórios.",
                        duration: 3000,
                        gravity: "top",
                        position: "center",
                        style: {
                            background: "#ef4444",
                        }
                    }).showToast();
                    return;
                }
                
                // Formulário válido, ir direto para a etapa de pagamento (4)
                goToStep(4);
                return;
            }
            
            // Avançar para a próxima etapa normalmente
            goToStep(currentStepNum + 1);
        });
    });
    
    // Botões para voltar
    const prevButtons = document.querySelectorAll('[id^="step-"][id$="-prev"]');
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepId = this.id.replace('-prev', '');
            const currentStepNum = parseInt(currentStepId.replace('step-', ''));
            
            // Lógica especial para alguns botões
            if (currentStepId === 'step-pickup') {
                // Do formulário de identificação, voltar para a escolha do método de recebimento
                goToStep(2);
                return;
            }
            
            // Voltar para a etapa anterior normalmente
            goToStep(currentStepNum - 1);
        });
    });
}

// Chamar esta função após o DOM estar carregado
document.addEventListener('DOMContentLoaded', function() {
    // Código existente...
    
    // Inicializar navegação do checkout
    setTimeout(setupCheckoutNavigation, 500);
});

// Configurar validação em tempo real para o formulário de identificação
function setupPickupFormValidation() {
    const nameInput = document.getElementById('pickup-name');
    const phoneInput = document.getElementById('pickup-phone');
    const nameError = document.getElementById('pickup-name-error');
    const phoneError = document.getElementById('pickup-phone-error');
    
    if (nameInput && phoneInput) {
        // Validação em tempo real para o campo de nome
        nameInput.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
                nameError.style.display = 'none';
            } else {
                this.classList.add('error');
                nameError.style.display = 'block';
            }
        });
        
        // Validação em tempo real para o campo de telefone
        phoneInput.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
                phoneError.style.display = 'none';
            } else {
                this.classList.add('error');
                phoneError.style.display = 'block';
            }
            
            // Formatação automática do telefone (opcional)
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0) {
                // Formatar como (XX) XXXXX-XXXX
                if (value.length <= 2) {
                    this.value = `(${value}`;
                } else if (value.length <= 7) {
                    this.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                } else {
                    this.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
                }
            }
        });
    }
    
    // Adicionar a função ao ciclo de inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupPickupFormValidation);
    } else {
        setupPickupFormValidation();
    }
}

// Inicializar a validação do formulário
setupPickupFormValidation();

// Função para otimizar a altura do modal do carrinho
function optimizeCartModalHeight() {
    const cartModal = document.getElementById('cart-modal');
    const cartScrollContent = document.querySelector('.cart-scrollable-content');
    
    if (cartModal && cartScrollContent) {
        // Ajustar altura com base na quantidade de itens
        const itemCount = cart.length;
        let optimalHeight = 'auto';
        
        // Calcular a altura ideal com base no número de itens, mas com limite máximo
        if (itemCount > 0) {
            // Aproximadamente 100px por item, mas limitado a 60% da altura da janela
            const baseHeight = Math.min(itemCount * 100, window.innerHeight * 0.6);
            optimalHeight = `${baseHeight}px`;
        }
        
        // Aplicar altura personalizada
        cartScrollContent.style.maxHeight = optimalHeight;
        
        // Adicionar atributos ARIA para acessibilidade
        cartModal.setAttribute('aria-busy', 'false');
        cartModal.setAttribute('aria-live', 'polite');
    }
}

// Adicionar à função que abre o modal
function openModalDiretamente(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (cartModal) {
        cartModal.style.display = "flex";
        document.body.style.overflow = 'hidden'; // Impedir rolagem do body
        
        // Otimizar altura do modal baseado no conteúdo atual
        optimizeCartModalHeight();
        
        // Atualizar atributo aria-expanded para acessibilidade
        if (cartBtn) {
            cartBtn.setAttribute('aria-expanded', 'true');
        }
        
        // Focar no primeiro elemento focalizável para acessibilidade
        const firstFocusable = cartModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Anunciar para leitores de tela
        announceScreenReaderMessage('Carrinho de compras aberto');
    }
}
