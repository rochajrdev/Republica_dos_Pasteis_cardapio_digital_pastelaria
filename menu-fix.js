// Script para padronizar todos os itens do menu
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona TODOS os itens de menu em todas as seções do cardápio
    // Isso inclui pastéis normais, caprichados, doces e bebidas
    const allMenuItems = document.querySelectorAll('#menu main > div, #section-pasteis div.flex, #section-especiais div.flex, #section-doces div.flex, #section-bebidas div.flex');
    
    console.log(`Encontrados ${allMenuItems.length} itens de menu para padronizar`);
    
    allMenuItems.forEach((item, index) => {
        // Ignora divs que são apenas containers e não itens de menu
        if (!item.querySelector('img') && !item.querySelector('p.font-bold') && !item.querySelector('h3')) {
            return;
        }
        
        // Adiciona classes padrão para todos os itens
        if (!item.classList.contains('menu-item')) {
            item.classList.add('menu-item');
        }
        
        // Aplica classe comum a todos os itens para garantir consistência visual
        item.classList.add('p-3', 'rounded-lg', 'animate-fade-in', 'bg-white', 'dark:bg-gray-800', 'border', 'border-gray-200', 'dark:border-gray-700', 'shadow-md', 'hover:shadow-lg', 'transition-all', 'hover:-translate-y-1');
        
        // Encontra e melhora a imagem
        const img = item.querySelector('img');
        if (img) {
            // Garantir que todos os atributos de imagem estejam consistentes
            img.setAttribute('loading', 'lazy');
            img.classList.add('rounded-md', 'hover:scale-110', 'duration-300', 'object-cover', 'shadow-sm');
            
            // Melhora o alt da imagem se estiver genérico
            if (img.alt === 'Pastel') {
                const title = item.querySelector('p.font-bold, h3')?.textContent.trim();
                if (title) {
                    const isDoce = item.closest('#section-doces');
                    const prefix = isDoce ? 'Pastel doce de ' : 'Pastel de ';
                    img.alt = prefix + title;
                }
            } else if (img.alt.includes('Refrigerante') || img.src.includes('refri')) {
                const title = item.querySelector('p.font-bold, h3')?.textContent.trim();
                if (title) {
                    img.alt = `${title}`;
                }
            }
        }      // Converte <p class="font-bold"> para <h3> para semantica adequada e consistência
        const title = item.querySelector('p.font-bold');
        if (title && !item.querySelector('h3')) {
            const h3 = document.createElement('h3');
            h3.className = 'font-bold text-lg text-gray-900 dark:text-gray-100';
            h3.textContent = title.textContent;
            title.parentNode.replaceChild(h3, title);
        } else if (item.querySelector('h3')) {
            // Se já tiver um h3, garantir que tenha as mesmas classes
            const h3 = item.querySelector('h3');
            h3.className = 'font-bold text-lg text-gray-900 dark:text-gray-100';
        }
        
        // Garantir que a descrição do item tenha estilo consistente
        const description = item.querySelector('p.text-sm');
        if (description) {
            description.classList.add('text-gray-600', 'dark:text-gray-400', 'mt-1');
        }
          // Melhora os botões de quantidade
        const actionsContainer = item.querySelector('.flex.items-center.gap-2.justify-between');
        if (!actionsContainer) {
            // Se não tiver o container de ações, cria um
            const priceElement = item.querySelector('p.font-bold.text-lg');
            if (priceElement) {
                const newContainer = document.createElement('div');
                newContainer.className = 'flex items-center gap-2 justify-between mt-3';
                priceElement.parentNode.insertBefore(newContainer, priceElement);
                newContainer.appendChild(priceElement);
                
                // Cria container para os botões
                const buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'flex items-center gap-2';
                newContainer.appendChild(buttonsContainer);
                
                // Cria controle de quantidade
                const quantityControls = document.createElement('div');
                quantityControls.className = 'flex items-center bg-gray-100 dark:bg-gray-700 rounded';
                quantityControls.setAttribute('role', 'group');
                quantityControls.setAttribute('aria-label', 'Controle de quantidade');
                buttonsContainer.appendChild(quantityControls);
                
                // Botão de diminuir
                const decreaseBtn = document.createElement('button');
                decreaseBtn.className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l focus:outline-none focus:ring-1 focus:ring-orange-500';
                decreaseBtn.setAttribute('data-action', 'decrease');
                decreaseBtn.setAttribute('aria-label', 'Diminuir quantidade');
                
                const minusIcon = document.createElement('i');
                minusIcon.className = 'fas fa-minus';
                minusIcon.setAttribute('aria-hidden', 'true');
                
                decreaseBtn.appendChild(minusIcon);
                quantityControls.appendChild(decreaseBtn);
                
                // Display de quantidade
                const quantityDisplay = document.createElement('span');
                quantityDisplay.className = 'quantity-display px-3';
                quantityDisplay.setAttribute('aria-live', 'polite');
                quantityDisplay.textContent = '1';
                quantityControls.appendChild(quantityDisplay);
                
                // Botão de aumentar
                const increaseBtn = document.createElement('button');
                increaseBtn.className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r focus:outline-none focus:ring-1 focus:ring-orange-500';
                increaseBtn.setAttribute('data-action', 'increase');
                increaseBtn.setAttribute('aria-label', 'Aumentar quantidade');
                
                const plusIcon = document.createElement('i');
                plusIcon.className = 'fas fa-plus';
                plusIcon.setAttribute('aria-hidden', 'true');
                
                increaseBtn.appendChild(plusIcon);
                quantityControls.appendChild(increaseBtn);
                
                // Criar botão de adicionar ao carrinho se não existir
                const itemName = item.querySelector('h3, p.font-bold')?.textContent.trim() || '';
                const priceText = priceElement?.textContent.trim().replace('R$ ', '') || '0.00';
                
                const addBtn = document.createElement('button');
                addBtn.className = 'bg-orange-600 hover:bg-orange-700 px-5 py-2 rounded add-to-cart-btn focus:ring-2 focus:ring-orange-500 text-white transition-colors shadow-sm hover:shadow-md';
                addBtn.setAttribute('data-name', itemName);
                addBtn.setAttribute('data-price', priceText);
                addBtn.setAttribute('aria-label', `Adicionar ${itemName} ao carrinho`);
                
                const cartIcon = document.createElement('i');
                cartIcon.className = 'fa fa-cart-plus text-lg text-white';
                cartIcon.setAttribute('aria-hidden', 'true');
                
                const srSpan = document.createElement('span');
                srSpan.className = 'sr-only';
                srSpan.textContent = 'Adicionar ao carrinho';
                
                addBtn.appendChild(cartIcon);
                addBtn.appendChild(srSpan);
                
                buttonsContainer.appendChild(addBtn);
            }
        } else {
            // Se já tem o container, apenas atualiza os estilos
            const quantityControls = item.querySelector('.flex.items-center.bg-gray-100, .flex.items-center > div');
            if (quantityControls) {                // Redefine classes para garantir estilo consistente
                quantityControls.className = 'flex items-center bg-gray-100 dark:bg-gray-700 rounded';
                quantityControls.setAttribute('role', 'group');
                quantityControls.setAttribute('aria-label', 'Controle de quantidade');
                
                const buttons = quantityControls.querySelectorAll('button');
                const decreaseBtn = buttons[0];
                const increaseBtn = buttons[1];
                
                if (decreaseBtn) {
                    decreaseBtn.className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l focus:outline-none focus:ring-1 focus:ring-orange-500';
                    decreaseBtn.setAttribute('aria-label', 'Diminuir quantidade');
                    const icon = decreaseBtn.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-minus';
                        icon.setAttribute('aria-hidden', 'true');
                    }
                }
                
                if (increaseBtn) {
                    increaseBtn.className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r focus:outline-none focus:ring-1 focus:ring-orange-500';
                    increaseBtn.setAttribute('aria-label', 'Aumentar quantidade');
                    const icon = increaseBtn.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-plus';
                        icon.setAttribute('aria-hidden', 'true');
                    }
                }
                
                const quantityDisplay = quantityControls.querySelector('.quantity-display, span');
                if (quantityDisplay) {
                    quantityDisplay.className = 'quantity-display px-3';
                    quantityDisplay.setAttribute('aria-live', 'polite');
                }
            }
        }        // Melhora os botões de adicionar ao carrinho
        const addBtn = item.querySelector('.add-to-cart-btn');
        if (addBtn) {
            // Redefine as classes completamente para garantir consistência
            addBtn.className = 'bg-orange-600 hover:bg-orange-700 px-5 py-2 rounded add-to-cart-btn focus:ring-2 focus:ring-orange-500 text-white transition-colors shadow-sm hover:shadow-md';
            
            const itemName = addBtn.getAttribute('data-name');
            if (itemName) {
                addBtn.setAttribute('aria-label', `Adicionar ${itemName} ao carrinho`);
            } else {
                // Se não tiver data-name, tenta encontrar pelo título
                const title = item.querySelector('h3, p.font-bold')?.textContent.trim();
                if (title) {
                    addBtn.setAttribute('data-name', title);
                    addBtn.setAttribute('aria-label', `Adicionar ${title} ao carrinho`);
                }
            }
            
            const icon = addBtn.querySelector('i');
            if (icon) {
                icon.className = 'fa fa-cart-plus text-lg text-white';
                icon.setAttribute('aria-hidden', 'true');
                
                // Se não tiver span sr-only, adiciona
                if (!addBtn.querySelector('.sr-only')) {
                    const srSpan = document.createElement('span');
                    srSpan.className = 'sr-only';
                    srSpan.textContent = 'Adicionar ao carrinho';
                    addBtn.appendChild(srSpan);
                }
            }
        }
        
        // Melhora preços para estilo consistente
        const price = item.querySelector('p.font-bold.text-lg, .flex.items-center.gap-2.justify-between > p.font-bold');
        if (price) {
            price.className = 'font-bold text-lg text-gray-900 dark:text-gray-100';
            
            const priceValue = price.textContent.trim().replace('R$ ', '');
            price.setAttribute('aria-label', `Preço: ${priceValue} reais`);
            
            // Garantir que o preço tenha o formato correto
            if (!price.textContent.startsWith('R$')) {
                price.textContent = 'R$ ' + price.textContent;
            }
        }
        
        // Garantir que a área de botões e preço tenha estrutura consistente
        const actionArea = item.querySelector('.flex.items-center.gap-2.justify-between');
        if (actionArea) {
            actionArea.classList.add('mt-3');
        }
        
        // Garantir que o wrapper da imagem e conteúdo tenha gap consistente
        if (item.classList.contains('flex')) {
            item.classList.add('gap-2');
        }
    });
    
    // Log para confirmar que o script foi executado
    console.log(`Padronização concluída para ${allMenuItems.length} itens do cardápio`);
});

