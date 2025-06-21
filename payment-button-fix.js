/**
 * payment-button-fix.js
 * Garante que o botão "Finalizar Pedido" na etapa de pagamento esteja sempre visível
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('🛠️ Aplicando ajustes para garantir visibilidade do botão de pagamento');
  
  function adjustPaymentButtonPosition() {
    // Verificar se estamos na etapa de pagamento
    const checkoutContainer = document.querySelector('.checkout-container');
    if (!checkoutContainer || !checkoutContainer.classList.contains('step-3')) {
      return;
    }
    
    // Garantir que o container do botão tenha espaço suficiente
    const navButtons = document.querySelector('.cart-nav-buttons');
    if (navButtons) {
      navButtons.style.paddingBottom = '1rem';
      navButtons.style.marginTop = '0.5rem';
      
      // Adicionar espaço inferior ao conteúdo para evitar sobreposição
      const content = document.querySelector('.checkout-step-content.active');
      if (content) {
        content.style.paddingBottom = '4rem';
      }
      
      // Garantir que o botão seja visível
      const finishButton = document.querySelector('#finish-order-btn');
      if (finishButton) {
        finishButton.style.position = 'sticky';
        finishButton.style.bottom = '0.5rem';
        finishButton.style.zIndex = '10';
        finishButton.style.marginTop = '0.5rem';
      }
    }
  }
  
  // Observar mudanças nas classes do container de checkout
  const checkoutObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        adjustPaymentButtonPosition();
      }
    });
  });
  
  // Configurar observador para o container de checkout
  const checkoutContainer = document.querySelector('.checkout-container');
  if (checkoutContainer) {
    checkoutObserver.observe(checkoutContainer, { attributes: true });
  }
  
  // Também ajustar quando a etapa de pagamento for exibida manualmente
  document.addEventListener('checkout:stepChanged', function(event) {
    if (event.detail && event.detail.step === 3) {
      // Aguardar um pouco para garantir que o DOM foi atualizado
      setTimeout(adjustPaymentButtonPosition, 100);
    }
  });
  
  // Executar ajustes iniciais
  adjustPaymentButtonPosition();
  
  console.log('🛠️ Ajustes para botão de pagamento aplicados com sucesso');
});
