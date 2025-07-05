const rotaAtual = window.location.pathname;

const rotasValidas = ['/', '/welcome', '/login', '/register', '/event-add'];

function verifyPath() {
    if (rotaAtual === '/logout' && localStorage.getItem('user')) {
      localStorage.removeItem('user');
      alert('Você foi deslogado com sucesso!');
      window.location.href = '/welcome';
      return;
    }

    if (rotaAtual == "/" || rotaAtual === '/logout') {
        window.location.href = '/welcome';
        return;
    }

    if (rotasValidas.includes(rotaAtual)) {
        window.location.href = '/404';
        return;
    }
}

verifyPath();