// Função adicional para ajustar as imagens de bebidas e aplicar estilo específico por categoria
document.addEventListener('DOMContentLoaded', function() {
    // Ajuste de layout específico para bebidas
    setTimeout(() => {
        // Seleciona todas as seções do menu
        const secoes = ['section-pasteis', 'section-especiais', 'section-doces', 'section-bebidas'];
        
        secoes.forEach(secaoId => {
            const secaoContainer = document.querySelector(`#${secaoId}`);
            if (!secaoContainer) return;
            
            // Aplica estilos específicos por tipo de item
            const itens = secaoContainer.querySelectorAll('.menu-item, div.flex');
            
            itens.forEach(item => {
                const nome = item.querySelector('h3, p.font-bold')?.textContent.toLowerCase() || '';
                const img = item.querySelector('img');
                
                // Aplicar classes específicas por seção
                if (secaoId === 'section-bebidas') {
                    // Substituir imagens de bebidas por imagens específicas quando disponíveis
                    if (nome && (nome.includes('coca') || nome.includes('cola')) && img) {
                        img.src = './assets/refri-1.png';
                        img.alt = 'Refrigerante Coca-Cola';
                        item.classList.add('bg-gradient-to-br', 'from-white', 'to-gray-50', 'dark:from-gray-800', 'dark:to-gray-900');
                    } else if (nome && (nome.includes('guaran') || nome.includes('refri') || nome.includes('soda')) && img) {
                        img.src = './assets/refri-2.png';
                        img.alt = 'Refrigerante Guaraná';
                        item.classList.add('bg-gradient-to-br', 'from-white', 'to-gray-50', 'dark:from-gray-800', 'dark:to-gray-900');
                    }
                    
                    // Adicionar efeito de refresco nas bebidas
                    item.classList.add('hover:rotate-1', 'relative', 'overflow-hidden');
                } else if (secaoId === 'section-doces') {
                    // Estilo especial para os doces
                    item.classList.add('bg-gradient-to-br', 'from-white', 'to-pink-50', 'dark:from-gray-800', 'dark:to-pink-900/10');
                } else if (secaoId === 'section-especiais') {
                    // Estilo especial para os pastéis especiais
                    item.classList.add('bg-gradient-to-br', 'from-white', 'to-orange-50', 'dark:from-gray-800', 'dark:to-orange-900/10');
                }
                
                // Itens específicos por nome
                if (nome && nome.includes('cuscuz') && img) {
                    img.src = './assets/cuscuz.jpg';
                    img.alt = 'Cuscuz';
                }
                
                // Garantir que todos os itens tenham a mesma estrutura básica
                if (!item.classList.contains('menu-item')) {
                    item.classList.add('menu-item');
                }
            });
        });
        
        console.log('Estilização específica por categoria concluída');
    }, 500); // Pequeno delay para garantir que os outros scripts terminaram
});

