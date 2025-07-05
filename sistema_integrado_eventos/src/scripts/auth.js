const rotasExpositor = ['/event-edit', '/event-add'];

function verificarTipoUsuario() {
    const userRaw = localStorage.getItem('user');

    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);

        console.log('Usuário autenticado:', user);

        if (user.type_user === 'participante') {
          window.location.href = '/home';
        }
      } catch (e) {
        console.error('Erro ao analisar o localStorage "user":', e);
      }
    } else {
      window.location.href = '/welcome';
    }
}

function autenticarUsuario() {
    const userRaw = localStorage.getItem('user');

    if (!userRaw) {
        window.location.href = '/welcome';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    autenticarUsuario();

    const rotaAtual = window.location.pathname;

    console.log("Rota atual:", rotaAtual);

    if (rotasExpositor.includes(rotaAtual)) {
        verificarTipoUsuario();
    }
});