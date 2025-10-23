// Horário de funcionamento inteligente
// - Bloqueia o "Finalizar Pedido" fora do horário (Ter-Dom, 16:00-22:00)
// - Mostra aviso com CTA que rola até o badge de horário (#date-span)
// - Deixa o badge verde quando aberto e vermelho quando fechado
(function () {
  function isOpenNow(now = new Date()) {
    // Domingo = 0, Segunda = 1, ... Sábado = 6
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Aberto Terça(2) a Domingo(0). Fechado Segunda(1)
    const openDays = new Set([0, 2, 3, 4, 5, 6]);
    if (!openDays.has(day)) return false;

    // Janela 16:00 (inclusive) até 22:00 (exclusivo)
    const totalMinutes = hours * 60 + minutes;
    const openStart = 16 * 60; // 16:00
    const openEnd = 22 * 60;   // 22:00
    return totalMinutes >= openStart && totalMinutes < openEnd;
  }

  function updateScheduleBadge() {
    const badge = document.getElementById('date-span');
    if (!badge) return;

    const open = isOpenNow();
    const add = (cls) => badge.classList.add(cls);
    const remove = (cls) => badge.classList.remove(cls);

    // Alternar apenas as classes de cor, sem mexer em layout/estilo geral
    if (open) {
      remove('bg-red-600');
      remove('hover:bg-red-700');
      add('bg-green-600');
      add('hover:bg-green-700');
      badge.setAttribute('aria-label', 'Aberto agora');
    } else {
      remove('bg-green-600');
      remove('hover:bg-green-700');
      add('bg-red-600');
      add('hover:bg-red-700');
      badge.setAttribute('aria-label', 'Fechado agora');
    }
  }

  function interceptCheckoutWhenClosed() {
    const btn = document.getElementById('checkout-btn');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      if (!isOpenNow()) {
        // Impede qualquer handler de continuar
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation && e.stopImmediatePropagation();

        // Aviso clicável com CTA: rolar até #date-span
        if (typeof Toastify === 'function') {
          Toastify({
            text: 'Estamos fechados no momento. Atendimento: Ter-Dom, 16:00–22:00.',
            duration: 5000,
            gravity: 'bottom',
            position: 'left',
            close: true,
            backgroundColor: '#dc2626', // red-600
            onClick: function () {
              const badge = document.getElementById('date-span');
              if (badge && badge.scrollIntoView) {
                badge.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }).showToast();
        } else {
          // Fallback silencioso
          const badge = document.getElementById('date-span');
          if (badge && badge.scrollIntoView) {
            badge.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }, true); // useCapture para pegar antes de outros handlers
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateScheduleBadge();
    interceptCheckoutWhenClosed();

    // Atualiza a cada minuto para refletir mudança de horário em página aberta
    setInterval(updateScheduleBadge, 60 * 1000);
  });
})();
