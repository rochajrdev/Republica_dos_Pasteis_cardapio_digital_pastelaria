/**
 * mobile-scroll-fix.js
 * Script para corrigir problemas de scroll em dispositivos móveis,
 * garantindo que o conteúdo vá até o final e que o total seja sempre visível.
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 Aplicando correções para scroll em dispositivos móveis');

  // Detecta se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                  || window.innerWidth < 768;
  
  if (!isMobile) {
    console.log('📱 Não é um dispositivo móvel, correções não serão aplicadas');
    return;
  }
  
  console.log('📱 Dispositivo móvel detectado, aplicando correções');
  
  // Referência ao modal do carrinho
  const cartModal = document.getElementById('cart-modal');
  
  // Função para aplicar estilos essenciais via JavaScript
  function applyMobileStyles() {
    // Corrigir os containers scrolláveis
    const scrollContents = document.querySelectorAll('.cart-scrollable-content');
    scrollContents.forEach(content => {
      // Garante que o conteúdo possa ser rolado completamente
      content.style.paddingBottom = '60px'; // Adiciona espaço extra no final
      content.style.WebkitOverflowScrolling = 'touch'; // Para iOS
      content.style.overscrollBehavior = 'contain'; // Evita propagação do scroll
      
      // Para iOS, força hardware acceleration para melhorar o scroll
      content.style.transform = 'translateZ(0)';
    });
    
    // Garante que o total fique sempre visível
    const totalSummaries = document.querySelectorAll('.cart-total-summary');
    totalSummaries.forEach(summary => {
      // Configura o posicionamento do resumo do total
      summary.style.position = 'sticky';
      summary.style.bottom = '0';
      summary.style.marginBottom = '0';
      summary.style.zIndex = '5';
      summary.style.backgroundColor = document.body.classList.contains('dark') ? '#1f2937' : 'white';
      summary.style.boxShadow = '0 -4px 10px rgba(0,0,0,0.1)';
    });
    
    // Garante que os botões de navegação sejam sempre visíveis
    const navButtons = document.querySelectorAll('.cart-nav-buttons');
    navButtons.forEach(nav => {
      nav.style.position = 'sticky';
      nav.style.bottom = '0';
      nav.style.zIndex = '10';
      nav.style.backgroundColor = document.body.classList.contains('dark') ? '#1f2937' : 'white';
      nav.style.paddingTop = '10px';
      nav.style.paddingBottom = '10px';
      nav.style.boxShadow = '0 -4px 10px rgba(0,0,0,0.05)';
    });
  }
  
  // Observer para quando adicionar produtos
  function setupCartObserver() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    // Observador de mutações para detectar quando novos itens são adicionados
    const observer = new MutationObserver(function() {
      // Um novo item foi adicionado, scroll para o resumo do total
      setTimeout(scrollToTotal, 300);
    });
    
    observer.observe(cartItems, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // Função para rolar até o total do pedido
  function scrollToTotal() {
    // Verifica se estamos na primeira etapa do checkout
    const activeStep = document.querySelector('.checkout-step-content.active');
    if (!activeStep || activeStep.id !== 'checkout-step-1') return;
    
    const orderSummary = document.getElementById('order-summary-container');
    if (orderSummary) {
      orderSummary.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
  
  // Observer para monitorar quando o modal é aberto
  function setupModalObserver() {
    if (!cartModal) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class' && !cartModal.classList.contains('hidden')) {
          // Modal aberto
          applyMobileStyles();
          // Pequeno atraso para garantir que o DOM esteja atualizado
          setTimeout(() => {
            scrollToTotal();
          }, 100);
        }
      });
    });
    
    observer.observe(cartModal, { attributes: true });
  }
  
  // Monitora mudanças entre etapas
  function setupStepChangeMonitor() {
    const steps = document.querySelectorAll('.checkout-step');
    const nextButtons = document.querySelectorAll('[id^="step-"][id$="-next"]');
    const prevButtons = document.querySelectorAll('[id^="step-"][id$="-prev"]');
    
    // Função que será chamada quando houver mudança de etapa
    function handleStepChange() {
      setTimeout(() => {
        applyMobileStyles();
        // Scroll para o topo da nova etapa
        const activeContent = document.querySelector('.checkout-step-content.active');
        if (activeContent) {
          const scrollContent = activeContent.querySelector('.cart-scrollable-content');
          if (scrollContent) {
            scrollContent.scrollTop = 0;
          }
        }
      }, 100);
    }
    
    // Adiciona listeners para cliques nos passos e botões de navegação
    steps.forEach(step => {
      step.addEventListener('click', handleStepChange);
    });
    
    nextButtons.forEach(button => {
      button.addEventListener('click', handleStepChange);
    });
    
    prevButtons.forEach(button => {
      button.addEventListener('click', handleStepChange);
    });
  }
  
  // Aplicação inicial das correções
  applyMobileStyles();
  setupCartObserver();
  setupModalObserver();
  setupStepChangeMonitor();
  
  // Correções específicas para iOS (conhecido por problemas de scroll)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    document.querySelectorAll('.cart-scrollable-content').forEach(content => {
      content.style.WebkitOverflowScrolling = 'touch';
      
      // No iOS, precisamos garantir que o conteúdo possa ser rolado completamente
      content.style.paddingBottom = '80px'; // Mais espaço para iOS
    });
  }
  
  // Aplicar novamente as correções quando a janela for redimensionada
  window.addEventListener('resize', function() {
    if (window.innerWidth < 768) {
      applyMobileStyles();
    }
  });
  
  console.log('📱 Correções para scroll em dispositivos móveis aplicadas com sucesso');
});
