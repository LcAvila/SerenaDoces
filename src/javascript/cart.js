// Carregar carrinho do localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || {items: [], total: 0};

// Função para adicionar item ao carrinho
function addToCart(id, name, price, image) {
    // Verificar se o item já existe no carrinho
    const existingItem = cart.items.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    // Atualizar total
    updateCartTotal();

    // Salvar no localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Atualizar interface
    updateCartUI();
    
    // Mostrar feedback
    showCartFeedback();
}

// Atualizar total do carrinho
function updateCartTotal() {
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Atualizar interface do carrinho
function updateCartUI() {
    // Atualizar contador de itens
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Atualizar lista de itens no modal
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) {
        cartItems.innerHTML = cart.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">R$ ${item.price.toFixed(2)}</p>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button onclick="updateItemQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateItemQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="removeItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Atualizar total no modal
        const cartTotal = document.querySelector('.cart-total');
        if (cartTotal) {
            cartTotal.innerHTML = `
                <span>Total:</span>
                <span>R$ ${cart.total.toFixed(2)}</span>
            `;
        }
    }
}

// Atualizar quantidade de um item
function updateItemQuantity(id, change) {
    const item = cart.items.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(0, item.quantity + change);
        if (item.quantity === 0) {
            removeItem(id);
        } else {
            updateCartTotal();
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }
    }
}

// Remover item do carrinho
function removeItem(id) {
    cart.items = cart.items.filter(item => item.id !== id);
    updateCartTotal();
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Mostrar feedback ao adicionar item
function showCartFeedback() {
    const cartFloating = document.querySelector('.cart-floating');
    if (cartFloating) {
        cartFloating.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartFloating.style.transform = 'scale(1)';
        }, 200);
    }
}

// Abrir modal do carrinho
function openCart() {
    const cartModal = document.querySelector('.cart-modal');
    if (cartModal) {
        cartModal.classList.add('active');
        updateCartUI();
    }
}

// Fechar modal do carrinho
function closeCart() {
    const cartModal = document.querySelector('.cart-modal');
    if (cartModal) {
        cartModal.classList.remove('active');
    }
}

// Ir para checkout
function goToCheckout() {
    if (cart.items.length === 0) {
        alert('Seu carrinho está vazio');
        return;
    }
    window.location.href = 'checkout.html';
}

// Inicializar carrinho quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();

    // Adicionar evento de clique no carrinho flutuante
    const cartFloating = document.querySelector('.cart-floating');
    if (cartFloating) {
        cartFloating.addEventListener('click', openCart);
    }

    // Adicionar evento de clique no botão de fechar
    const closeButton = document.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', closeCart);
    }
}); 