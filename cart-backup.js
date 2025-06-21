/**
 * cart-backup.js
 * Sistema de backup para o carrinho caso ocorra algum problema
 * Este script é carregado após o cart-system.js e atua apenas se houver problemas
 */

// Verificar se o sistema principal está funcionando
console.log('🛠️ Cart-backup: Verificando se sistema principal está operacional');

// Função para executar após o carregamento completo
window.addEventListener('load', function() {
  // Permitir que o sistema principal inicialize primeiro
  setTimeout(() => {
    console.log('🛠️ Cart-backup: Verificando integridade do sistema principal');
    
    // Verificar se o sistema principal inicializou corretamente
    if (typeof CartState === 'undefined' || typeof CartUI === 'undefined') {
      console.error('🛠️ Cart-backup: Sistema principal não inicializado');
      inicializarBackup();
      return;
    }
      // Verificar se o botão fixo do carrinho existe
    const fixedCartBtn = document.getElementById('fixed-cart-btn');
    
    if (!fixedCartBtn) {
      console.error('🛠️ Cart-backup: Botão fixo do carrinho não encontrado');
      criarBotaoEmergencia();
    }
    
    // Realizar um último teste e garantir a funcionalidade
    try {
      if (typeof CartState.getItemCount !== 'function') {
        throw new Error('CartState incompleto');
      }
      
      if (typeof CartUI.openCart !== 'function') {
        throw new Error('CartUI incompleto');
      }
      
      console.log('🛠️ Cart-backup: Sistema principal está operacional, backup não necessário');
    } catch (error) {
      console.error('🛠️ Cart-backup: Sistema principal com erro', error);
      inicializarBackup();
    }
  }, 2000);
});

// Função para inicializar o backup mínimo
function inicializarBackup() {
  console.log('🛠️ Cart-backup: Inicializando sistema de backup');
  
  // Carregar dados do localStorage (em qualquer formato disponível)
  let cartItems = [];
  try {
    // Tentar formato moderno primeiro
    const saved = JSON.parse(localStorage.getItem('cartState'));
    if (saved && Array.isArray(saved.items)) {
      cartItems = saved.items;
    } else {
      // Tentar formato legado
      const legacy = JSON.parse(localStorage.getItem('cart'));
      if (legacy && Array.isArray(legacy)) {
        cartItems = legacy;
      }
    }
  } catch (error) {
    console.error('🛠️ Cart-backup: Erro ao carregar dados', error);
  }
  
  // Criar botão de emergência
  criarBotaoEmergencia();
  
  // Definir função global mínima
  window.openCart = window.abrirCarrinho = function() {
    mostrarCarrinhoSimples(cartItems);
  };
}

// Função para criar botão de emergência
function criarBotaoEmergencia() {
  // Evitar duplicação
  if (document.getElementById('emergency-cart-button')) return;
  
  console.log('🛠️ Cart-backup: Criando botão de emergência');
  
  const btn = document.createElement('button');
  btn.id = 'emergency-cart-button';
  btn.className = 'fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg z-50';
  btn.innerHTML = '<i class="fa fa-shopping-cart"></i> <span class="text-xs">Carrinho</span>';
  btn.setAttribute('aria-label', 'Abrir carrinho de compras (modo emergência)');
  
  btn.onclick = function() {
    window.openCart();
  };
  
  document.body.appendChild(btn);
}

// Função para mostrar um carrinho simplificado
function mostrarCarrinhoSimples(items) {
  console.log('🛠️ Cart-backup: Mostrando carrinho simplificado', items);
  
  // Remover qualquer instância anterior
  const existente = document.getElementById('simple-cart-modal');
  if (existente) existente.remove();
  
  // Criar modal simples
  const modal = document.createElement('div');
  modal.id = 'simple-cart-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
  modal.style.backdropFilter = 'blur(4px)';
  
  // Calcular total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Gerar HTML para itens
  let itemsHTML = '';
  if (items.length === 0) {
    itemsHTML = '<div class="text-center py-4">Seu carrinho está vazio</div>';
  } else {
    items.forEach(item => {
      itemsHTML += `
        <div class="flex justify-between items-center mb-3 pb-2 border-b dark:border-gray-700">
          <div>
            <div class="font-medium">${item.name}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              R$ ${Number(item.price).toFixed(2)} x ${item.quantity}
            </div>
          </div>
          <div class="font-medium">
            R$ ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      `;
    });
  }
  
  // Conteúdo do modal
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 m-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
        <h2 class="text-xl font-bold flex items-center">
          <i class="fas fa-shopping-cart text-orange-500 mr-2"></i>
          <span>Seu Carrinho (modo emergência)</span>
        </h2>
        <button id="simple-cart-close" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="simple-cart-items mb-4">
        ${itemsHTML}
      </div>
      
      <div class="mt-4 pt-4 border-t dark:border-gray-700">
        <div class="flex justify-between items-center font-bold">
          <span>Total:</span>
          <span>R$ ${total.toFixed(2)}</span>
        </div>
        
        <div class="mt-6">
          <button id="simple-cart-whatsapp" class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2">
            <i class="fab fa-whatsapp text-xl"></i>
            Pedir pelo WhatsApp
          </button>
        </div>
        
        <div class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Modo de emergência ativado devido a um problema técnico.<br>
          Por favor, recarregue a página e tente novamente.
        </div>
      </div>
    </div>
  `;
  
  // Adicionar ao documento
  document.body.appendChild(modal);
  
  // Prevenir scroll do body
  document.body.style.overflow = 'hidden';
  
  // Evento para fechar
  document.getElementById('simple-cart-close').addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });
  
  // Evento para fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  });
  
  // Evento para WhatsApp
  document.getElementById('simple-cart-whatsapp').addEventListener('click', () => {
    enviarPedidoWhatsApp(items);
  });
}

// Função para enviar pedido via WhatsApp
function enviarPedidoWhatsApp(items) {
  try {
    const telefone = "5579981575934"; // Número da República dos Pastéis
    
    let mensagem = "🛒 *Meu Pedido na República dos Pastéis*\n\n";
    
    // Adicionar itens
    items.forEach(item => {
      mensagem += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    // Adicionar total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    mensagem += `\n*Total: R$ ${total.toFixed(2)}*\n\n`;
    
    // Adicionar mensagem de emergência
    mensagem += "Enviado pelo modo de emergência do site.";
    
    // Codificar a mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem);
    
    // Criar URL do WhatsApp
    const url = `https://wa.me/${telefone}?text=${mensagemCodificada}`;
    
    // Abrir em nova aba
    window.open(url, '_blank');
  } catch (error) {
    console.error('🛠️ Cart-backup: Erro ao enviar para WhatsApp', error);
    alert('Erro ao abrir WhatsApp. Por favor, tente novamente.');
  }
}