// Função para garantir que todas as categorias do menu tenham a mesma estrutura
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco mais para garantir que todas as outras funções terminaram
    setTimeout(() => {
        // Verificar e corrigir estruturas das seções
        const secoes = ['section-pasteis', 'section-especiais', 'section-doces', 'section-bebidas'];
        
        secoes.forEach(secaoId => {
            const secao = document.querySelector(`#${secaoId}`);
            if (!secao) return;
            
            // Corrigir containers que não seguem o mesmo padrão
            const containers = secao.querySelectorAll(':scope > div');
            containers.forEach(container => {
                if (container.querySelector('.grid')) {
                    // Se encontrar um container grid, verificar se os itens dentro dele têm a classe menu-item
                    const gridItems = container.querySelectorAll('.grid > div');
                    gridItems.forEach(item => {
                        if (!item.classList.contains('menu-item')) {
                            item.classList.add('menu-item');
                        }
                        
                        // Garantir que tenha as classes básicas de layout
                        item.classList.add('p-3', 'rounded-lg', 'animate-fade-in', 'bg-white', 'dark:bg-gray-800', 
                            'border', 'border-gray-200', 'dark:border-gray-700', 'shadow-md', 'transition-all');
                    });
                }
            });
            
            // Verificar padding e gap consistentes na seção
            const itens = secao.querySelectorAll('.menu-item');
            itens.forEach(item => {
                if (!item.classList.contains('gap-2') && item.classList.contains('flex')) {
                    item.classList.add('gap-2');
                }
                
                if (!item.classList.contains('p-3')) {
                    item.classList.add('p-3');
                }
            });
        });
        
        // Log final de confirmação
        console.log('Padronização final das estruturas de seção concluída');
    }, 700);
});

