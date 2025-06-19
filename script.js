// Declaração de variáveis globais
let menu, cartBtn, cartModal, cartItemsContainer, cartTotal, checkoutBtn, 
    closeModalBtn, cartCounter, addressInput, addressWarn, paymentMethod, paymentWarn;

// Carrinho de compras
let cart = [];

// Função para inicializar elementos do DOM
function initElements() {
    console.log("Inicializando elementos DOM");
    // Inicialização de elementos essenciais
    menu = document.getElementById("menu");
    cartBtn = document.getElementById("cart-btn");
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
    
    // Debug - verificar se encontrou o botão
    console.log("Botão do carrinho:", cartBtn);
    console.log("Modal do carrinho:", cartModal);
    
    // Verificar cada elemento essencial e tentar alternativas se necessário
    if (!cartBtn) {
        console.warn("Botão do carrinho não encontrado pelo ID, tentando seletor alternativo");
        cartBtn = document.querySelector("button[aria-label='Ver carrinho de compras']");
        console.log("Botão encontrado com seletor alternativo:", cartBtn);
    }
    
    if (!cartModal) {
        console.warn("Modal do carrinho não encontrado");
    }
    
    if (!cartItemsContainer) {
        console.warn("Container de itens do carrinho não encontrado");
    }
    
    // Iniciar os listeners de eventos
    setupEventListeners();
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Abrir o modal do carrinho
    if (cartBtn) {
        console.log("Adicionando evento de clique ao botão do carrinho");
        
        // Remover eventos anteriores para evitar duplicação
        cartBtn.removeEventListener("click", openCartModal);
        
        // Adicionar evento com função nomeada para poder removê-la se necessário
        cartBtn.addEventListener("click", openCartModal);
    } else {
        console.error('Botão do carrinho não encontrado');
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
}

// Função para abrir o modal do carrinho
function openCartModal(e) {
    console.log("Clique no botão do carrinho detectado");
    e.preventDefault();
    
    // Verificar novamente se todos os elementos estão disponíveis
    if (!cartModal) {
        console.error("Modal do carrinho não encontrado ao tentar abrir");
        return;
    }
    
    // Atualizar e mostrar o modal
    updateCartModal();
    cartModal.style.display = "flex";
    document.body.style.overflow = 'hidden'; // Previne scroll na página
    
    // Foco no botão de fechar para melhor acessibilidade
    if (closeModalBtn) setTimeout(() => closeModalBtn.focus(), 100);
    
    // Anuncia para leitores de tela
    announceScreenReaderMessage('Carrinho de compras aberto');
}

// Inicializar quando o DOM for carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, inicializando elementos");
    
    // Log para elementos importantes antes da inicialização
    console.log("Verificando elementos antes da inicialização:");
    console.log("- Botão do carrinho existe:", !!document.getElementById("cart-btn"));
    console.log("- Modal do carrinho existe:", !!document.getElementById("cart-modal"));
    
    // Inicializar elementos do DOM
    initElements();
    
    // Log para confirmar após inicialização
    console.log("Após inicialização:");
    console.log("- cartBtn inicializado:", !!cartBtn);
    console.log("- cartModal inicializado:", !!cartModal);
    
    // Carregar carrinho do localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Atualizar informações do carrinho
    updateCartModal();
    
    // Iniciar verificação de status do restaurante
    updateRestaurantStatus();
    
    // Garantir que eventos de clique funcionem
    if (cartBtn) {
        console.log("Reforçando evento de clique no botão do carrinho");
        
        // Mostrar evento direto para depuração
        cartBtn.onclick = function(e) {
            console.log("Clique direto no botão do carrinho através de onclick");
            openCartModal(e);
        };
    }
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
        cartModal.style.display = "none";
        document.body.style.overflow = '';
        if (cartBtn) cartBtn.focus(); // Retorna o foco para o botão do carrinho
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

// Função modificada para adicionar ao carrinho
function addToCart(name, price, quantity = 1) {
    // Inicialize cart como array global
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.name === name);
    
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
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartModal();
}

// Função para atualizar informações do contador do carrinho
function updateCartInfo() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Atualizar o número exibido
    if (cartCounter) {
        cartCounter.innerText = cartCount;
        
        // Destacar visualmente quando houver itens
        if (cartCount > 0) {
            cartCounter.classList.add('animate-pulse');
            setTimeout(() => cartCounter.classList.remove('animate-pulse'), 500);
            
            // Adicionar classe para destacar o botão
            if (cartBtn) cartBtn.classList.add('ring-2', 'ring-white');
        } else {
            // Remover destaque quando vazio
            if (cartBtn) cartBtn.classList.remove('ring-2', 'ring-white');
        }
    }
}

