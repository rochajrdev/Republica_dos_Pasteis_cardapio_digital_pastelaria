// Rolagem suave para seções do cardápio ao clicar nas abas do menu
// Não altera estilos nem lógica de carrinho; apenas faz scroll até a seção correspondente.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Helper para encontrar seção pelo texto do h2
    function findSectionWrapperByHeadingContains(textLower) {
      const headings = Array.from(document.querySelectorAll('h2'));
      const h = headings.find((el) => (el.textContent || '').trim().toLowerCase().includes(textLower));
      if (!h) return null;
      // Preferimos rolar até o container visual do heading (a div laranja), que é o pai imediato
      return h.parentElement || h;
    }

    // Resolvedores de seção baseados nos data-target já existentes nas abas
    const sectionResolvers = {
      'section-pasteis': function () {
        // Primeiro grid principal de pastéis
        return document.querySelector('#menu main') || document.getElementById('menu');
      },
      'section-especiais': function () {
        // "Caprichado" corresponde ao heading "Pastel Caprichado"
        return findSectionWrapperByHeadingContains('caprichado');
      },
      'section-doces': function () {
        // Heading "Pastel doce"
        return findSectionWrapperByHeadingContains('doce');
      },
      'section-bebidas': function () {
        // Heading "Bebidas"
        return findSectionWrapperByHeadingContains('bebidas');
      }
    };

    // Liga os cliques das abas
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const targetKey = tab.getAttribute('data-target');
        const resolver = sectionResolvers[targetKey];
        let el = resolver ? resolver() : null;

        // Fallback seguro: rola para o início do cardápio
        if (!el) el = document.getElementById('menu');

        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }
      });
    });
  });
})();
