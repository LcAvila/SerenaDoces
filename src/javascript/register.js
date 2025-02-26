async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validações básicas
    if (!name || !email || !phone || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos');
        return false;
    }

    if (password !== confirmPassword) {
        alert('As senhas não coincidem');
        return false;
    }

    try {
        const response = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                phone
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Login automático após registro
            localStorage.setItem('user', JSON.stringify({
                ...data.user,
                isLoggedIn: true
            }));
            localStorage.setItem('token', data.token);

            alert('Cadastro realizado com sucesso!');
            window.location.href = 'index.html';
        } else {
            alert(data.error || 'Erro ao criar conta');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar conta. Por favor, tente novamente.');
    }
}

// Formatar telefone enquanto digita
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
        value = `(${value.slice(0,2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
        value = `${value.slice(0,9)}-${value.slice(9)}`;
    }
    
    e.target.value = value;
});

// Verificar se o usuário já está logado
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isLoggedIn) {
        window.location.href = 'index.html';
    }
}); 