// Script de validação final - valida se todos os itens estão bem formatados
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        let totalPadronizados = 0;
        let totalItens = 0;
        
        // Verificar se todos os itens do cardápio têm a mesma estrutura
        const todosItens = document.querySelectorAll('.menu-item, #menu main > div.flex, [id^="section-"] div.flex');
        
        todosItens.forEach(item => {
            totalItens++;
            
            // Verificar se o item tem todos os elementos essenciais
            const temImagem = !!item.querySelector('img');
            const temTitulo = !!item.querySelector('h3, p.font-bold');
            const temDescricao = !!item.querySelector('p.text-sm');
            const temPreco = !!item.querySelector('p.font-bold.text-lg, .flex.items-center.gap-2.justify-between > p.font-bold');
            const temBotoes = !!item.querySelector('.add-to-cart-btn');
            
            if (temImagem && temTitulo && temDescricao && temPreco && temBotoes) {
                totalPadronizados++;
            }
        });
        
        console.log(`Resultado da padronização: ${totalPadronizados} de ${totalItens} itens (${Math.round(totalPadronizados/totalItens*100)}%) estão completamente padronizados`);
    }, 1000);
});

// Função para padronizar completamente a estrutura HTML dos itens
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Seleciona todos os itens que têm a estrutura antiga
        const itensParaPadronizar = document.querySelectorAll('div.flex:not(.menu-item)');
        console.log(`Encontrados ${itensParaPadronizar.length} itens com estrutura antiga para padronizar`);
        
        itensParaPadronizar.forEach(item => {
            // Verifica se é realmente um item de menu e não outro elemento flex
            if (!item.querySelector('img') || !item.querySelector('p.font-bold') || !item.querySelector('.add-to-cart-btn')) {
                return;
            }
            
            // Adiciona classes padrão do template ideal
            item.classList.add('menu-item', 'p-3', 'rounded-lg', 'animate-fade-in', 'bg-white', 'dark:bg-gray-800', 
                'border', 'border-gray-200', 'dark:border-gray-700', 'shadow-md', 'hover:shadow-lg', 'transition-all', 
                'hover:-translate-y-1');
            
            // Padroniza a imagem
            const img = item.querySelector('img');
            if (img) {
                img.setAttribute('loading', 'lazy');
                img.classList.add('rounded-md', 'hover:scale-110', 'duration-300', 'object-cover', 'shadow-sm');
                
                // Melhora o alt da imagem
                const title = item.querySelector('p.font-bold')?.textContent.trim() || '';
                if (img.alt === 'Pastel') {
                    const secaoDoces = item.closest('#section-doces');
                    if (secaoDoces) {
                        img.alt = `Pastel doce de ${title}`;
                    } else {
                        img.alt = `Pastel de ${title}`;
                    }
                } else if (img.alt.includes('Refrigerante') || img.src.includes('refri')) {
                    img.alt = `${title}`;
                }
            }
            
            // Converte <p class="font-bold"> para <h3>
            const boldText = item.querySelector('p.font-bold');
            if (boldText && !item.querySelector('h3')) {
                const titulo = boldText.textContent;
                const h3 = document.createElement('h3');
                h3.className = 'font-bold text-lg text-gray-900 dark:text-gray-100';
                h3.textContent = titulo;
                boldText.parentNode.replaceChild(h3, boldText);
            }
            
            // Padroniza a descrição
            const description = item.querySelector('p.text-sm');
            if (description) {
                description.classList.add('text-gray-600', 'dark:text-gray-400', 'mt-1');
            }
            
            // Padroniza os controles de quantidade
            const quantityControls = item.querySelector('.flex.items-center.bg-gray-100, .flex.items-center > div');
            if (quantityControls) {
                quantityControls.className = 'flex items-center bg-gray-100 dark:bg-gray-700 rounded';
                quantityControls.setAttribute('role', 'group');
                quantityControls.setAttribute('aria-label', 'Controle de quantidade');
                
                const btns = quantityControls.querySelectorAll('button');
                if (btns.length >= 2) {
                    // Botão de diminuir
                    btns[0].className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600';
                    btns[0].setAttribute('aria-label', 'Diminuir quantidade');
                    
                    const iconMinus = btns[0].querySelector('i');
                    if (iconMinus) {
                        iconMinus.className = 'fas fa-minus';
                        iconMinus.setAttribute('aria-hidden', 'true');
                    }
                    
                    // Botão de aumentar
                    btns[1].className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600';
                    btns[1].setAttribute('aria-label', 'Aumentar quantidade');
                    
                    const iconPlus = btns[1].querySelector('i');
                    if (iconPlus) {
                        iconPlus.className = 'fas fa-plus';
                        iconPlus.setAttribute('aria-hidden', 'true');
                    }
                }
                
                // Ajusta o display de quantidade
                const quantityDisplay = quantityControls.querySelector('.quantity-display, span');
                if (quantityDisplay) {
                    quantityDisplay.className = 'quantity-display px-3';
                    quantityDisplay.setAttribute('aria-live', 'polite');
                }
            }
            
            // Padroniza o botão de adicionar ao carrinho
            const addBtn = item.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.className = 'bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 px-5 py-2 rounded add-to-cart-btn';
                
                const itemName = addBtn.getAttribute('data-name');
                addBtn.setAttribute('aria-label', `Adicionar ${itemName} ao carrinho`);
                
                // Garante que o ícone está formatado corretamente
                const cartIcon = addBtn.querySelector('i');
                if (cartIcon) {
                    cartIcon.className = 'fa fa-cart-plus text-lg text-white';
                    cartIcon.setAttribute('aria-hidden', 'true');
                }
                
                // Adiciona o span sr-only se não existir
                if (!addBtn.querySelector('.sr-only')) {
                    const srOnly = document.createElement('span');
                    srOnly.className = 'sr-only';
                    srOnly.textContent = 'Adicionar ao carrinho';
                    addBtn.appendChild(srOnly);
                }
            }
            
            // Padroniza o preço
            const price = item.querySelector('p.font-bold.text-lg');
            if (price) {
                price.className = 'font-bold text-lg text-gray-900 dark:text-gray-100';
                price.setAttribute('aria-label', `Preço: ${price.textContent.replace('R$ ', '')} reais`);
            }
        });
        
        console.log('Padronização estrutural completa para todos os itens');
    }, 300);
});

