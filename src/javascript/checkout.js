// Remover o require do QRCode já que estamos usando via CDN
// const QRCode = require('qrcode');

// Variáveis e funções globais
let cart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"total":0}');

// Função global de seleção de pagamento
window.selectPayment = function(method) {
    console.log('Método selecionado:', method);
    
    // Remover classe active de todos
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('active');
    });
    
    // Adicionar classe active ao selecionado
    const selectedMethod = document.querySelector(`#${method}`).closest('.payment-method');
    selectedMethod.classList.add('active');

    // Se for PIX, gerar o código
    if (method === 'pix') {
        console.log('Gerando PIX...');
        const total = cart.total || 0;
        generatePixCode(total);
    }
}

// Função para calcular CRC16
function crc16(str) {
    const crcTable = [];
    for (let i = 0; i < 256; i++) {
        let crc = i;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? ((crc >> 1) ^ 0xA001) : (crc >> 1);
        }
        crcTable[i] = crc;
    }

    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        crc = ((crc >> 8) ^ crcTable[(crc ^ c) & 0xFF]) & 0xFFFF;
    }
    return crc.toString(16).padStart(4, '0').toUpperCase();
}

// Função para formatar o tamanho do campo
function formatField(id, value) {
    const size = value.length.toString().padStart(2, '0');
    return id + size + value;
}

// Função global para gerar código PIX
function generatePixCode(value) {
    try {
        const qrcode = document.getElementById('qrcode');
        if (!qrcode) return;

        // Limpar área do QR Code
        qrcode.innerHTML = '';

        // Adicionar mensagem informativa
        const message = document.createElement('div');
        message.style.padding = '20px';
        message.style.textAlign = 'center';
        message.innerHTML = `
            <p style="margin-bottom: 10px;">Chave PIX (CNPJ):</p>
            <p style="font-weight: bold; font-size: 1.1em; margin-bottom: 20px;">37.632.857/0001-34</p>
            <p>Valor a pagar: <strong>R$ ${value.toFixed(2)}</strong></p>
        `;
        qrcode.appendChild(message);

        // Atualizar valor
        document.querySelector('.pix-value').textContent = `R$ ${value.toFixed(2)}`;
        document.getElementById('pixCode').value = "37632857000134";

    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função global para copiar código PIX
window.copyPixCode = function() {
    const pixCode = document.getElementById('pixCode');
    pixCode.select();
    document.execCommand('copy');
    
    const copyBtn = document.querySelector('.copy-pix');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.isLoggedIn) {
        // Salvar URL atual para retornar após o login
        localStorage.setItem('returnUrl', window.location.href);
        // Redirecionar para login
        window.location.href = 'login.html';
        return;
    }

    function displayCheckoutItems() {
        const container = document.querySelector('.checkout-items');
        if (cart.items.length === 0) {
            container.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
            return;
        }

        container.innerHTML = cart.items.map(item => `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <div class="item-title">${item.name}</div>
                    <div class="item-price">R$ ${item.price.toFixed(2)}</div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateItemQuantity('${item.id}', -1)">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateItemQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="removeItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        updateTotal();
    }

    function updateTotal() {
        cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        document.querySelector('.total-price').textContent = `R$ ${cart.total.toFixed(2)}`;
        
        // Atualizar também o valor no campo PIX se estiver visível
        const pixValue = document.querySelector('.pix-value');
        if (pixValue) {
            pixValue.textContent = `R$ ${cart.total.toFixed(2)}`;
        }
    }

    // Função global para atualizar quantidade
    window.updateItemQuantity = function(id, change) {
        const item = cart.items.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(0, item.quantity + change);
            if (item.quantity === 0) {
                removeItem(id);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCheckoutItems();
            }
        }
    }

    // Função global para remover item
    window.removeItem = function(id) {
        cart.items = cart.items.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCheckoutItems();

        // Se o carrinho ficar vazio, redirecionar para o cardápio
        if (cart.items.length === 0) {
            alert('Seu carrinho está vazio. Redirecionando para o cardápio...');
            window.location.href = 'cardapio.html';
        }
    }

    // Finalizar pedido
    document.querySelector('.complete-order').addEventListener('click', function() {
        const selectedMethod = document.querySelector('.payment-method.active');
        if (!selectedMethod) {
            alert('Por favor, selecione uma forma de pagamento');
            return;
        }

        if (cart.items.length === 0) {
            alert('Seu carrinho está vazio');
            return;
        }

        const paymentMethod = selectedMethod.querySelector('input').id;
        processPayment(paymentMethod);
    });

    function processPayment(method) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Criar objeto com informações do pedido
        const order = {
            items: cart.items,
            total: cart.total,
            paymentMethod: method,
            userEmail: user.email,
            orderDate: new Date().toISOString(),
            status: 'pending'
        };

        // Salvar pedido no localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        if (method === 'pix') {
            alert('Use o QR Code ou copie o código PIX para realizar o pagamento');
        } else {
            alert('Pedido realizado com sucesso! Em breve você receberá um email com mais informações.');
        }

        // Limpar carrinho após o pedido
        cart.items = [];
        cart.total = 0;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Inicializar a página
    displayCheckoutItems();
}); 