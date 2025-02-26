async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Salvar dados do usuário
            localStorage.setItem('user', JSON.stringify({
                ...data.user,
                isLoggedIn: true
            }));
            localStorage.setItem('token', data.token);

            // Verificar se tem carrinho pendente
            const cart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
            const returnUrl = cart.items.length > 0 ? 'checkout.html' : 'index.html';

            // Redirecionar
            window.location.href = returnUrl;
        } else {
            alert(data.error || 'Email ou senha incorretos');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao fazer login. Por favor, tente novamente.');
    }
}

// Verificar se o usuário já está logado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado'); // Debug log
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isLoggedIn) {
        window.location.href = 'index.html';
    }
}); 