// Função específica para padronizar o formato do exemplo fornecido pelo usuário
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Busca por divs que podem ser itens no formato antigo
        const divs = document.querySelectorAll('div.flex:not(.menu-item)');
        
        divs.forEach(div => {
            // Verifica se é um item de menu no formato antigo
            const hasImg = div.querySelector('img') !== null;
            const hasBoldText = div.querySelector('p.font-bold') !== null;
            const hasPrice = div.querySelector('.font-bold.text-lg') !== null;
            const hasQuantityControls = div.querySelector('.flex.items-center.bg-gray-100') !== null;
            const hasAddBtn = div.querySelector('.add-to-cart-btn') !== null;
            
            if (hasImg && hasBoldText && hasPrice && hasQuantityControls && hasAddBtn) {
                // É um item de menu no formato antigo, vamos convertê-lo para o novo formato
                
                // 1. Adiciona as classes do template ideal
                div.className = 'flex gap-2 menu-item p-3 rounded-lg animate-fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all hover:-translate-y-1';
                
                // 2. Atualiza a imagem
                const img = div.querySelector('img');
                if (img) {
                    img.setAttribute('loading', 'lazy');
                    // Mantém o src existente
                    
                    // Melhora o alt tag
                    if (img.alt === 'Pastel') {
                        const nome = div.querySelector('p.font-bold')?.textContent.trim() || '';
                        const secao = div.closest('#section-doces') 
                            ? 'Pastel doce de ' 
                            : div.closest('#section-bebidas')
                              ? 'Bebida '
                              : 'Pastel de ';
                              
                        img.alt = secao + nome;
                    }
                }
                
                // 3. Converte o título para h3
                const pTitle = div.querySelector('p.font-bold');
                if (pTitle && !div.querySelector('h3')) {
                    const h3 = document.createElement('h3');
                    h3.className = 'font-bold text-lg';
                    h3.textContent = pTitle.textContent;
                    pTitle.parentNode.replaceChild(h3, pTitle);
                }
                
                // 4. Estiliza a área de quantidade
                const qtyControls = div.querySelector('.flex.items-center.bg-gray-100');
                if (qtyControls) {
                    qtyControls.className = 'flex items-center bg-gray-100 dark:bg-gray-700 rounded';
                    qtyControls.setAttribute('role', 'group');
                    qtyControls.setAttribute('aria-label', 'Controle de quantidade');
                    
                    // Atualiza spans e botões dentro dos controles
                    const qtySpan = qtyControls.querySelector('span');
                    if (qtySpan) {
                        qtySpan.setAttribute('aria-live', 'polite');
                    }
                    
                    // Atualiza os botões
                    const qtyButtons = qtyControls.querySelectorAll('button');
                    qtyButtons.forEach(btn => {
                        const isDecrease = btn.getAttribute('data-action') === 'decrease';
                        btn.className = `px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn ${isDecrease ? 'rounded-l' : 'rounded-r'}`;
                        
                        // Garante que o ícone tenha aria-hidden
                        const icon = btn.querySelector('i');
                        if (icon) {
                            icon.setAttribute('aria-hidden', 'true');
                        }
                    });
                }
                
                // 5. Estiliza o botão de adicionar ao carrinho
                const addBtn = div.querySelector('.add-to-cart-btn');
                if (addBtn) {
                    addBtn.className = 'bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 px-5 py-2 rounded add-to-cart-btn';
                    
                    const itemName = addBtn.getAttribute('data-name') || '';
                    addBtn.setAttribute('aria-label', `Adicionar ${itemName} ao carrinho`);
                    
                    // Adiciona span sr-only se não existir
                    if (!addBtn.querySelector('.sr-only')) {
                        const srOnly = document.createElement('span');
                        srOnly.className = 'sr-only';
                        srOnly.textContent = 'Adicionar ao carrinho';
                        addBtn.appendChild(srOnly);
                    }
                    
                    // Garante que o ícone tenha aria-hidden
                    const btnIcon = addBtn.querySelector('i');
                    if (btnIcon) {
                        btnIcon.setAttribute('aria-hidden', 'true');
                    }
                }
            }
        });
        
        console.log('Conversão direta dos itens do formato antigo para o novo concluída');
    }, 400);
});