// Atualizar a exibição do carrinho para mostrar quantidades
function updateCartModal() {
    cartItemsContainer.innerHTML = '';
    let totalAmount = 0;
      if (cart.length === 0) {
        // Mensagem para carrinho vazio com estilo consistente
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 animate-fade-in';
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
        cartItemsContainer.appendChild(emptyMessage);} else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            // Aplicar estilos consistentes do menu-item aos itens do carrinho
            itemElement.className = 'flex gap-2 p-3 rounded-lg animate-fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-3 shadow-md hover:shadow-lg transition-all';
            
            // Usar HTML consistente com o layout dos itens do menu, porém adaptado para o carrinho
            itemElement.innerHTML = `
                <div class="w-14 h-14 flex-shrink-0 bg-orange-100 dark:bg-orange-900 rounded-md flex items-center justify-center">
                    <i class="fas fa-utensils text-orange-600 dark:text-orange-400 text-2xl"></i>
                </div>
                <div class="w-full">
                    <h4 class="font-bold text-base">${item.name}</h4>
                    <div class="flex items-center gap-2 justify-between mt-2">
                        <p class="font-bold text-base text-orange-600 dark:text-orange-400">R$ ${(item.price * item.quantity).toFixed(2)}</p>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded" role="group" aria-label="Ajustar quantidade de ${item.name}">
                                <button 
                                    class="px-2 py-1 text-orange-600 dark:text-orange-400 cart-quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l" 
                                    data-action="decrease"
                                    data-name="${item.name}"
                                    aria-label="Diminuir quantidade de ${item.name}"
                                    title="Diminuir quantidade">
                                    <i class="fas fa-minus" aria-hidden="true"></i>
                                </button>
                                <span class="px-3" aria-live="polite">${item.quantity}</span>
                                <button 
                                    class="px-2 py-1 text-orange-600 dark:text-orange-400 cart-quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r" 
                                    data-action="increase"
                                    data-name="${item.name}"
                                    aria-label="Aumentar quantidade de ${item.name}"
                                    title="Aumentar quantidade">
                                    <i class="fas fa-plus" aria-hidden="true"></i>
                                </button>
                            </div>
                            <button 
                                class="remove-from-cart-btn bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors" 
                                data-name="${item.name}"
                                aria-label="Remover ${item.name} do carrinho"
                                title="Remover item">
                                <i class="fa fa-trash" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            totalAmount += item.price * item.quantity;
        });
    }
    
    cartTotal.innerText = totalAmount.toFixed(2);
    updateCartInfo();
    
    // Desabilitar botão de checkout se o carrinho estiver vazio
    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// Adicione este novo evento para controlar a quantidade no carrinho
if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", function(event) {
            const button = event.target.closest('.cart-quantity-btn');
            if (button) {
                const action = button.dataset.action;
                const name = button.dataset.name;
                const item = cart.find(item => item.name === name);
                
                if (item) {
                    if (action === 'increase') {
                        if (item.quantity < 10) {
                            item.quantity++;
                        }
                    } else if (action === 'decrease') {
                        if (item.quantity > 1) {
                            item.quantity--;
                        } else {
                            // Se a quantidade chegar a 0, remove o item
                            const index = cart.findIndex(cartItem => cartItem.name === name);
                            if (index !== -1) {
                                cart.splice(index, 1);
                            }
                        }
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartModal();                }
            }
        });
    }

// Adicione este evento para o botão de remover item
if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", function(event) {
            // Verifica se clicou no botão de remover
            const removeButton = event.target.closest('.remove-from-cart-btn');
            if (removeButton) {
                const name = removeButton.dataset.name;
                removeItemCart(name);
                
                // Mostra notificação de item removido
                Toastify({
                    text: `${name} removido do carrinho!`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "#ef4444",
                    }                }).showToast();
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

// Finalizar pedido
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

    // Validar formulário
    let hasError = false;
    
    // Validar endereço
    if(addressInput.value.trim() === ""){
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        addressInput.setAttribute("aria-invalid", "true");
        addressInput.focus();
        hasError = true;
    }
    
    // Validar método de pagamento
    if(paymentMethod.value.trim() === ""){
        paymentWarn.classList.remove("hidden");
        paymentMethod.classList.add("border-red-500");
        paymentMethod.setAttribute("aria-invalid", "true");
        if (!hasError) {
            paymentMethod.focus();
        }
        hasError = true;
    }
    
    if(hasError) {
        announceScreenReaderMessage("Preencha todos os campos obrigatórios antes de finalizar o pedido.");
        return;
    }

    // Preparar dados do pedido formatados
    let pedidoTexto = "🛒 *NOVO PEDIDO* 🛒\n\n";
    pedidoTexto += "📋 *ITENS DO PEDIDO:*\n";
    
    cart.forEach(item => {
        pedidoTexto += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    pedidoTexto += "\n💰 *TOTAL:* R$ " + cartTotal.innerText + "\n\n";
    pedidoTexto += "🏠 *ENDEREÇO DE ENTREGA:*\n" + addressInput.value.trim() + "\n\n";
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
        closeCartModal();    }, 1500);
        
        });
    }

// Verificação de funcionamento do restaurante
function checkRestaurantOpen(){
    const data = new Date();
    const dia = data.getDay(); // 0 (Domingo) - 6 (Sábado)
    const hora = data.getHours();
    
    // Fechado às segundas (dia 1)
    if (dia === 1) {
        return false;
    }
    
    // Aberto das 16h às 22h nos outros dias
    return hora >= 16 && hora < 22; 
}

// Atualiza o status de funcionamento do restaurante
function updateRestaurantStatus() {
    const spanItem = document.getElementById("date-span");
    if (!spanItem) return;
    
    const isOpen = checkRestaurantOpen();
    
    // Mudar apenas a cor de fundo do elemento sem alterar o conteúdo
    if(isOpen){
        spanItem.classList.remove("bg-red-600");
        spanItem.classList.add("bg-green-600");
    } else {
        spanItem.classList.remove("bg-green-600");
        spanItem.classList.add("bg-red-600");
    }
    
    // Atualiza o atributo aria-label para acessibilidade
    const statusText = isOpen ? "Estabelecimento aberto agora" : "Estabelecimento fechado agora";
    spanItem.setAttribute('aria-label', `Horário de funcionamento: Terça à Domingo das 16:00 às 22:00. ${statusText}`);
}

// Inicializa status do restaurante
updateRestaurantStatus();

// Atualiza o status a cada minuto
setInterval(updateRestaurantStatus, 60000);
