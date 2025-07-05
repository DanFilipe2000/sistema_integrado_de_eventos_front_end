function sideMenuConfig() {
    const userRaw = localStorage.getItem('user');

    if (!userRaw) return;

    try {
        const user = JSON.parse(userRaw);
        const userType = user.type_user;
        const base64 = user.foto_perfil;

        // 1. Atualizar nome e email no menu
        const nomeEl = document.querySelector('#sidemenu-profile-name .name');
        const emailEl = document.querySelector('#sidemenu-profile-email .email');
        const perfil_image = document.querySelector('#sidemenu-user-image');

        if (base64) {
            perfil_image.src = base64;
        } else {
            perfil_image.src = './images/defaultuser.png';
        }

        if (nomeEl && user.name) {
            nomeEl.textContent = user.name;
        }

        if (emailEl && user.email) {
            emailEl.textContent = user.email;
        }

        // 2. Esconder todos os menus condicionais
        document.querySelectorAll('.only-participante, .only-expositor').forEach(el => {
            el.style.display = 'none';
        });

        // 3. Mostrar apenas os menus do tipo correto
        if (userType === 'participante') {
            document.querySelectorAll('.only-participante').forEach(el => {
                el.style.display = '';
            });
        } else if (userType === 'expositor') {
            document.querySelectorAll('.only-expositor').forEach(el => {
                el.style.display = '';
            });
        }

    } catch (e) {
        console.error('Erro ao processar o usuário do localStorage:', e);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    sideMenuConfig();
});