// Função para ajuste fino nas imagens e cores por categoria
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Seleciona todas as seções do menu
        const secoes = {
            pasteis: document.querySelector('#section-pasteis'),
            especiais: document.querySelector('#section-especiais'),
            doces: document.querySelector('#section-doces'),
            bebidas: document.querySelector('#section-bebidas')
        };
        
        // Ajustes por categoria
        Object.entries(secoes).forEach(([categoria, secao]) => {
            if (!secao) return;
            
            const itens = secao.querySelectorAll('.menu-item, div.flex');
            itens.forEach(item => {
                // 1. Garantir que todos os itens tenham a classe menu-item
                if (!item.classList.contains('menu-item')) {
                    item.classList.add('menu-item');
                }
                
                // 2. Ajustar a estrutura flex e gap
                if (item.classList.contains('flex') && !item.classList.contains('gap-2')) {
                    item.classList.add('gap-2');
                }
                  // Corrigir especificamente os controles de quantidade
                const qtyControls = item.querySelector('.flex.items-center.bg-gray-100');
                if (qtyControls) {
                    qtyControls.className = 'flex items-center bg-gray-100 dark:bg-gray-700 rounded';
                    
                    // Corrigir os botões dentro do controle
                    const qtyButtons = qtyControls.querySelectorAll('button');
                    if (qtyButtons.length >= 1) {
                        qtyButtons[0].className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l';
                    }
                    if (qtyButtons.length >= 2) {
                        qtyButtons[1].className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r';
                    }
                }
                
                // 3. Aplicar estilos específicos por categoria
                switch (categoria) {
                    case 'bebidas':
                        // Identificar o tipo de bebida e usar a imagem correta
                        const nomeBebida = item.querySelector('h3, p.font-bold')?.textContent.toLowerCase() || '';
                        const imgBebida = item.querySelector('img');
                        
                        if (imgBebida) {
                            if ((nomeBebida.includes('coca') || nomeBebida.includes('cola')) && 
                                imgBebida.src.includes('pastel.jpg')) {
                                imgBebida.src = './assets/refri-1.png';
                                imgBebida.alt = 'Refrigerante Coca-Cola';
                            } else if ((nomeBebida.includes('guaran') || nomeBebida.includes('soda') || 
                                       nomeBebida.includes('refri') || nomeBebida.includes('fanta')) && 
                                       imgBebida.src.includes('pastel.jpg')) {
                                imgBebida.src = './assets/refri-2.png';
                                imgBebida.alt = 'Refrigerante Guaraná';
                            }
                        }
                        
                        // Adiciona classes específicas para bebidas
                        item.classList.add('bg-gradient-to-br', 'from-white', 'to-blue-50', 
                                           'dark:from-gray-800', 'dark:to-blue-900/10', 
                                           'hover:rotate-1');
                        break;
                        
                    case 'doces':
                        // Adiciona classes específicas para doces
                        item.classList.add('bg-gradient-to-br', 'from-white', 'to-pink-50', 
                                           'dark:from-gray-800', 'dark:to-pink-900/10');
                        break;
                        
                    case 'especiais':
                        // Adiciona classes específicas para especiais
                        item.classList.add('bg-gradient-to-br', 'from-white', 'to-orange-50', 
                                           'dark:from-gray-800', 'dark:to-orange-900/10');
                        break;
                        
                    default: // pasteis normais
                        // Adiciona classes básicas
                        item.classList.add('bg-white', 'dark:bg-gray-800');
                        break;
                }
                
                // 4. Garantir que todas as imagens tenham loading="lazy" e efeitos visuais
                const img = item.querySelector('img');
                if (img) {
                    img.setAttribute('loading', 'lazy');
                    if (!img.classList.contains('hover:scale-110')) {
                        img.classList.add('hover:scale-110', 'duration-300', 'shadow-sm');
                    }
                }
                
                // 5. Garantir que todos os botões de adicionar ao carrinho tenham os efeitos adequados
                const addBtn = item.querySelector('.add-to-cart-btn');
                if (addBtn) {
                    addBtn.classList.add('hover:bg-orange-700', 'focus:ring-2', 'focus:ring-orange-500', 'transition-colors', 'shadow-sm', 'hover:shadow-md');
                    
                    // Garante aria-label adequado
                    const itemName = addBtn.getAttribute('data-name') || 
                                    item.querySelector('h3')?.textContent || 
                                    item.querySelector('p.font-bold')?.textContent || '';
                                    
                    if (itemName) {
                        addBtn.setAttribute('aria-label', `Adicionar ${itemName} ao carrinho`);
                    }
                }
                
                // 6. Garantir que todos os preços tenham o formato correto
                const price = item.querySelector('p.font-bold.text-lg');
                if (price) {
                    const priceText = price.textContent.trim();
                    if (!priceText.startsWith('R$')) {
                        price.textContent = `R$ ${priceText}`;
                    }
                }
            });
        });
        
        console.log('Ajuste fino de imagens e estilos por categoria concluído');
    }, 500);
});

