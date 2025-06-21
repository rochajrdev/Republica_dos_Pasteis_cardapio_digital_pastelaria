/**
 * cart-system.js
 * Sistema modular de carrinho de compras para República dos Pastéis
 * Implementação completamente nova e estável para substituir os scripts legados
 * 
 * Versão: 2.0.0
 * Última atualização: 20/06/2025
 * Características:
 * - Arquitetura modular com separação clara de responsabilidades
 * - Sistema de estado centralizado com persistência
 * - Interface robusta à prova de falhas
 * - Checkout em etapas com validação
 * - Suporte completo a acessibilidade
 */

// Estado centralizado do carrinho
const CartState = {
  items: [],
  total: 0,
  currentStep: 1,
  deliveryMethod: 'delivery', // 'delivery' ou 'pickup'
  address: '',
  paymentMethod: '',
  
  /**
   * Inicializa o estado do carrinho
   */
  init() {
    console.log('🛒 CartState: Inicializando estado do carrinho');
    this.loadState();
    this.updateTotal();
  },
  
  /**
   * Adiciona um item ao carrinho
   * @param {Object} item - Item a ser adicionado
   */
  addItem(item) {
    console.log('🛒 CartState: Adicionando item ao carrinho', item);
    
    try {
      // Verificar se o item já existe no carrinho
      const existingItemIndex = this.items.findIndex(
        cartItem => cartItem.id === item.id
      );
      
      if (existingItemIndex !== -1) {
        // Se já existe, incrementa a quantidade
        this.items[existingItemIndex].quantity += item.quantity;
      } else {
        // Se não existe, adiciona ao carrinho
        this.items.push({...item});
      }
      
      this.updateTotal();
      this.saveState();
      
      return true;
    } catch (error) {
      console.error('🛒 CartState: Erro ao adicionar item', error);
      return false;
    }
  },
  
  /**
   * Remove um item do carrinho
   * @param {string|number} itemId - ID do item a ser removido
   */
  removeItem(itemId) {
    console.log('🛒 CartState: Removendo item do carrinho', itemId);
    
    try {
      this.items = this.items.filter(item => item.id !== itemId);
      this.updateTotal();
      this.saveState();
      
      return true;
    } catch (error) {
      console.error('🛒 CartState: Erro ao remover item', error);
      return false;
    }
  },
  
  /**
   * Atualiza a quantidade de um item
   * @param {string|number} itemId - ID do item
   * @param {number} quantity - Nova quantidade
   */
  updateQuantity(itemId, quantity) {
    console.log('🛒 CartState: Atualizando quantidade', itemId, quantity);
    
    try {
      const item = this.items.find(item => item.id === itemId);
      
      if (item) {
        item.quantity = Math.max(1, Math.min(10, quantity)); // Limita entre 1 e 10
        this.updateTotal();
        this.saveState();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('🛒 CartState: Erro ao atualizar quantidade', error);
      return false;
    }
  },
  
  /**
   * Limpa todos os itens do carrinho
   */
  clearCart() {
    console.log('🛒 CartState: Limpando carrinho');
    
    try {
      this.items = [];
      this.updateTotal();
      this.saveState();
      
      return true;
    } catch (error) {
      console.error('🛒 CartState: Erro ao limpar carrinho', error);
      return false;
    }
  },
  
  /**
   * Atualiza o valor total do carrinho
   */
  updateTotal() {
    try {
      this.total = this.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      return this.total;
    } catch (error) {
      console.error('🛒 CartState: Erro ao calcular total', error);
      this.total = 0;
      return 0;
    }
  },
  
  /**
   * Avança para a próxima etapa do checkout
   */
  nextStep() {
    // Validação específica por etapa
    if (this.currentStep === 1) {
      // Verificar se há itens no carrinho
      if (this.items.length === 0) {
        console.warn('🛒 CartState: Tentou avançar com carrinho vazio');
        return false;
      }
    } 
    
    else if (this.currentStep === 3 && this.deliveryMethod === 'delivery') {
      // Validar endereço apenas se for entrega
      if (!this.address || this.address.trim() === '') {
        console.warn('🛒 CartState: Tentou avançar sem endereço');
        return false;
      }
    }
    
    // Determinar próxima etapa
    let nextStep = this.currentStep + 1;
    
    // Pular etapa de endereço se for retirada
    if (nextStep === 3 && this.deliveryMethod === 'pickup') {
      nextStep = 4;
    }
    
    // Verificar se é uma etapa válida
    if (nextStep > 4) {
      console.warn('🛒 CartState: Tentou avançar além da última etapa');
      return false;
    }
    
    this.currentStep = nextStep;
    this.saveState();
    
    console.log(`🛒 CartState: Avançou para etapa ${this.currentStep}`);
    return true;
  },
  
  /**
   * Retorna para a etapa anterior do checkout
   */
  prevStep() {
    // Determinar etapa anterior
    let prevStep = this.currentStep - 1;
    
    // Pular etapa de endereço se for retirada
    if (prevStep === 3 && this.deliveryMethod === 'pickup') {
      prevStep = 2;
    }
    
    // Verificar se é uma etapa válida
    if (prevStep < 1) {
      console.warn('🛒 CartState: Tentou voltar antes da primeira etapa');
      return false;
    }
    
    this.currentStep = prevStep;
    this.saveState();
    
    console.log(`🛒 CartState: Voltou para etapa ${this.currentStep}`);
    return true;
  },
  
  /**
   * Define o método de entrega
   * @param {string} method - 'delivery' ou 'pickup'
   */
  setDeliveryMethod(method) {
    if (method === 'delivery' || method === 'pickup') {
      this.deliveryMethod = method;
      
      // Se for retirada, limpa o endereço
      if (method === 'pickup') {
        this.address = 'Retirada na loja';
      }
      
      this.saveState();
      return true;
    }
    
    return false;
  },
  
  /**
   * Define o endereço de entrega
   * @param {string} address - Endereço completo
   */
  setAddress(address) {
    this.address = address;
    this.saveState();
  },
  
  /**
   * Define o método de pagamento
   * @param {string} method - Método de pagamento
   */
  setPaymentMethod(method) {
    this.paymentMethod = method;
    this.saveState();
  },
  
  /**
   * Salva o estado atual no localStorage
   */
  saveState() {
    try {
      localStorage.setItem('cartState', JSON.stringify({
        items: this.items,
        total: this.total,
        currentStep: this.currentStep,
        deliveryMethod: this.deliveryMethod,
        address: this.address,
        paymentMethod: this.paymentMethod
      }));
      
      console.log('🛒 CartState: Estado salvo no localStorage');
    } catch (error) {
      console.error('🛒 CartState: Erro ao salvar estado', error);
    }
  },
    /**
   * Carrega o estado do localStorage com recuperação de erros
   */
  loadState() {
    try {
      // Tentar carregar do novo formato primeiro
      let saved = null;
      
      try {
        saved = JSON.parse(localStorage.getItem('cartState'));
      } catch (parseError) {
        console.error('🛒 CartState: Erro ao parsear cartState', parseError);
      }
      
      // Se não encontrou, tentar formato legado
      if (!saved) {
        try {
          console.log('🛒 CartState: Tentando carregar do formato legado');
          const legacyCart = JSON.parse(localStorage.getItem('cart'));
          
          if (legacyCart && Array.isArray(legacyCart)) {
            // Converter formato antigo para novo
            saved = {
              items: legacyCart.map(item => ({
                id: `item-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                image: item.image
              })),
              total: legacyCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              currentStep: 1,
              deliveryMethod: 'delivery',
              address: '',
              paymentMethod: ''
            };
            
            console.log('🛒 CartState: Carrinho legado convertido', saved);
            
            // Salvar no novo formato
            this.saveState();
          }
        } catch (legacyError) {
          console.error('🛒 CartState: Erro ao carregar formato legado', legacyError);
        }
      }
      
      if (saved) {
        // Validar e carregar dados
        this.items = Array.isArray(saved.items) ? saved.items.filter(item => 
          item && typeof item === 'object' && item.name && !isNaN(Number(item.price))
        ) : [];
        
        this.total = Number(saved.total) || this.updateTotal();
        this.currentStep = Number(saved.currentStep) || 1;
        this.deliveryMethod = saved.deliveryMethod || 'delivery';
        this.address = saved.address || '';
        this.paymentMethod = saved.paymentMethod || '';
        
        console.log('🛒 CartState: Estado carregado com sucesso', this);
      } else {
        console.log('🛒 CartState: Nenhum estado salvo encontrado');
      }
    } catch (error) {
      console.error('🛒 CartState: Erro crítico ao carregar estado', error);
      
      // Resetar estado e limpar localStorage em caso de erro crítico
      this.items = [];
      this.total = 0;
      this.currentStep = 1;
      this.deliveryMethod = 'delivery';
      this.address = '';
      this.paymentMethod = '';
      
      try {
        localStorage.removeItem('cartState');
        localStorage.removeItem('cart'); // Remover também formato legado
      } catch (e) {
        console.error('🛒 CartState: Não foi possível limpar localStorage', e);
      }
    }
  },
  
  /**
   * Reinicia o estado do carrinho após finalização do pedido
   */
  resetAfterOrder() {
    this.items = [];
    this.total = 0;
    this.currentStep = 1;
    // Mantém as preferências de entrega do cliente
    this.saveState();
  },
  
  /**
   * Retorna o número de itens no carrinho
   */
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
};

// Interface do usuário do carrinho
const CartUI = {
  // Elementos do DOM
  elements: {
    modal: null,
    cartBtn: null,
    cartCounter: null,
    cartItemsContainer: null,
    orderSummaryContainer: null,
    fixedCartBtn: null,
    stepIndicators: null,
    stepContents: null
  },
    /**
   * Inicializa a interface do carrinho
   */
  init() {
    console.log('🛒 CartUI: Inicializando interface do carrinho');
    
    try {
      // Primeiro carregamento dos elementos principais
      this.loadElements();
      
      // Se alguns elementos estiverem faltando, tentar novamente após um breve delay
      if (!this.elements.modal || !this.elements.cartBtn) {
        console.warn('🛒 CartUI: Alguns elementos não foram encontrados, tentando novamente...');
        
        setTimeout(() => {
          this.loadElements();
          this.setupEventListeners();
          this.createGuaranteedButton();
          this.setupKeyboardShortcuts();
          this.updateCartCounter();
          this.applyModernLayout(); // Aplicar o layout moderno
        }, 500);
      } else {
        this.setupEventListeners();
        this.createGuaranteedButton();
        this.setupKeyboardShortcuts();
        this.updateCartCounter();
        this.applyModernLayout(); // Aplicar o layout moderno
      }
      
      console.log('🛒 CartUI: Interface inicializada com sucesso');
    } catch (error) {
      console.error('🛒 CartUI: Erro ao inicializar interface', error);
      
      // Mesmo com erro, tentar criar botão garantido
      setTimeout(() => {
        this.createGuaranteedButton();
      }, 1000);
    }
  },
    /**
   * Carrega os elementos do DOM
   */
  loadElements() {
    this.elements.modal = document.getElementById('cart-modal');
    // Não busca mais o botão superior do carrinho (removido)
    this.elements.fixedCartBtn = document.getElementById('fixed-cart-btn');
    this.elements.cartCounter = document.getElementById('fixed-cart-count');
    this.elements.cartItemsContainer = document.getElementById('cart-items');
    this.elements.orderSummaryContainer = document.getElementById('order-summary-container');
    this.elements.closeModalBtn = document.getElementById('close-modal-btn');
    
    // Elementos das etapas do checkout
    this.elements.stepIndicators = document.querySelectorAll('.checkout-step');
    this.elements.stepContents = document.querySelectorAll('.checkout-step-content');
    
    console.log('🛒 CartUI: Elementos carregados', this.elements);
  },
    /**
   * Configura os ouvintes de eventos
   */
  setupEventListeners() {
    try {
      console.log('🛒 CartUI: Configurando ouvintes de eventos');
      
      // Garantir que o botão fixo do carrinho exista
      if (!document.getElementById('fixed-cart-btn')) {
        this.createGuaranteedButton();
      }
      
      // Evento para o botão fixo do carrinho (já configurado no createGuaranteedButton)
      this.elements.fixedCartBtn = document.getElementById('fixed-cart-btn');
      
      // Evento para fechar o modal
      if (this.elements.closeModalBtn) {
        this.elements.closeModalBtn.addEventListener('click', () => {
          this.closeCart();
        });
      }
      
      // Fechar ao clicar fora do modal
      if (this.elements.modal) {
        this.elements.modal.addEventListener('click', (e) => {
          if (e.target === this.elements.modal) {
            this.closeCart();
          }
        });
      }
      
      // Configurar eventos para os botões de navegação entre etapas
      this.setupCheckoutNavigation();
      
      // Configurar eventos para opções de entrega
      this.setupDeliveryOptions();
      
      // Configurar eventos para o botão de finalizar pedido
      this.setupCheckoutButton();
      
      console.log('🛒 CartUI: Todos os eventos configurados com sucesso');
    } catch (error) {
      console.error('🛒 CartUI: Erro ao configurar eventos', error);
    }
  },
  
  /**
   * Configura a navegação entre as etapas do checkout
   */
  setupCheckoutNavigation() {
    // Botões de avançar
    document.querySelectorAll('[id^="step-"][id$="-next"]').forEach(button => {
      button.addEventListener('click', () => {
        const currentStep = CartState.currentStep;
        
        if (currentStep === 3 && CartState.deliveryMethod === 'delivery') {
          // Validar endereço se for entrega
          const addressInput = document.getElementById('address');
          const addressWarn = document.getElementById('address-warn');
          
          if (addressInput && addressInput.value.trim() === '') {
            if (addressWarn) addressWarn.classList.remove('hidden');
            addressInput.classList.add('border-red-500');
            addressInput.focus();
            return;
          } else if (addressInput) {
            CartState.setAddress(addressInput.value.trim());
            if (addressWarn) addressWarn.classList.add('hidden');
            addressInput.classList.remove('border-red-500');
          }
        }
        
        // Avançar para próxima etapa
        if (CartState.nextStep()) {
          this.goToStep(CartState.currentStep);
        }
      });
    });
    
    // Botões de voltar
    document.querySelectorAll('[id^="step-"][id$="-prev"]').forEach(button => {
      button.addEventListener('click', () => {
        if (CartState.prevStep()) {
          this.goToStep(CartState.currentStep);
        }
      });
    });
  },
  
  /**
   * Configura as opções de entrega
   */
  setupDeliveryOptions() {
    const deliveryOptions = document.querySelectorAll('input[name="delivery-option"]');
    
    deliveryOptions.forEach(option => {
      option.addEventListener('change', function() {
        CartState.setDeliveryMethod(this.value);
        console.log('🛒 CartUI: Método de entrega alterado para', this.value);
        
        // Atualizar campos e validações
        const addressInput = document.getElementById('address');
        if (addressInput) {
          addressInput.required = CartState.deliveryMethod === 'delivery';
          if (CartState.deliveryMethod === 'pickup') {
            addressInput.value = 'Retirada na loja';
            addressInput.disabled = true;
          } else {
            addressInput.value = CartState.address !== 'Retirada na loja' ? CartState.address : '';
            addressInput.disabled = false;
          }
        }
      });
    });
  },
  
  /**
   * Configura o botão de finalizar pedido
   */
  setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        // Validar método de pagamento
        const paymentMethod = document.getElementById('payment-method');
        const paymentWarn = document.getElementById('payment-warn');
        
        if (paymentMethod && paymentMethod.value === '') {
          if (paymentWarn) paymentWarn.classList.remove('hidden');
          paymentMethod.classList.add('border-red-500');
          paymentMethod.focus();
          return;
        } else if (paymentMethod) {
          CartState.setPaymentMethod(paymentMethod.value);
          if (paymentWarn) paymentWarn.classList.add('hidden');
          paymentMethod.classList.remove('border-red-500');
        }
        
        // Processar pedido
        this.processOrder();
      });
    }
  },
  
  /**
   * Processa o pedido final
   */
  processOrder() {
    try {
      // Aqui seria a integração com um backend para processar o pedido
      console.log('🛒 CartUI: Processando pedido', {
        items: CartState.items,
        total: CartState.total,
        deliveryMethod: CartState.deliveryMethod,
        address: CartState.address,
        paymentMethod: CartState.paymentMethod
      });
      
      // Exibir mensagem de sucesso
      Toastify({
        text: "Pedido realizado com sucesso! Em breve você receberá uma confirmação.",
        duration: 5000,
        gravity: "top",
        position: "center",
        style: {
          background: "#22c55e",
        }
      }).showToast();
      
      // Limpar o carrinho após 1.5s (para dar tempo do usuário ver a mensagem)
      setTimeout(() => {
        CartState.resetAfterOrder();
        this.updateCartCounter();
        this.closeCart();
        
        // Anunciar para leitores de tela
        this.announceMessage('Pedido finalizado com sucesso');
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('🛒 CartUI: Erro ao processar pedido', error);
      
      Toastify({
        text: "Erro ao finalizar pedido. Por favor, tente novamente.",
        duration: 5000,
        gravity: "top",
        position: "center",
        style: {
          background: "#ef4444",
        }
      }).showToast();
      
      return false;
    }
  },
  
  /**
   * Cria um botão fixo garantido para o carrinho
   */
  createGuaranteedButton() {
    // Verificar se já existe um botão fixo
    if (document.getElementById('fixed-cart-btn')) {
      console.log('🛒 CartUI: Botão fixo já existe');
      return;
    }
    
    try {
      console.log('🛒 CartUI: Criando botão garantido');
      
      // Criar o elemento do botão
      const fixedButton = document.createElement('button');
      fixedButton.id = 'fixed-cart-btn';
      fixedButton.className = 'fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-full p-4 shadow-xl z-50 flex items-center justify-center transition-all';
      fixedButton.setAttribute('aria-label', 'Abrir carrinho de compras');
      
      // Adicionar conteúdo HTML
      fixedButton.innerHTML = `
        <i class="fa fa-shopping-cart text-xl"></i>
        <span id="fixed-cart-count" class="absolute -top-1 -right-1 bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
          ${CartState.getItemCount()}
        </span>
      `;
      
      // Adicionar evento de clique
      fixedButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openCart();
      });
      
      // Adicionar ao corpo do documento
      document.body.appendChild(fixedButton);
      
      // Animar o botão para chamar a atenção
      fixedButton.classList.add('animate-bounce');
      setTimeout(() => {
        fixedButton.classList.remove('animate-bounce');
      }, 3000);
      
      // Salvar referência
      this.elements.fixedCartBtn = fixedButton;
      
      // Adicionar estilo para animação (se necessário)
      if (!document.getElementById('fixed-cart-btn-style')) {
        const style = document.createElement('style');
        style.id = 'fixed-cart-btn-style';
        style.textContent = `
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce {
            animation: bounce 1s ease infinite;
          }
          #fixed-cart-btn:hover {
            transform: scale(1.1);
          }
          #fixed-cart-btn:active {
            transform: scale(0.9);
          }
        `;
        document.head.appendChild(style);
      }
      
      console.log('🛒 CartUI: Botão garantido criado com sucesso');
    } catch (error) {
      console.error('🛒 CartUI: Erro ao criar botão garantido', error);
    }
  },
  
  /**
   * Configura atalhos de teclado
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt+C para abrir carrinho
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        this.openCart();
      }
      
      // ESC para fechar carrinho
      if (e.key === 'Escape' && this.isCartOpen()) {
        e.preventDefault();
        this.closeCart();
      }
    });
    
    console.log('🛒 CartUI: Atalhos de teclado configurados');
  },
  
  /**
   * Verifica se o carrinho está aberto
   */
  isCartOpen() {
    if (!this.elements.modal) return false;
    
    return this.elements.modal.style.display === 'flex' || 
           this.elements.modal.classList.contains('flex');
  },
    /**
   * Abre o modal do carrinho
   */
  openCart() {
    try {
      console.log('🛒 CartUI: Abrindo carrinho');
      
      // Verificar/atualizar referência do modal
      if (!this.elements.modal) {
        this.elements.modal = document.getElementById('cart-modal');
        
        if (!this.elements.modal) {
          throw new Error('Modal do carrinho não encontrado');
        }
      }
      
      // Atualizar interface do carrinho
      this.updateCartItems();
      
      // Verificar se estamos usando o novo layout com scrollable content
      const stepContent = document.querySelector('.checkout-step-content.active');
      if (stepContent && !stepContent.querySelector('.cart-scrollable-content')) {
        console.log('🛒 CartUI: Aplicando layout moderno ao modal');
        this.applyModernLayout();
      }
      
      // Mostrar o modal
      this.elements.modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevenir scroll
      
      // Ir para a primeira etapa
      CartState.currentStep = 1;
      this.goToStep(1);
      
      // Marcar o botão como expandido (para acessibilidade)
      if (this.elements.cartBtn) {
        this.elements.cartBtn.setAttribute('aria-expanded', 'true');
      }
      
      // Animar entrada
      const modalContent = this.elements.modal.querySelector('.bg-white, .dark\\:bg-gray-800');
      if (modalContent) {
        modalContent.classList.add('animate-slide-up');
      }
      
      // Focar no botão de fechar para acessibilidade
      if (this.elements.closeModalBtn) {
        setTimeout(() => this.elements.closeModalBtn.focus(), 100);
      }
      
      // Anunciar para leitores de tela
      this.announceMessage('Carrinho de compras aberto');
      
      return true;
    } catch (error) {
      console.error('🛒 CartUI: Erro ao abrir carrinho', error);
      
      // Tenta criar um modal alternativo simples
      this.createFallbackModal();
      
      return false;
    }
  },
  
  /**
   * Fecha o modal do carrinho
   */
  closeCart() {
    try {
      console.log('🛒 CartUI: Fechando carrinho');
      
      // Verificar referência do modal
      if (!this.elements.modal) return;
      
      // Animar saída
      const modalContent = this.elements.modal.querySelector('.bg-white, .dark\\:bg-gray-800');
      if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          this.elements.modal.style.display = 'none';
          document.body.style.overflow = '';
          
          modalContent.style.opacity = '';
          modalContent.style.transform = '';
        }, 200);
      } else {
        this.elements.modal.style.display = 'none';
        document.body.style.overflow = '';
      }
      
      // Atualizar atributos de acessibilidade
      if (this.elements.cartBtn) {
        this.elements.cartBtn.setAttribute('aria-expanded', 'false');
        this.elements.cartBtn.focus();
      }
      
      // Anunciar para leitores de tela
      this.announceMessage('Carrinho de compras fechado');
    } catch (error) {
      console.error('🛒 CartUI: Erro ao fechar carrinho', error);
      
      // Fallback
      if (this.elements.modal) {
        this.elements.modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }
  },
  
  /**
   * Navega para uma etapa específica do checkout
   * @param {number} step - Número da etapa
   */
  goToStep(step) {
    try {
      console.log(`🛒 CartUI: Navegando para etapa ${step}`);
      
      // Validar etapa
      if (step < 1 || step > 4) {
        console.warn(`🛒 CartUI: Etapa inválida: ${step}`);
        return false;
      }
      
      // Atualizar indicadores de etapa
      this.elements.stepIndicators?.forEach(indicator => {
        const stepNum = parseInt(indicator.dataset.step);
        indicator.classList.remove('active', 'completed');
        
        if (stepNum === step) {
          indicator.classList.add('active');
        } else if (stepNum < step) {
          indicator.classList.add('completed');
        }
      });
      
      // Atualizar conteúdo das etapas
      this.elements.stepContents?.forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
      });
      
      // Ativar o conteúdo da etapa atual
      const currentContent = document.getElementById(`checkout-step-${step}`);
      if (currentContent) {
        currentContent.classList.remove('hidden');
        currentContent.classList.add('active');
      }
      
      // Lógica específica por etapa
      this.handleStepSpecificLogic(step);
      
      // Anunciar para leitores de tela
      this.announceMessage(`Etapa ${step} de 4: ${this.getStepName(step)}`);
      
      return true;
    } catch (error) {
      console.error('🛒 CartUI: Erro ao navegar para etapa', error);
      return false;
    }
  },
  
  /**
   * Lida com lógica específica de cada etapa
   * @param {number} step - Número da etapa
   */
  handleStepSpecificLogic(step) {
    switch (step) {
      case 1: // Resumo do pedido
        this.updateCartItems();
        break;
        
      case 2: // Método de recebimento
        // Marcar a opção correta
        const deliveryRadios = document.querySelectorAll('input[name="delivery-option"]');
        deliveryRadios.forEach(radio => {
          radio.checked = (radio.value === CartState.deliveryMethod);
        });
        break;
        
      case 3: // Endereço de entrega
        // Se for retirada, pular para etapa 4
        if (CartState.deliveryMethod === 'pickup') {
          CartState.currentStep = 4;
          this.goToStep(4);
          return;
        }
        
        // Preencher endereço salvo
        const addressInput = document.getElementById('address');
        if (addressInput && CartState.address && CartState.address !== 'Retirada na loja') {
          addressInput.value = CartState.address;
        }
        break;
        
      case 4: // Forma de pagamento
        // Preencher resumo final do pedido
        this.updateFinalSummary();
        
        // Preencher método de pagamento salvo
        const paymentMethod = document.getElementById('payment-method');
        if (paymentMethod && CartState.paymentMethod) {
          paymentMethod.value = CartState.paymentMethod;
        }
        break;
    }
  },
  
  /**
   * Retorna o nome da etapa
   * @param {number} step - Número da etapa
   */
  getStepName(step) {
    switch (step) {
      case 1: return 'Resumo do Pedido';
      case 2: return 'Método de Recebimento';
      case 3: return 'Endereço de Entrega';
      case 4: return 'Forma de Pagamento';
      default: return 'Etapa Desconhecida';
    }
  },
  
  /**
   * Atualiza os itens no carrinho
   */
  updateCartItems() {
    try {
      console.log('🛒 CartUI: Atualizando itens do carrinho');
      
      // Verificar se o container existe
      if (!this.elements.cartItemsContainer) {
        this.elements.cartItemsContainer = document.getElementById('cart-items');
        
        if (!this.elements.cartItemsContainer) {
          console.error('Container de itens não encontrado');
          return;
        }
      }
      
      // Limpar o container
      this.elements.cartItemsContainer.innerHTML = '';
      
      // Se o carrinho estiver vazio, mostrar mensagem
      if (CartState.items.length === 0) {
        this.elements.cartItemsContainer.innerHTML = `
          <div class="text-center py-6">
            <i class="fas fa-shopping-cart text-gray-300 text-5xl mb-3"></i>
            <p class="text-gray-500">Seu carrinho está vazio</p>
          </div>
        `;
        
        // Desabilitar botão de checkout se existir
        const checkoutBtn = document.getElementById('step-1-next');
        if (checkoutBtn) checkoutBtn.disabled = true;
        
        this.updateCartCounter();
        this.generateOrderSummary();
        return;
      }
      
      // Habilitar botão de checkout se existir
      const checkoutBtn = document.getElementById('step-1-next');
      if (checkoutBtn) checkoutBtn.disabled = false;
      
      // Adicionar botão "Limpar carrinho"
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
      
      this.elements.cartItemsContainer.appendChild(clearCartContainer);
      
      // Evento para limpar carrinho
      document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
        if (confirm('Deseja realmente limpar o carrinho?')) {
          CartState.clearCart();
          this.updateCartItems();
          this.updateCartCounter();
          this.announceMessage('Carrinho esvaziado');
        }
      });
      
      // Adicionar cada item ao carrinho
      CartState.items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex items-center justify-between mb-4 pb-2 border-b dark:border-gray-700';
        
        // Verificar se tem imagem
        const imageHTML = item.image ? `
          <div class="w-20 h-20 mr-3 rounded-lg overflow-hidden">
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              class="w-full h-full object-cover"
              loading="lazy"
              onerror="this.onerror=null;this.src='./assets/bg.png';"
            >
          </div>
        ` : '';
        
        // HTML do item
        itemElement.innerHTML = `
          <div class="flex items-center">
            ${imageHTML}
            <div>
              <h4 class="font-medium">${item.name}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">R$ ${item.price.toFixed(2)}</p>
              <div class="flex items-center mt-1">
                <button 
                  class="cart-quantity-btn px-2 bg-gray-200 dark:bg-gray-700 rounded-l"
                  data-action="decrease"
                  data-item-id="${item.id}"
                  aria-label="Diminuir quantidade"
                >
                  <i class="fas fa-minus text-xs"></i>
                </button>
                <span class="quantity-display px-3 bg-gray-100 dark:bg-gray-800">${item.quantity}</span>
                <button 
                  class="cart-quantity-btn px-2 bg-gray-200 dark:bg-gray-700 rounded-r"
                  data-action="increase"
                  data-item-id="${item.id}"
                  aria-label="Aumentar quantidade"
                >
                  <i class="fas fa-plus text-xs"></i>
                </button>
              </div>
            </div>
          </div>
          <div>
            <p class="text-right mb-2">R$ ${(item.price * item.quantity).toFixed(2)}</p>
            <button 
              class="remove-item-btn text-sm text-red-500 hover:text-red-700"
              data-item-id="${item.id}"
              aria-label="Remover ${item.name} do carrinho"
            >
              <i class="fas fa-trash-alt mr-1"></i> Remover
            </button>
          </div>
        `;
        
        // Adicionar ao container
        this.elements.cartItemsContainer.appendChild(itemElement);
        
        // Eventos para os botões de quantidade
        const decreaseBtn = itemElement.querySelector('[data-action="decrease"]');
        const increaseBtn = itemElement.querySelector('[data-action="increase"]');
        const quantityDisplay = itemElement.querySelector('.quantity-display');
        
        decreaseBtn?.addEventListener('click', () => {
          const itemId = decreaseBtn.dataset.itemId;
          const item = CartState.items.find(i => i.id === itemId);
          
          if (item && item.quantity > 1) {
            CartState.updateQuantity(itemId, item.quantity - 1);
            quantityDisplay.innerText = item.quantity;
            this.updateCartItems();
            this.updateCartCounter();
          }
        });
        
        increaseBtn?.addEventListener('click', () => {
          const itemId = increaseBtn.dataset.itemId;
          const item = CartState.items.find(i => i.id === itemId);
          
          if (item && item.quantity < 10) {
            CartState.updateQuantity(itemId, item.quantity + 1);
            quantityDisplay.innerText = item.quantity;
            this.updateCartItems();
            this.updateCartCounter();
          }
        });
        
        // Evento para remover item
        const removeBtn = itemElement.querySelector('.remove-item-btn');
        removeBtn?.addEventListener('click', () => {
          const itemId = removeBtn.dataset.itemId;
          const item = CartState.items.find(i => i.id === itemId);
          
          if (item) {
            CartState.removeItem(itemId);
            this.updateCartItems();
            this.updateCartCounter();
            this.announceMessage(`${item.name} removido do carrinho`);
          }
        });
      });
      
      // Atualizar resumo do pedido
      this.generateOrderSummary();
      this.updateCartCounter();
      
    } catch (error) {
      console.error('🛒 CartUI: Erro ao atualizar itens do carrinho', error);
    }
  },
  
  /**
   * Gera o resumo do pedido
   */  generateOrderSummary() {
    try {
      if (!this.elements.orderSummaryContainer) {
        this.elements.orderSummaryContainer = document.getElementById('order-summary-container');
        
        if (!this.elements.orderSummaryContainer) {
          console.warn('Container de resumo não encontrado');
          return;
        }
      }
      
      // Se o carrinho estiver vazio
      if (CartState.items.length === 0) {
        this.elements.orderSummaryContainer.innerHTML = `
          <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p class="text-gray-500 dark:text-gray-400">Adicione itens ao carrinho para ver o resumo</p>
          </div>
        `;
        return;
      }
      
      // Somar o total do pedido
      const totalItemCount = CartState.items.reduce((count, item) => count + item.quantity, 0);
      
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
              <span class="font-bold text-xl text-orange-600 dark:text-orange-400">R$ ${CartState.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
        this.elements.orderSummaryContainer.innerHTML = html;
      
      // Como agora não temos mais a tabela, não precisamos do código de interação das linhas
    } catch (error) {
      console.error('🛒 CartUI: Erro ao gerar resumo do pedido', error);
    }
  },
  
  /**
   * Atualiza o resumo final na etapa de pagamento
   */  updateFinalSummary() {
    try {
      const finalSummaryContainer = document.getElementById('final-order-summary');
      if (!finalSummaryContainer) return;
      
      const itemCount = CartState.getItemCount();
      const deliveryText = CartState.deliveryMethod === 'delivery' ? 'Entrega em casa' : 'Retirada na loja';
      
      // Adicionar a tabela detalhada na etapa de pagamento
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
      
      // Adicionar cada item à tabela
      CartState.items.forEach(item => {
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
            <span class="font-bold text-lg text-orange-600 dark:text-orange-400">R$ ${CartState.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
          <div><i class="fas fa-shopping-cart text-orange-500"></i></div>
          <div><span class="font-medium">${itemCount} ${itemCount === 1 ? 'item' : 'itens'}</span> no carrinho</div>
          
          <div><i class="fas ${CartState.deliveryMethod === 'delivery' ? 'fa-shipping-fast' : 'fa-store'} text-orange-500"></i></div>
          <div>${deliveryText}</div>
      `;
      
      // Mostrar endereço apenas se for entrega
      if (CartState.deliveryMethod === 'delivery' && CartState.address) {
        html += `
          <div><i class="fas fa-map-marker-alt text-orange-500"></i></div>
          <div class="truncate">${CartState.address}</div>
        `;
      }
      
      html += `
          <div><i class="fas fa-money-bill-wave text-orange-500"></i></div>
          <div>Total: <span class="font-bold">R$ ${CartState.total.toFixed(2)}</span></div>
        </div>
      `;
        finalSummaryContainer.innerHTML = html;
      
      // Adicionar interatividade às linhas da tabela
      const rows = document.querySelectorAll('#final-order-summary .order-items-container tbody tr');
      rows.forEach(row => {
        row.addEventListener('mouseenter', function() {
          this.classList.add('bg-orange-50', 'dark:bg-orange-900/20');
        });
        
        row.addEventListener('mouseleave', function() {
          this.classList.remove('bg-orange-50', 'dark:bg-orange-900/20');
        });
      });
    } catch (error) {
      console.error('🛒 CartUI: Erro ao atualizar resumo final', error);
    }
  },
  
  /**
   * Atualiza o contador de itens no carrinho
   */  updateCartCounter() {
    try {
      const itemCount = CartState.getItemCount();
      console.log(`🛒 CartUI: Atualizando contador: ${itemCount} itens`);
      
      // Atualizar contador do botão fixo (principal)
      const fixedCounter = document.getElementById('fixed-cart-count');
      if (fixedCounter) {
        fixedCounter.innerText = itemCount.toString();
      }
      
      // Para compatibilidade, atualiza outros contadores
      document.querySelectorAll('[id$="cart-count"]').forEach(counter => {
        counter.innerText = itemCount.toString();
      });
    } catch (error) {
      console.error('🛒 CartUI: Erro ao atualizar contador', error);
    }
  },
  
  /**
   * Cria um modal fallback simples se o modal principal falhar
   */
  createFallbackModal() {
    try {
      console.log('🛒 CartUI: Criando modal fallback');
      
      // Verificar se já existe
      if (document.getElementById('fallback-cart-modal')) {
        return;
      }
      
      const fallbackModal = document.createElement('div');
      fallbackModal.id = 'fallback-cart-modal';
      fallbackModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
      
      // Conteúdo do modal
      let itemsHTML = '';
      
      if (CartState.items.length === 0) {
        itemsHTML = '<p class="text-center py-4">Seu carrinho está vazio</p>';
      } else {
        CartState.items.forEach(item => {
          itemsHTML += `
            <div class="flex justify-between items-center mb-2 p-2 border-b">
              <div>
                <p class="font-medium">${item.name}</p>
                <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
              </div>
              <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `;
        });
      }
      
      // Estrutura do modal
      fallbackModal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 m-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Seu Carrinho</h2>
            <button id="fallback-close-btn" class="text-gray-500 hover:text-gray-700 p-2">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div id="fallback-items">
            ${itemsHTML}
          </div>
          
          <div class="mt-4 pt-4 border-t">
            <div class="flex justify-between font-bold">
              <span>Total:</span>
              <span>R$ ${CartState.total.toFixed(2)}</span>
            </div>
            
            <button id="fallback-checkout-btn" class="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg">
              Finalizar Pedido
            </button>
          </div>
        </div>
      `;
      
      // Adicionar ao corpo
      document.body.appendChild(fallbackModal);
      
      // Evento para fechar
      document.getElementById('fallback-close-btn')?.addEventListener('click', () => {
        fallbackModal.remove();
        document.body.style.overflow = '';
      });
      
      // Evento para checkout (simplificado)
      document.getElementById('fallback-checkout-btn')?.addEventListener('click', () => {
        alert('Para finalizar o pedido, recarregue a página e tente novamente.');
        fallbackModal.remove();
        document.body.style.overflow = '';
      });
      
      // Fechar ao clicar fora
      fallbackModal.addEventListener('click', (e) => {
        if (e.target === fallbackModal) {
          fallbackModal.remove();
          document.body.style.overflow = '';
        }
      });
      
      console.log('🛒 CartUI: Modal fallback criado com sucesso');
    } catch (error) {
      console.error('🛒 CartUI: Erro ao criar modal fallback', error);
      
      // Se tudo falhar, mostrar uma mensagem simples
      alert('Erro ao abrir o carrinho. Por favor, recarregue a página ou limpe o cache do navegador.');
    }
  },
    /**
   * Aplica layout moderno ao modal para garantir scroll adequado
   */
  applyModernLayout() {
    try {
      // Para cada etapa do checkout
      document.querySelectorAll('.checkout-step-content').forEach(stepContent => {
        // Verificar se já tem o layout moderno
        if (stepContent.querySelector('.cart-scrollable-content')) {
          return; // Já está atualizado
        }
        
        console.log('🛒 CartUI: Aplicando layout moderno à etapa', stepContent.id);
        
        // Coletar elementos antes de modificar
        const description = stepContent.querySelector('.step-description');
        const navigationButtons = stepContent.querySelector('div.flex:last-child');
        
        if (!description || !navigationButtons) {
          console.warn('Elementos necessários não encontrados');
          return;
        }
        
        // Adicionar classe para altura proporcional
        stepContent.classList.add('flex', 'flex-col');
        
        // Mover todos os elementos que não são a descrição ou navegação para dentro de um container scrollável
        const scrollableContent = document.createElement('div');
        scrollableContent.className = 'cart-scrollable-content';
        
        // Move todos os elementos, exceto a descrição e os botões de navegação, para o container scrollável
        const elementsToMove = [];
        stepContent.childNodes.forEach(node => {
          if (node !== description && node !== navigationButtons && node.nodeType === 1) {
            elementsToMove.push(node);
          }
        });
        
        elementsToMove.forEach(element => {
          scrollableContent.appendChild(element);
        });
        
        // Adicionar classe mb-2 à descrição para espaçamento consistente
        if (description) description.classList.add('mb-2');
        
        // Inserir o container scrollável entre a descrição e os botões de navegação
        if (navigationButtons) {
          navigationButtons.classList.add('cart-nav-buttons');
          stepContent.insertBefore(scrollableContent, navigationButtons);
        } else {
          stepContent.appendChild(scrollableContent);
        }
      });
      
      return true;
    } catch (error) {
      console.error('🛒 CartUI: Erro ao aplicar layout moderno', error);
      return false;
    }
  },

  /**
   * Anuncia mensagens para leitores de tela
   * @param {string} message - Mensagem a ser anunciada
   */
  announceMessage(message) {
    try {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 3000);
    } catch (error) {
      console.error('🛒 CartUI: Erro ao anunciar mensagem', error);
    }
  }
};

// Funções para interação com o sistema do carrinho
// (Estas funções serão chamadas pelos eventos nos botões de "Adicionar ao Carrinho" no HTML)

/**
 * Adiciona um item ao carrinho
 * @param {Object} item - Item a ser adicionado
 */
function addToCart(item) {
  if (CartState.addItem(item)) {
    CartUI.updateCartCounter();
    
    // Exibir notificação
    Toastify({
      text: `${item.name} adicionado ao carrinho!`,
      duration: 3000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "#f97316",
      }
    }).showToast();
    
    return true;
  }
  return false;
}

/**
 * Abre o carrinho
 * Função global para acesso externo
 */
function openCart() {
  CartUI.openCart();
}

// Expor funções globalmente
window.addToCart = addToCart;
window.openCart = openCart;
window.abrirCarrinho = openCart;

/**
 * Verifica a integridade do sistema do carrinho
 * e garante que tudo esteja funcionando corretamente
 */
function verifyCartSystemIntegrity() {
  console.log('🛒 Verificando integridade do sistema do carrinho');
  
  try {    // Verificar elementos essenciais
    const fixedCartButton = document.getElementById('fixed-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    
    if (!fixedCartButton) {
      console.warn('🛒 Botão fixo do carrinho não encontrado, criando botão garantido');
      CartUI.createGuaranteedButton();
    }
    
    if (!cartModal) {
      console.error('🛒 Modal do carrinho não encontrado no documento');
      // Aviso para depuração
      alert('Erro: Modal do carrinho não encontrado. Verifique se o HTML foi modificado.');
      return false;
    }
    
    // Verificar se temos itens no carrinho do localStorage
    // mas o contador está zerado (inconsistência)
    const count = CartState.getItemCount();    const countDisplay = document.getElementById('fixed-cart-count');
    
    if (count > 0 && countDisplay && countDisplay.textContent === '0') {
      console.warn('🛒 Inconsistência encontrada: itens no carrinho mas contador zerado');
      CartUI.updateCartCounter();
    }
    
    console.log('🛒 Sistema do carrinho verificado e funcionando corretamente');
    return true;
  } catch (error) {
    console.error('🛒 Erro ao verificar integridade do sistema', error);
    return false;
  }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('🛒 Inicializando sistema de carrinho');
  
  // Inicializar sistema
  CartState.init();
  CartUI.init();
  
  // Transformar os botões "Adicionar ao Carrinho" existentes
  setupAddToCartButtons();
  
  // Verificar integridade após um breve delay
  setTimeout(() => {
    verifyCartSystemIntegrity();
  }, 1000);
  
  console.log('🛒 Sistema de carrinho inicializado com sucesso');
});

// Configurar os botões "Adicionar ao Carrinho" existentes
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
      try {
        const menuItem = this.closest('.menu-item');
        if (!menuItem) return;
        
        const name = menuItem.querySelector('h3, .font-bold').textContent;
        const priceText = menuItem.querySelector('.font-bold:not(h3)').textContent;
        const price = parseFloat(priceText.replace('R$', '').trim());
        
        const quantityDisplay = menuItem.querySelector('.quantity-display');
        const quantity = quantityDisplay ? parseInt(quantityDisplay.textContent) : 1;
        
        const image = menuItem.querySelector('img')?.src;
        
        const item = {
          id: `item-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          price,
          quantity,
          image
        };
        
        addToCart(item);
      } catch (error) {
        console.error('Erro ao adicionar item do menu', error);
      }
    });
  });
}
