# Sistema de Carrinho de Compras - República dos Pastéis

Este documento descreve a arquitetura e funcionamento do sistema de carrinho de compras implementado para o site "República dos Pastéis".

## Arquitetura

O sistema foi implementado com uma arquitetura modular, dividida em:

1. **CartState** - Gerenciador de estado centralizado
   - Armazena itens, total, etapa atual, método de entrega, etc.
   - Oferece métodos para manipular o estado (adicionar/remover itens, navegar entre etapas)
   - Persiste dados no localStorage

2. **CartUI** - Interface do usuário
   - Gerencia a interface visual do carrinho
   - Lida com eventos de usuário
   - Renderiza itens e resumos
   - Gerencia navegação entre etapas do checkout

## Fluxo do Checkout

O processo de checkout segue estas etapas:

1. **Resumo do Pedido**
   - Lista dos itens adicionados
   - Controle de quantidade
   - Remoção de itens
   - Total do pedido

2. **Método de Recebimento**
   - Opção de entrega em casa
   - Opção de retirada na loja

3. **Endereço de Entrega** (apenas se método = entrega)
   - Campo para informar endereço completo
   - Validação do campo

4. **Forma de Pagamento**
   - Seleção do método de pagamento
   - Resumo final do pedido
   - Botão de finalização

## Sistema à Prova de Falhas

O sistema implementa diversos mecanismos para garantir funcionamento robusto:

- **Botão Garantido**: Um botão de carrinho é injetado via JavaScript caso o botão original falhe
- **Script de Backup**: O arquivo `cart-backup.js` ativa um modo de emergência caso o sistema principal falhe
- **Recuperação de Estado**: O sistema tenta recuperar dados mesmo quando há problemas com o localStorage
- **Fallbacks Múltiplos**: Várias rotas para garantir funcionalidade do carrinho em diferentes cenários

## Persistência

- O estado do carrinho é salvo no localStorage como `cartState`
- Compatibilidade com formato legado (`cart`) para migração suave

## Acessibilidade

O sistema implementa recursos de acessibilidade como:

- Anúncios ARIA para leitores de tela
- Foco gerenciado para navegação por teclado
- Atalhos de teclado (Alt+C para abrir o carrinho)
- Atributos ARIA para estados e controles

## Arquivos

- **cart-system.js**: Implementação principal do sistema de carrinho
- **cart-backup.js**: Sistema de emergência em caso de falhas
- **styles/cart.css**: Estilos específicos para o carrinho

## Manutenção

Para adicionar novos recursos ou modificar o comportamento do carrinho:

1. As mudanças devem ser feitas no arquivo `cart-system.js`
2. Mantenha a arquitetura modular separando estado (CartState) e UI (CartUI)
3. Sempre teste em diferentes navegadores e dispositivos após alterações
