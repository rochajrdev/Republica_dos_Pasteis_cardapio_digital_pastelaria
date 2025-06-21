/**
 * final-summary-fix.js
 * Pequena correção para exibir a tabela detalhada no resumo final do pedido
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('🛠️ Aplicando patch para exibir tabela detalhada na etapa de pagamento');
  
  // Função para substituir a implementação original do updateFinalSummary
  function patchCartSystem() {
    // Verificar se o sistema está disponível
    if (typeof CartUI === 'undefined' || typeof CartUI.updateFinalSummary !== 'function') {
      console.log('🛠️ Sistema de carrinho não encontrado, tentando novamente em 500ms');
      setTimeout(patchCartSystem, 500);
      return;
    }

    // Fazer backup da função original
    CartUI._originalUpdateFinalSummary = CartUI.updateFinalSummary;

    // Substituir com nossa implementação que inclui a tabela detalhada
    CartUI.updateFinalSummary = function() {
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
        console.error('🛠️ Erro ao aplicar patch para resumo final', error);
        // Fallback para a implementação original
        this._originalUpdateFinalSummary();
      }
    };

    console.log('🛠️ Patch aplicado com sucesso: A tabela detalhada será exibida na etapa de pagamento');
  }

  // Iniciar o processo de patch
  patchCartSystem();
});
