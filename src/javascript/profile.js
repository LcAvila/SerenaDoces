document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está logado
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar dados do usuário
    loadUserData();
    loadAddresses();
    loadOrderHistory();
});

function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone;
}

function loadAddresses() {
    const addresses = JSON.parse(localStorage.getItem('addresses') || '[]');
    const container = document.getElementById('addressList');
    
    container.innerHTML = addresses.map((address, index) => `
        <div class="address-card">
            <p><strong>${address.title}</strong></p>
            <p>${address.street}, ${address.number}</p>
            <p>${address.neighborhood} - ${address.city}/${address.state}</p>
            <p>CEP: ${address.zipcode}</p>
            <div class="actions">
                <button class="btn-default" onclick="editAddress(${index})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-default" onclick="deleteAddress(${index})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

function loadOrderHistory() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const container = document.getElementById('orderHistory');
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span>Pedido #${order.id}</span>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-details">
                <p>Data: ${new Date(order.orderDate).toLocaleDateString()}</p>
                <p>Total: R$ ${order.total.toFixed(2)}</p>
                <p>Forma de pagamento: ${order.paymentMethod}</p>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
}

async function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    try {
        // Aqui você faria a chamada para a API
        const user = JSON.parse(localStorage.getItem('user'));
        user.name = name;
        user.phone = phone;
        localStorage.setItem('user', JSON.stringify(user));

        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar perfil');
    }
}

async function updatePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        alert('As senhas não coincidem');
        return;
    }

    try {
        // Aqui você faria a chamada para a API
        alert('Senha atualizada com sucesso!');
        event.target.reset();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar senha');
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
} 