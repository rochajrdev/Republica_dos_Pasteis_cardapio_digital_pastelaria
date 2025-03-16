const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")

let cart = [];

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function() {
    updateCartModal();
    cartModal.style.display = "flex"
})

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event){
    if(event.target === cartModal){
        cartModal.style.display = "none"
    }
})

// Botão de fechar o modal do carrinho
closeModalBtn.addEventListener("click", function(){
    cartModal.style.display = "none"
})


// Controle de quantidade
document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const display = e.currentTarget.parentNode.querySelector('.quantity-display');
        let quantity = parseInt(display.textContent);

        if (action === 'increase') {
            quantity = Math.min(quantity + 1, 10); // Limita a 10 itens
        } else if (action === 'decrease') {
            quantity = Math.max(quantity - 1, 1); // Não permite menos que 1
        }

        display.textContent = quantity;
    });
});

// Modificar a função que adiciona ao carrinho para considerar a quantidade
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Encontrar o display de quantidade mais próximo
        const quantityDisplay = button.parentNode.querySelector('.quantity-display');
        const quantity = parseInt(quantityDisplay.textContent);
        
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const total = price * quantity;

        // Adicionar ao carrinho com a quantidade selecionada
        addToCart(name, price, quantity);

        // Mostrar notificação
        Toastify({
            text: `${quantity}x ${name} adicionado ao carrinho!`,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
    });
});

// Adicionar no carrinho
/*
menu.addEventListener("click", function(event){
    let parentButton = event.target.closest(".add-to-cart-btn")
    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))
        addToCart(name, price)
    }
})
*/

// Função modificada para adicionar ao carrinho
function addToCart(name, price, quantity = 1) {
    // Inicialize cart como array global
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        cart.push({
            name,
            price,
            quantity,
            total: price * quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartModal();
}

// Adicione esta função para atualizar o contador do carrinho
function updateCartInfo() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCounter.innerText = cartCount;
}

// Atualizar a exibição do carrinho para mostrar quantidades
function updateCartModal() {
    cartItemsContainer.innerHTML = '';
    let totalAmount = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex items-center justify-between border-b border-gray-200 py-2';
        itemElement.innerHTML = `
            <div class="flex flex-col">
                <p class="font-bold">${item.name}</p>
                <div class="flex items-center gap-2 mt-1">
                    <div class="flex items-center bg-gray-100 rounded">
                        <button 
                            class="px-2 py-1 text-orange-600 cart-quantity-btn" 
                            data-action="decrease"
                            data-name="${item.name}"
                            aria-label="Diminuir quantidade">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="px-3">${item.quantity}</span>
                        <button 
                            class="px-2 py-1 text-orange-600 cart-quantity-btn" 
                            data-action="increase"
                            data-name="${item.name}"
                            aria-label="Aumentar quantidade">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <p class="text-sm">R$ ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
            <button class="remove-from-cart-btn text-red-500" data-name="${item.name}">
                <i class="fa fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(itemElement);
        totalAmount += item.price * item.quantity;
    });
    
    cartTotal.innerText = totalAmount.toFixed(2);
    updateCartInfo();
}

// Adicione este novo evento para controlar a quantidade no carrinho
cartItemsContainer.addEventListener("click", function(event) {
    const button = event.target.closest('.cart-quantity-btn');
    if (button) {
        const action = button.dataset.action;
        const name = button.dataset.name;
        const item = cart.find(item => item.name === name);
        
        if (item) {
            if (action === 'increase') {
                if (item.quantity < 10) {
                    item.quantity++;
                }
            } else if (action === 'decrease') {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    // Se a quantidade chegar a 0, remove o item
                    const index = cart.findIndex(cartItem => cartItem.name === name);
                    if (index !== -1) {
                        cart.splice(index, 1);
                    }
                }
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartModal();
        }
    }
});

// Adicione este evento para o botão de remover item
cartItemsContainer.addEventListener("click", function(event) {
    // Verifica se clicou no botão de remover
    const removeButton = event.target.closest('.remove-from-cart-btn');
    if (removeButton) {
        const name = removeButton.dataset.name;
        removeItemCart(name);
        
        // Mostra notificação de item removido
        Toastify({
            text: `${name} removido do carrinho!`,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: "#ef4444",
            }
        }).showToast();
    }
});

// Modifique a função removeItemCart para remover o item completamente
function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartModal();
    }
}

addressInput.addEventListener("input", function(event){
    let inputValue = event.target.value;

    if(inputValue !== ""){
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
})

// Finalizar pedido
checkoutBtn.addEventListener("click", function(){

    const isOpen = checkRestaurantOpen();
    if(!isOpen){
  
      Toastify({
        text: "Ops o restaurante está fechado!",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#ef4444",
        },
      }).showToast();
  
      return;
    }

    if(cart.length === 0) return;

    if(addressInput.value === ""){
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")
        return;
    }

    // Enviar o pedido para API do Whatsapp

    const cartItems = cart.map((item) => {
        return(
            ` ${item.name} 
            quantidade: (${item.quantity}) 
            Preço: R$${item.price}|`
        )

    }).join("")

    const message = encodeURIComponent(cartItems)
    const phone = "557981575934"

    window.open(`Https://wa.me/${phone}?text=${message} Nome: ${addressInput.value}`, "_blank")

    cart = [];
    updateCartModal();

})

// Verificação de funcionamento do restaurante
function checkRestaurantOpen(){
    const data = new Date();
    const hora = data.getHours();
    return hora >= 16 && hora < 22; 
    //true = Restaurante está aberto
}

const spanItem = document.getElementById("date-span")
const IsOpen = checkRestaurantOpen();

if(IsOpen){
    spanItem.classList.remove("bg-red-600");
    spanItem.classList.add("bg-green-600")
}else{
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-600");

}
