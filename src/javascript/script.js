$(document).ready(function() {
    $('#mobile_btn').on('click', function () {
        $('#mobile_menu').toggleClass('active');
        $('#mobile_btn').find('i').toggleClass('fa-x');
    });

    const sections = $('section');
    const navItems = $('.nav-item');

    $(window).on('scroll', function () {
        const header = $('header');
        const scrollPosition = $(window).scrollTop() - header.outerHeight();

        let activeSectionIndex = 0;

        if (scrollPosition <= 0) {
            header.css('box-shadow', 'none');
        } else {
            header.css('box-shadow', '5px 1px 5px rgba(0, 0, 0, 0.1');
        }

        sections.each(function(i) {
            const section = $(this);
            const sectionTop = section.offset().top - 96;
            const sectionBottom = sectionTop+ section.outerHeight();

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSectionIndex = i;
                return false;
            }
        })

        navItems.removeClass('active');
        $(navItems[activeSectionIndex]).addClass('active');
    });

    ScrollReveal().reveal('#cta', {
        origin: 'left',
        duration: 2000,
        distance: '20%'
    });

    ScrollReveal().reveal('.dish', {
        origin: 'left',
        duration: 2000,
        distance: '20%'
    });

    ScrollReveal().reveal('#testimonial_chef', {
        origin: 'left',
        duration: 1000,
        distance: '20%'
    })

    ScrollReveal().reveal('.feedback', {
        origin: 'right',
        duration: 1000,
        distance: '20%'
    })
});

function updateUserInterface() {
    const userNavItem = document.querySelector('.user-nav-item');
    if (!userNavItem) return;

    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.isLoggedIn) {
        // Atualizar conteúdo para usuário logado
        userNavItem.innerHTML = `
            <a href="#" class="user-button">
                <span id="navUserName">${user.name}</span>
                <i class="fas fa-chevron-down"></i>
            </a>
            <div class="user-menu">
                <div class="user-menu-header">
                    <span class="user-name" id="menuUserName">${user.name}</span>
                </div>
                <a href="profile.html"><i class="fas fa-user"></i> Meu Perfil</a>
                <a href="orders.html"><i class="fas fa-shopping-bag"></i> Meus Pedidos</a>
                <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Sair</a>
            </div>
        `;

        // Adicionar evento de clique para toggle do menu
        const userButton = userNavItem.querySelector('.user-button');
        const menu = userNavItem.querySelector('.user-menu');
        
        userButton.addEventListener('click', function(e) {
            e.preventDefault();
            userNavItem.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!userNavItem.contains(e.target)) {
                userNavItem.classList.remove('active');
                menu.classList.remove('active');
            }
        });
    } else {
        // Mostrar link de login para usuário não logado
        userNavItem.innerHTML = `
            <a href="login.html" class="login-link">
                <i class="fas fa-user"></i> Entrar
            </a>
        `;
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Função para inicializar a interface do usuário em todas as páginas
function initializeUserInterface() {
    // Atualizar interface do usuário
    updateUserInterface();

    // Adicionar listeners para o menu mobile em todas as páginas
    const mobileBtn = document.getElementById('mobile_btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function() {
            document.getElementById('mobile_menu').classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-x');
        });
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeUserInterface);

// Atualizar quando houver mudanças no localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'user') {
        updateUserInterface();
    }
});

// No evento de upload da foto
document.getElementById('photoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Criar uma imagem temporária para redimensionar
            const img = new Image();
            img.onload = function() {
                // Criar canvas para redimensionar
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Definir tamanho padrão (400x400)
                canvas.width = 400;
                canvas.height = 400;
                
                // Desenhar imagem redimensionada
                ctx.drawImage(img, 0, 0, 400, 400);
                
                // Converter para formato adequado
                const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
                
                // Atualizar todas as instâncias da foto
                document.getElementById('profilePhoto').src = resizedImage;
                document.getElementById('navUserPhoto').src = resizedImage;
                document.getElementById('menuUserPhoto').src = resizedImage;
                
                // Salvar no localStorage
                localStorage.setItem('profilePhoto', resizedImage);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});