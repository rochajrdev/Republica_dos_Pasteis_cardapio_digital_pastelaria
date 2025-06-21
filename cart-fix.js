// Script de correção para o botão do carrinho
// Este arquivo deve ser carregado após o script.js principal

// Esperar que todos os scripts carreguem
document.addEventListener('DOMContentLoaded', function() {
    console.log("Cart-fix carregado - garantindo funcionamento do botão do carrinho");
    
    // Função para garantir que o botão do carrinho funcione
    function ensureCartButtonWorks() {
        console.log("Verificando e corrigindo botão do carrinho");
        
        // Tentar encontrar o botão do carrinho
        const cartButton = document.getElementById('cart-btn');
        
        if (cartButton) {
            console.log("Botão do carrinho encontrado, adicionando eventos");
            
            // Remover eventos anteriores
            const newButton = cartButton.cloneNode(true);
            if (cartButton.parentNode) {
                cartButton.parentNode.replaceChild(newButton, cartButton);
            }
            
            // Adicionar eventos
            newButton.onclick = function(e) {
                console.log("Botão do carrinho clicado (fix)");
                e.preventDefault();
                  // Abrir o carrinho usando a função global se disponível
                if (typeof window.abrirCarrinho === 'function') {
                    window.abrirCarrinho(e);
                } else {
                    // Fallback - tentar abrir diretamente
                    const cartModal = document.getElementById('cart-modal');
                    if (cartModal) {
                        cartModal.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                        
                        // Ir para a primeira etapa (resumo do pedido)
                        setTimeout(() => {
                            if (typeof goToStep === 'function') {
                                goToStep(1);
                            }
                        }, 100);
                    } else {
                        alert("Erro ao abrir o carrinho. Por favor, recarregue a página.");
                    }
                }
                
                return false;
            };
        } else {
            console.log("Botão do carrinho não encontrado, criando botão fixo");
            
            // Verificar se já existe botão fixo
            if (!document.getElementById('fixed-cart-btn')) {
                // Criar botão flutuante fixo
                const fixedButton = document.createElement('button');
                fixedButton.id = 'fixed-cart-btn';
                fixedButton.className = 'fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg z-50';
                fixedButton.innerHTML = '<i class="fa fa-shopping-cart"></i>';
                
                // Adicionar evento
                fixedButton.onclick = function(e) {
                    console.log("Botão fixo clicado (fix)");
                    e.preventDefault();
                    
                    // Abrir o carrinho usando a função global
                    if (typeof window.abrirCarrinho === 'function') {
                        window.abrirCarrinho(e);
                    } else {
                        // Fallback
                        const cartModal = document.getElementById('cart-modal');
                        if (cartModal) {
                            cartModal.style.display = 'flex';
                            document.body.style.overflow = 'hidden';
                        }
                    }
                    
                    return false;
                };
                
                // Adicionar ao body
                document.body.appendChild(fixedButton);
                console.log("Botão fixo criado");
            }
        }
    }
    
    // Função para criar uma versão mínima do carrinho que sempre será exibida no rodapé
    // Esta função é executada se outras abordagens falharem
    function createMinimalCartFooter() {
        console.log("Criando barra de carrinho no rodapé (último recurso)");
        
        // Verificar se já existe
        if (document.getElementById('minimal-cart-footer')) {
            return;
        }
        
        // Carregar o carrinho do localStorage
        let cart;
        try {
            cart = JSON.parse(localStorage.getItem('cart')) || [];
        } catch (e) {
            console.error("Erro ao carregar carrinho:", e);
            cart = [];
        }
        
        // Calcular total de itens e valor
        const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
        const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Criar elemento de rodapé
        const footerCart = document.createElement('div');
        footerCart.id = 'minimal-cart-footer';
        footerCart.className = 'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between z-50';
        footerCart.innerHTML = `
            <div class="flex items-center">
                <div class="bg-orange-600 p-2 rounded-full mr-3">
                    <i class="fa fa-shopping-cart text-white"></i>
                </div>
                <div>
                    <span class="font-bold">${itemCount} ${itemCount === 1 ? 'item' : 'itens'}</span>
                    <p class="text-sm text-gray-600 dark:text-gray-400">R$ ${totalValue.toFixed(2)}</p>
                </div>
            </div>
            <button 
                id="minimal-cart-open-btn"
                class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
                Ver carrinho
            </button>
        `;
        
        // Adicionar evento de clique
        document.body.appendChild(footerCart);
        
        const openBtn = document.getElementById('minimal-cart-open-btn');
        if (openBtn) {
            openBtn.onclick = function(e) {
                e.preventDefault();
                console.log("Botão do carrinho do rodapé clicado");
                
                if (typeof window.abrirCarrinho === 'function') {
                    window.abrirCarrinho(e);
                } else {
                    // Fallback extremo
                    const cartModal = document.getElementById('cart-modal');
                    if (cartModal) {
                        cartModal.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    } else {
                        alert("Não foi possível abrir o carrinho. Por favor, recarregue a página.");
                    }
                }
            };
        }
        
        // Adicionar margem no body para não esconder conteúdo
        const footerHeight = footerCart.offsetHeight || 60;
        document.body.style.marginBottom = `${footerHeight}px`;
        
        console.log("Barra de carrinho do rodapé criada com sucesso");
    }
    
    // Tentar corrigir imediatamente e depois de um pequeno atraso
    ensureCartButtonWorks();
    setTimeout(ensureCartButtonWorks, 1000);
    
    // Verificar se o botão do carrinho está funcionando após 2 segundos
    // Se não estiver, criar a versão do rodapé como último recurso
    setTimeout(() => {
        // Verificar se houve algum erro ao abrir o carrinho
        const cartBtn = document.getElementById('cart-btn');
        const fixedBtn = document.getElementById('fixed-cart-btn');
        
        if (!cartBtn && !fixedBtn) {
            console.warn("Nenhum botão de carrinho encontrado após timeout, criando versão mínima");
            createMinimalCartFooter();
        }
    }, 2000);
});