// Função específica para corrigir os controles de quantidade no tema escuro
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('Corrigindo controles de quantidade para tema escuro...');
        
        // Seleciona TODOS os controles de quantidade em TODAS as seções
        const todosControles = document.querySelectorAll('.flex.items-center.bg-gray-100, .flex.bg-gray-100');
        console.log(`Encontrados ${todosControles.length} controles de quantidade para corrigir`);
        
        todosControles.forEach(control => {
            // Garante que tenha as classes para o tema escuro
            if (!control.className.includes('dark:bg-gray-700')) {
                control.className = 'flex items-center bg-gray-100 dark:bg-gray-700 rounded';
            }
            
            // Garante que os botões dentro do controle tenham as classes corretas para o tema escuro
            const buttons = control.querySelectorAll('button');
            buttons.forEach((btn, index) => {
                const isDecreaseBtn = index === 0 || btn.getAttribute('data-action') === 'decrease';
                const isIncreaseBtn = index === 1 || btn.getAttribute('data-action') === 'increase';
                
                if (isDecreaseBtn) {
                    // Botão de diminuir quantidade
                    btn.className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l focus:outline-none focus:ring-1 focus:ring-orange-500';
                } else if (isIncreaseBtn) {
                    // Botão de aumentar quantidade
                    btn.className = 'px-2 py-1 text-orange-600 dark:text-orange-400 quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r focus:outline-none focus:ring-1 focus:ring-orange-500';
                }
                
                // Garante que o ícone tenha as classes corretas
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.setAttribute('aria-hidden', 'true');
                }
            });
            
            // Garante que o display de quantidade tenha as classes corretas
            const quantityDisplay = control.querySelector('span');
            if (quantityDisplay && !quantityDisplay.getAttribute('aria-live')) {
                quantityDisplay.className = 'quantity-display px-3';
                quantityDisplay.setAttribute('aria-live', 'polite');
            }
        });
        
        // Garantir também que todos os botões de adicionar ao carrinho estejam com as classes corretas
        const todosAddBtns = document.querySelectorAll('.add-to-cart-btn');
        todosAddBtns.forEach(btn => {
            // Garante que tenha as classes para o tema escuro
            if (!btn.className.includes('hover:bg-orange-700')) {
                btn.className = 'bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 px-5 py-2 rounded add-to-cart-btn text-white transition-colors shadow-sm hover:shadow-md';
            }
        });
        
        console.log('Correção dos controles de quantidade para tema escuro concluída');
    }, 800);
});
