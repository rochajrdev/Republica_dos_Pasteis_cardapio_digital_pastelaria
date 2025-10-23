// Gera automaticamente a seção "Pastel Caprichado" com os mesmos itens dos pastéis normais, porém R$ 2,00 mais caros
document.addEventListener('DOMContentLoaded', function() {
  try {
    // 1) Encontra a lista base de pastéis normais
    const normalSection = document.querySelector('#menu main');
    const normalItems = normalSection ? normalSection.querySelectorAll('.menu-item, div.flex') : [];

    // 2) Encontra o grid da seção "Pastel Caprichado"
    const capHeading = Array.from(document.querySelectorAll('h2'))
      .find(h2 => h2.textContent.trim().toLowerCase().includes('pastel caprichado'));
    let capGrid = null;
    if (capHeading) {
      const headingWrapper = capHeading.closest('div');
      let sib = headingWrapper ? headingWrapper.nextElementSibling : null;
      while (sib && !sib.classList.contains('grid')) sib = sib.nextElementSibling;
      capGrid = sib;
    }

    if (!normalItems || normalItems.length === 0 || !capGrid) {
      console.warn('CaprichadoClone: seção base ou grid caprichado não encontrados.');
      return;
    }

    // 3) Limpa o grid atual (caso tenha itens fixos de exemplo)
    capGrid.innerHTML = '';

    // 4) Clona cada item e ajusta o preço/nome
    normalItems.forEach((item) => {
      // Garante que é um item de cardápio válido (tem imagem e nome)
      if (!item.querySelector('img') || !item.querySelector('h3, p.font-bold') || !item.querySelector('.add-to-cart-btn')) {
        return;
      }

      const clone = item.cloneNode(true);

      // Nome do item
      const titleEl = clone.querySelector('h3, p.font-bold');
      const baseName = titleEl ? titleEl.textContent.trim() : (clone.querySelector('.add-to-cart-btn')?.getAttribute('data-name') || 'Item');

      // Preço exibido
      const priceEl = clone.querySelector('p.font-bold.text-lg') || clone.querySelector('.flex.items-center.gap-2.justify-between > p.font-bold');
      let displayedPrice = 0;
      if (priceEl) {
        const raw = priceEl.textContent.replace(/[\sR$]/g, '').replace(',', '.');
        const parsed = parseFloat(raw);
        displayedPrice = isNaN(parsed) ? 0 : parsed;
        const newPrice = (displayedPrice + 2).toFixed(2);
        priceEl.textContent = `R$ ${newPrice}`;
        priceEl.setAttribute('aria-label', `Preço: ${newPrice} reais`);
      }

      // Botão de adicionar ao carrinho
      const addBtn = clone.querySelector('.add-to-cart-btn');
      if (addBtn) {
        const dp = parseFloat((addBtn.getAttribute('data-price') || '').replace(',', '.'));
        const basePrice = isNaN(dp) ? displayedPrice : dp;
        const newDataPrice = (basePrice + 2).toFixed(2);
        addBtn.setAttribute('data-price', newDataPrice);
        addBtn.setAttribute('data-name', `Caprichado - ${baseName}`);
        addBtn.setAttribute('aria-label', `Adicionar Caprichado - ${baseName} ao carrinho`);
      }

      // Reseta quantidade visual para 1
      const qty = clone.querySelector('.quantity-display');
      if (qty) qty.textContent = '1';

      // Garante classe menu-item para consistência
      clone.classList.add('menu-item');

      capGrid.appendChild(clone);
    });

    console.log(`CaprichadoClone: ${capGrid.children.length} itens gerados com +R$ 2,00.`);
  } catch (err) {
    console.error('CaprichadoClone: erro ao gerar itens caprichados', err);
  }
});
